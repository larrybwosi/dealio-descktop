#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::{AppHandle, Emitter};
use hidapi::HidApi;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

#[tauri::command]
async fn detect_barcode_scanner(app_handle: AppHandle) -> Result<(), String> {
    let vid = 0x1234; // Replace with actual Vendor ID
    let pid = 0x5678; // Replace with actual Product ID

    let api = HidApi::new().map_err(|e| format!("Error initializing HID API: {}", e))?;
    let mut device_found = false;

    for device_info in api.device_list() {
        if device_info.vendor_id() == vid && device_info.product_id() == pid {
            device_found = true;
            let device = device_info
                .open_device(&api)
                .map_err(|e| format!("Error opening device: {}", e))?;
            println!("Barcode scanner found & opened successfully.");

            // Spawn task to read from device
            tauri::async_runtime::spawn(async move {
                let mut mem_buf = vec![0u8; 256]; // Adjust size based on scanner specs
                loop {
                    match device.read_timeout(&mut mem_buf, 1000) {
                        Ok(count) if count > 0 => {
                            let data = String::from_utf8_lossy(&mem_buf[..count]).to_string();
                            if let Err(e) = app_handle.emit("scanner-data", Payload { message: data }) {
                                eprintln!("Failed to emit event: {}", e);
                            }
                        }
                        Ok(_) => continue,
                        Err(e) => {
                            eprintln!("Error reading from HID device: {}", e);
                            break;
                        }
                    }
                }
            });
            return Ok(());
        }
    }

    if !device_found {
        return Err("Barcode scanner not found.".to_string());
    }
    Ok(())
}

pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_hid::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![detect_barcode_scanner]);

    #[cfg(desktop)]
    {
        use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
        use tauri_plugin_single_instance;

        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
                println!("New app instance opened with args: {:?}", argv);
                // Optionally emit event to frontend
                let _ = app.emit("new-instance", Payload {
                    message: format!("New instance with args: {:?}", argv),
                });
            }))
            .plugin(tauri_plugin_autostart::init(
                MacosLauncher::LaunchAgent,
                Some(vec!["--flag1", "--flag2"]),
            ));

        builder = builder.setup(|app| {
            let autostart_manager = app.autolaunch();
            if let Err(e) = autostart_manager.enable() {
                eprintln!("Failed to enable autostart: {}", e);
                let _ = app.emit("autostart-error", Payload {
                    message: format!("Failed to enable autostart: {}", e),
                });
            }
            Ok(())
        });
    }

    if let Err(e) = builder.run(tauri::generate_context!()) {
        eprintln!("Failed to run Tauri application: {}", e);
        std::process::exit(1);
    }
}
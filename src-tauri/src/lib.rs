use tauri_plugin_printer_v2::init;
use tauri_plugin_sentry::{minidump, sentry};
use tauri_plugin_updater::UpdaterExt;

use hidapi::HidApi;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::{AppHandle, Emitter};

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

// This new function will run in the background to listen for scanner input. emit
fn start_scanner_listener(app_handle: AppHandle) {
    // We run the scanner detection in a separate asynchronous task.
    tauri::async_runtime::spawn(async move {
        let api = match HidApi::new() {
            Ok(api) => api,
            Err(e) => {
                eprintln!("[Scanner] Error initializing HID API: {}", e);
                return;
            }
        };

        // REPLACED WITH YOUR ACTUAL VENDOR AND PRODUCT IDs
        let vid = 0xE851;  // Changed from 0x1234
        let pid = 0x2100;  // Changed from 0x5678

        println!("[Scanner] Looking for devices with VID: {:04X}, PID: {:04X}", vid, pid);

        for device_info in api.device_list() {
            if device_info.vendor_id() == vid && device_info.product_id() == pid {
                println!(
                    "[Scanner] Found a matching device: {:?}",
                    device_info.product_string()
                );

                let device = match device_info.open_device(&api) {
                    Ok(d) => d,
                    Err(e) => {
                        eprintln!("[Scanner] Could not open device: {}", e);
                        continue; // Skip to the next device
                    }
                };

                let app_handle_clone = app_handle.clone();

                // Spawn a new task for each detected scanner to handle them concurrently.
                tauri::async_runtime::spawn(async move {
                    // This parser assumes the scanner sends raw text ending with a newline.
                    // This is a common configuration for HID scanners.
                    let mut barcode = String::new();
                    let mut buf = [0u8; 64];

                    loop {
                        match device.read_timeout(&mut buf, 1000) {
                            Ok(bytes_read) => {
                                if bytes_read > 0 {
                                    let data_str = String::from_utf8_lossy(&buf[..bytes_read]);

                                    if data_str.contains('\n') {
                                        let parts: Vec<&str> = data_str.split('\n').collect();
                                        barcode.push_str(parts[0]);

                                        let final_barcode = barcode.trim().to_string();
                                        if !final_barcode.is_empty() {
                                            println!(
                                                "[Scanner] Scanned barcode: {}",
                                                &final_barcode
                                            );
                                            if let Err(e) = app_handle_clone.emit(
                                                "scanner-data",
                                                Payload {
                                                    message: final_barcode,
                                                },
                                            ) {
                                                eprintln!("[Scanner] Failed to emit event: {}", e);
                                            }
                                        }

                                        // Reset for the next scan.
                                        barcode.clear();
                                        if parts.len() > 1 {
                                            barcode.push_str(parts[1]);
                                        }
                                    } else {
                                        barcode.push_str(&data_str);
                                    }
                                }
                            }
                            Err(e) => {
                                eprintln!("[Scanner] Error reading from HID device: {}. Listener stopped.", e);
                                break;
                            }
                        }
                    }
                });
            }
        }

        println!("[Scanner] Finished scanning for devices. No matching devices found with VID: {:04X}, PID: {:04X}", vid, pid);
    });
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded = 0;

        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("downloaded {downloaded} from {content_length:?}");
                },
                || {
                    println!("download finished");
                },
            )
            .await?;

        println!("update installed");
        app.restart();
    }

    Ok(())
}

pub fn run() {
    // Initialize Sentry client
    let client = sentry::init((
        "https://09dd798f5d3f6a3dda0562f8882d6eb2@o4508136465956864.ingest.de.sentry.io/4509293615710288",
        sentry::ClientOptions {
            release: sentry::release_name!(),
            auto_session_tracking: true,
            ..Default::default()
        },
    ));

    // Caution! Everything before here runs in both app and crash reporter processes
    #[cfg(not(target_os = "ios"))]
    let _guard = minidump::init(&client);
    // Everything after here runs in only the app process

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_sentry::init(&client))
        .plugin(tauri_plugin_os::init())
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
        .plugin(init());

    #[cfg(desktop)]
    {
        use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
        use tauri_plugin_single_instance;

        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
                println!("New app instance opened with args: {:?}", argv);
                let _ = app.emit(
                    "new-instance",
                    Payload {
                        message: format!("New instance with args: {:?}", argv),
                    },
                );
            }))
            .plugin(tauri_plugin_autostart::init(
                MacosLauncher::LaunchAgent,
                Some(vec!["--flag1", "--flag2"]),
            ));

        builder = builder.setup(|app| {
            let handle = app.handle().clone();

            // Clone handle for the async task
            let update_handle = handle.clone();
            
            // Start the update check in the background
            tauri::async_runtime::spawn(async move {
                if let Err(e) = update(update_handle).await {
                    eprintln!("Update check failed: {}", e);
                }
            });

            // Start the scanner listener
            start_scanner_listener(handle.clone());

            let autostart_manager = app.autolaunch();
            if let Err(e) = autostart_manager.enable() {
                eprintln!("Failed to enable autostart: {}", e);
                let _ = app.emit(
                    "autostart-error",
                    Payload {
                        message: format!("Failed to enable autostart: {}", e),
                    },
                );
            }
            Ok(())
        });
    }

    // For non-desktop platforms (mobile)
    #[cfg(not(desktop))]
    {
        builder = builder.setup(|app| {
            let handle = app.handle().clone();

            // Clone handle for the async task
            let update_handle = handle.clone();
            
            // Start the update check in the background (if supported on mobile)
            tauri::async_runtime::spawn(async move {
                if let Err(e) = update(update_handle).await {
                    eprintln!("Update check failed: {}", e);
                }
            });

            Ok(())
        });
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running Dealio");
}
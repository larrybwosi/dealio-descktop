#[cfg_attr(mobile, tauri::mobile_entry_point)]
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
        .plugin(tauri_plugin_clipboard_manager::init());

    #[cfg(desktop)]
    {
        use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
        use tauri_plugin_single_instance;

        builder = builder
            .plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
                println!("New app instance opened with args: {:?}", argv);
            }))
            .plugin(tauri_plugin_autostart::init(
                MacosLauncher::LaunchAgent,
                Some(vec!["--flag1", "--flag2"]),
            ));
        
        builder = builder.setup(|app| {
            let autostart_manager = app.autolaunch();
            if let Err(e) = autostart_manager.enable() {
                eprintln!("Failed to enable autostart: {}", e);
            }
            Ok(())
        });
    }

    builder
        .run(tauri::generate_context!())
        .expect("Error running Tauri application");
}
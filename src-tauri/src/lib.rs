mod sidecar;

use std::sync::Mutex;

use tauri::{
  menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
  Manager, RunEvent,
};

use crate::sidecar::Sidecar;

/// App-level state holding the live sidecar handle. Wrapped in a
/// `Mutex<Option<...>>` so the `RunEvent::ExitRequested` handler
/// can take ownership and drop it (which kills the child process).
struct SidecarState(Mutex<Option<Sidecar>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let app = tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Tauri's `Menu::default()` populates the standard macOS app
      // menu (App / File / Edit / View / Window / Help) with the
      // platform's expected accelerators (Cmd+Q, Cmd+W, Cmd+M,
      // Edit→Copy/Paste/etc.). We append a "Toggle Developer Tools"
      // item to the View submenu so `Cmd+Option+I` works without
      // dropping any of the defaults — replacing the whole menu
      // (as we did before) silently broke Cmd+Q on macOS.
      let handle = app.handle();
      let toggle_devtools = MenuItem::with_id(
        handle,
        "toggle-devtools",
        "Toggle Developer Tools",
        true,
        Some(if cfg!(target_os = "macos") {
          "Cmd+Option+I"
        } else {
          "Ctrl+Shift+I"
        }),
      )?;
      let view_menu = Submenu::with_items(
        handle,
        "View",
        true,
        &[
          &PredefinedMenuItem::fullscreen(handle, None)?,
          &PredefinedMenuItem::separator(handle)?,
          &toggle_devtools,
        ],
      )?;
      let menu = Menu::default(handle)?;
      menu.append(&view_menu)?;
      app.set_menu(menu)?;
      app.on_menu_event(|app, event| {
        if event.id() == "toggle-devtools" {
          if let Some(window) = app.get_webview_window("main") {
            if window.is_devtools_open() {
              window.close_devtools();
            } else {
              window.open_devtools();
            }
          }
        }
      });

      // In dev (`tauri dev`), Tauri loads `devUrl` (the Vite dev
      // server on :5173) directly. Skip the sidecar in that mode —
      // Vite already serves SvelteKit's API routes via its own
      // middleware.
      if cfg!(debug_assertions) {
        app.manage(SidecarState(Mutex::new(None)));
        return Ok(());
      }

      // Production: spawn the SvelteKit Node server and navigate
      // the (already-built) main window to it.
      let handle = app.handle().clone();
      let sidecar = Sidecar::spawn(&handle)
        .map_err(|e| Box::<dyn std::error::Error>::from(e.to_string()))?;

      if let Some(window) = app.get_webview_window("main") {
        let url = sidecar
          .url()
          .parse::<tauri::Url>()
          .map_err(|e| Box::<dyn std::error::Error>::from(e.to_string()))?;
        window
          .navigate(url)
          .map_err(|e| Box::<dyn std::error::Error>::from(e.to_string()))?;
      }

      app.manage(SidecarState(Mutex::new(Some(sidecar))));
      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application");

  app.run(|handle, event| {
    if matches!(event, RunEvent::ExitRequested { .. } | RunEvent::Exit) {
      if let Some(state) = handle.try_state::<SidecarState>() {
        if let Ok(mut guard) = state.0.lock() {
          guard.take();
        }
      }
    }
  });
}

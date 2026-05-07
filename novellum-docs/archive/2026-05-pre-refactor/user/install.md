# Installing Novellum

Novellum is a desktop application for macOS and Windows. This guide walks you through downloading and installing the app on your computer, from first download to the onboarding screen.

---

## System Requirements

| Platform | Minimum Version |
| :--- | :--- |
| macOS | macOS 12 Monterey or later |
| Windows | Windows 10 (64-bit) or later |

Novellum does **not** require an internet connection to run. An internet connection is only needed if you choose to use the optional AI writing assistant.

---

## macOS Installation

### 1. Download the installer

Go to the [Novellum releases page](https://github.com/novellum/releases) and download the latest **Novellum-x.x.x-macOS.dmg** file.

### 2. Open the disk image

Double-click the downloaded `.dmg` file. A window will open showing the Novellum app icon and a shortcut to your Applications folder.

### 3. Drag to Applications

Drag the **Novellum.app** icon onto the **Applications** folder icon. macOS will copy the app. This takes a few seconds.

### 4. Handle the Gatekeeper prompt

Because Novellum is distributed outside the Mac App Store, macOS Gatekeeper may display a warning the first time you open the app:

> *"Novellum cannot be opened because it is from an unidentified developer."*

To allow Novellum to open:

1. Open **System Settings** → **Privacy & Security**.
2. Scroll down to the **Security** section.
3. You will see a message: *"Novellum was blocked."* Click **Open Anyway**.
4. Enter your Mac password if prompted.

Alternatively, right-click (or Control-click) the app in Finder and choose **Open** from the context menu. A dialog will appear with an **Open** button that bypasses Gatekeeper for this one launch.

You will only need to do this once. After approving the app, it will open normally every time.

### 5. First launch

Open Novellum from your Applications folder (or Launchpad). On first launch, the app creates a local database in:

```text
~/Library/Application Support/Novellum/
```

This is where all your projects are stored. You can find this folder in Finder by pressing **Cmd+Shift+G** and pasting the path.

### 6. Complete the onboarding flow

The first time the app opens, you will see the Novellum onboarding screen. Follow the prompts to:

- Set your author name
- Review your data storage location
- Optionally configure your AI API key (you can skip this and do it later in Settings → AI)

After completing onboarding, you will land on the **Project Hub** where you can create your first project.

---

## Windows Installation

### 1. Download the Windows installer

Go to the [Novellum releases page](https://github.com/novellum/releases) and download the latest **Novellum-x.x.x-Windows-Setup.exe** installer.

### 2. Handle the SmartScreen prompt

Windows SmartScreen may display a warning because Novellum is not yet widely known to Microsoft's systems:

> *"Windows protected your PC — Microsoft Defender SmartScreen prevented an unrecognized app from starting."*

Click **More info** and then **Run anyway** to proceed. You may need administrator privileges.

### 3. Run the installer

Double-click the downloaded `.exe` file and follow the installer prompts:

1. Accept the license agreement.
2. Choose an installation directory (the default is fine for most users).
3. Click **Install**.
4. Click **Finish** when the installation completes.

The installer will optionally create a desktop shortcut.

### 4. First launch

Launch Novellum from the Start menu or your desktop shortcut. On first launch, the app creates a local database in:

```text
%APPDATA%\Novellum\
```

You can open this folder by pressing **Win+R**, typing `%APPDATA%\Novellum`, and pressing Enter.

### 5. Complete the onboarding flow

The onboarding screen will guide you through initial setup, just as described in the macOS section above.

---

## Verifying a Successful Installation

After completing onboarding, you should see the **Project Hub** — a screen with a **New Project** button and an empty project list. If you see this screen, Novellum is installed and ready to use.

If the app fails to open or crashes on launch, check that your operating system meets the minimum version requirements listed above.

---

## Uninstalling Novellum

Uninstalling Novellum removes the application but **does not delete your projects**. Your data lives in the application-support folder described above and is never touched by the uninstaller. If you want to permanently delete your data, you must manually delete that folder after uninstalling the app.

- **macOS**: Drag **Novellum.app** from Applications to the Trash.
- **Windows**: Open **Settings → Apps → Installed Apps**, find Novellum, and click **Uninstall**.

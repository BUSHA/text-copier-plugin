# Text copier Chrome extension

## Overview
The "Text copier" is a simple Chrome extension that allows users to easily copy any visible text on a webpage by simply clicking on it. It provides visual feedback through highlighting and a toast notification upon successful copying.

## Features
* **Click to Copy**: Copy any text on a webpage with a single click.
* **Visual Highlight**: Elements with text are highlighted when hovered over, indicating they can be copied.
* **Toast Notification**: A small toast message appears at the bottom of the screen to confirm that the text has been copied.
* **Toggle On/Off**: Activate or deactivate the plugin by clicking its icon in the Chrome toolbar. The icon changes to reflect the plugin's status (active/inactive).
* **Link Handling**: Prevents default link behavior when clicking on text within a link, ensuring the text is copied instead of navigating away.

## Installation
To install this Chrome extension:

1.  **Download the repository**
2.  **Open Chrome Extensions**: Go to `chrome://extensions/` in your Chrome browser.
3.  **Enable Developer Mode**: Toggle on "Developer mode" in the top right corner.
4.  **Load Unpacked**: Click on the "Load unpacked" button.
5.  **Select Folder**: Navigate to and select the directory where you downloaded the extension files (the `text-copier-plugin` folder).
6.  The extension should now appear in your list of extensions and its icon will be visible in your browser toolbar.

## How to Use
1.  **Activate the Plugin**: Click on the "Text copier" icon in your Chrome toolbar. The icon will change to indicate it's active.
2.  **Hover over Text**: Move your mouse over any text content on a webpage. The text will be highlighted.
3.  **Click to Copy**: Click on the highlighted text you wish to copy.
4.  **Confirmation**: A toast notification will briefly appear at the bottom of the screen confirming the text has been copied to your clipboard.
5.  **Deactivate**: Click the "Text copier" icon again to deactivate the plugin if you no longer need it.

## Permissions
The extension requires the following permissions:
* `activeTab`: Allows the extension to interact with the currently active tab.
* `scripting`: Allows the extension to inject and execute scripts into web pages.

## Project Structure
* `manifest.json`: Defines the extension's properties, permissions, and background script.
* `background.js`: Manages the extension's state (active/inactive), updates the toolbar icon, and injects content scripts.
* `content.js`: Contains the core logic for handling mouse events, copying text, and displaying toast notifications on the webpage.
* `styles.css`: Provides the CSS for the text highlighting and the toast notification.
* `icons/`: (Expected directory) Contains the various sizes of icons used for the extension in active and inactive states.

## Screenshots
*(Consider adding screenshots here to visually demonstrate the highlighting and toast notification)*

## Contributing
Feel free to fork the repository, make improvements, and submit pull requests.

## License
This project is open-source. (Consider adding a specific license, e.g., MIT, if desired).

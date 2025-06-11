// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton');
    let isPluginActive = false;

    // Get initial status of the plugin from background script
    chrome.runtime.sendMessage({ action: "getPluginStatus" }, (response) => {
        if (response) {
            isPluginActive = response.isActive;
            updateButtonState();
        }
    });

    function updateButtonState() {
        if (isPluginActive) {
            toggleButton.textContent = "Deactivate";
            toggleButton.classList.remove('inactive-btn');
            toggleButton.classList.add('active-btn');
        } else {
            toggleButton.textContent = "Activate";
            toggleButton.classList.remove('active-btn');
            toggleButton.classList.add('inactive-btn');
        }
    }

    toggleButton.addEventListener('click', () => {
        isPluginActive = !isPluginActive;
        updateButtonState();

        // 1. Update status in background script
        chrome.runtime.sendMessage({ action: "togglePlugin", isActive: isPluginActive }, (response) => {
            console.log(response.status);
        });

        // 2. Get the active tab and inject/send message
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                const tabId = tabs[0].id;
                console.log("Current active tab ID:", tabId);

                if (isPluginActive) {
                    // If activating, inject content script first
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content.js']
                    }).then(() => {
                        console.log("Content script injected into tab:", tabId);
                        // Then send message to activate the copier
                        chrome.tabs.sendMessage(tabId, { action: "activateCopier" }).catch(error => {
                            console.error("Error sending activate message:", error);
                        });
                    }).catch(error => {
                        console.error("Error injecting content script:", error);
                        // Handle case where content script might already be there, but we still need to send activation message
                        // Or if there's a permission issue.
                        chrome.tabs.sendMessage(tabId, { action: "activateCopier" }).catch(error => {
                            console.error("Error sending activate message (fallback):", error);
                        });
                    });
                } else {
                    // If deactivating, just send message to content script
                    chrome.tabs.sendMessage(tabId, { action: "deactivateCopier" }).catch(error => {
                        console.error("Error sending deactivate message:", error);
                        // This catch is important if content script was never injected or tab was reloaded
                    });
                }
            }
        });
    });
});
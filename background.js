let isPluginActive = false

function updateIcon() {
  if (isPluginActive) {
    chrome.action.setIcon({
      path: {
        16: "icons/icon16_active.png",
        48: "icons/icon48_active.png",
        128: "icons/icon128_active.png",
      },
    })
    chrome.action.setTitle({ title: "Text Copier (Активно)" })
  } else {
    chrome.action.setIcon({
      path: {
        16: "icons/icon16.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png",
      },
    })
    chrome.action.setTitle({ title: "Text Copier (Неактивно)" })
  }
}

updateIcon()

chrome.action.onClicked.addListener(async (tab) => {
  isPluginActive = !isPluginActive
  updateIcon()

  const tabId = tab.id
  const tabUrl = tab.url

  if (
    tabUrl.startsWith("chrome://") ||
    tabUrl.startsWith("about:") ||
    tabUrl.startsWith("file://")
  ) {
    isPluginActive = !isPluginActive
    updateIcon()
    return
  }

  if (isPluginActive) {
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["styles.css"],
      })
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["content.js"],
      })
      await chrome.tabs.sendMessage(tabId, { action: "activateCopier" })
    } catch (e) {
      // нічого не робимо
    }
  } else {
    try {
      await chrome.tabs.sendMessage(tabId, { action: "deactivateCopier" })
    } catch (e) {
      // нічого не робимо
    }
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPluginStatus") {
    sendResponse({ isActive: isPluginActive })
  }
  return true
})

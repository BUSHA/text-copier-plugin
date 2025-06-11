// background.js
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

chrome.action.onClicked.addListener((tab) => {
  isPluginActive = !isPluginActive
  updateIcon()

  const tabId = tab.id
  const tabUrl = tab.url

  if (
    tabUrl.startsWith("chrome://") ||
    tabUrl.startsWith("about:") ||
    tabUrl.startsWith("file://")
  ) {
    console.warn(
      "Cannot activate Text Copier on restricted browser pages (chrome://, about:, file://)."
    )
    isPluginActive = !isPluginActive
    updateIcon()
    return
  }

  if (isPluginActive) {
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        files: ["styles.css"],
      })
      .then(() => {
        return chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"],
        })
      })
      .then(() => {
        chrome.tabs
          .sendMessage(tabId, { action: "activateCopier" })
          .catch((error) => {
            console.error("Error sending activate message:", error)
          })
      })
      .catch((error) => {
        console.warn(
          "Could not inject scripts (maybe already injected or permission issue):",
          error
        )
        chrome.tabs
          .sendMessage(tabId, { action: "activateCopier" })
          .catch((error) => {
            console.error("Error sending activate message (fallback):", error)
          })
      })
  } else {
    chrome.tabs
      .sendMessage(tabId, { action: "deactivateCopier" })
      .catch((error) => {
        console.error("Error sending deactivate message:", error)
      })
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPluginStatus") {
    sendResponse({ isActive: isPluginActive })
  }
  return true
})

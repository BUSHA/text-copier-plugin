// background.js
let isPluginActive = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "togglePlugin") {
    isPluginActive = request.isActive;
    console.log("Plugin toggled to:", isPluginActive);
    sendResponse({ status: "Plugin state updated in background" });
  } else if (request.action === "getPluginStatus") {
    sendResponse({ isActive: isPluginActive });
  }
  // Important: return true to indicate you will send a response asynchronously
  return true; // For async responses
});
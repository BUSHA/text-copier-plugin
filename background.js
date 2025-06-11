// background.js
let isPluginActive = false;

// Функція для оновлення значка
function updateBadge() {
  if (isPluginActive) {
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" }); // Зелений колір
    chrome.action.setTitle({ title: "Text Copier (Активно)" }); // Підказка при наведенні
  } else {
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: "#f44336" }); // Червоний колір
    chrome.action.setTitle({ title: "Text Copier (Неактивно)" }); // Підказка при наведенні
  }
}

// Встановлюємо початковий стан значка при завантаженні Service Worker
updateBadge();

// Слухаємо кліки по іконці плагіна
chrome.action.onClicked.addListener((tab) => {
  // Перемикаємо стан плагіна
  isPluginActive = !isPluginActive;
  updateBadge(); // Оновлюємо бейдж відповідно до нового стану

  const tabId = tab.id;
  const tabUrl = tab.url;

  console.log("Plugin icon clicked. New state:", isPluginActive);
  console.log("Current active tab ID:", tabId, "URL:", tabUrl);

  // Перевірка на обмежені URL-адреси
  if (tabUrl.startsWith('chrome://') || tabUrl.startsWith('about:') || tabUrl.startsWith('file://')) {
    console.warn("Cannot activate Text Copier on restricted browser pages (chrome://, about:, file://).");
    isPluginActive = !isPluginActive; // Повертаємо стан назад
    updateBadge(); // Оновлюємо бейдж назад
    return; // Виходимо
  }

  // Надсилаємо повідомлення content.js та styles.css
  if (isPluginActive) {
    // Спочатку ін'єктуємо CSS, потім JS
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['styles.css'] // <--- СПОЧАТКУ ІН'ЄКТУЄМО CSS
    }).then(() => {
        console.log("Styles injected into tab:", tabId);
        return chrome.scripting.executeScript({ // <--- ПОТІМ ІН'ЄКТУЄМО JS
            target: { tabId: tabId },
            files: ['content.js']
        });
    }).then(() => {
      console.log("Content script injected into tab:", tabId);
      chrome.tabs.sendMessage(tabId, { action: "activateCopier" }).catch(error => {
        console.error("Error sending activate message:", error);
      });
    }).catch(error => {
      console.warn("Could not inject scripts (maybe already injected or permission issue):", error);
      // Якщо скрипт вже ін'єктований (наприклад, після перезавантаження сторінки)
      // просто надсилаємо повідомлення про активацію
      chrome.tabs.sendMessage(tabId, { action: "activateCopier" }).catch(error => {
        console.error("Error sending activate message (fallback):", error);
      });
    });
  } else {
    // Якщо деактивуємо, просто надсилаємо повідомлення про деактивацію
    chrome.tabs.sendMessage(tabId, { action: "deactivateCopier" }).catch(error => {
      console.error("Error sending deactivate message:", error);
    });
  }
});

// Цей слухач для messages з popup.js більше не потрібен, якщо popup.html видалено
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPluginStatus") {
    sendResponse({ isActive: isPluginActive });
  }
  return true; // For async responses
});
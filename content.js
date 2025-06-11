// Function to show toast notification
function showToast(message) {
    const toastId = 'chrome-text-copier-toast';
    let toast = document.getElementById(toastId);

    if (!toast) {
        toast = document.createElement('div');
        toast.id = toastId;
        toast.classList.add('chrome-text-copier-toast');
        document.body.appendChild(toast);

        // Inject styles
        const style = document.createElement('style');
        style.textContent = `
            .chrome-text-copier-toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                font-family: sans-serif;
                z-index: 99999;
                opacity: 0;
                transition: opacity 0.5s ease-in-out;
            }
            .chrome-text-copier-toast.show {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000); // Hide after 2 seconds
}

let originalBackgroundColor = '';

function handleMouseOver(event) {
    const target = event.target;
    // Check if the target is a text node or contains text
    if (target.nodeType === Node.ELEMENT_NODE && target.textContent.trim().length > 0) {
        originalBackgroundColor = target.style.backgroundColor;
        target.style.backgroundColor = 'yellow'; // Highlight color
    }
}

function handleMouseOut(event) {
    const target = event.target;
    if (target.nodeType === Node.ELEMENT_NODE && target.textContent.trim().length > 0) {
        target.style.backgroundColor = originalBackgroundColor;
    }
}

function handleClick(event) {
    const target = event.target;
    const textToCopy = target.textContent.trim();

    // Перевіряємо, чи є цільовий елемент посиланням (або його батьківський елемент)
    // Шукаємо найближчий батьківський елемент, який є посиланням
    const closestLink = target.closest('a');

    if (closestLink) {
        // Якщо це посилання, зупиняємо дію за замовчуванням (перехід за посиланням)
        event.preventDefault();
        event.stopPropagation(); // Додатково зупиняємо поширення події
        console.log("Клік по посиланню, зупинено перехід.");
    }

    if (textToCopy.length > 0) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Скорочуємо текст для тосту, якщо він занадто довгий
                const displayCopiedText = textToCopy.length > 50 ?
                    textToCopy.substring(0, 50) + '...' :
                    textToCopy;
                showToast(`Текст "${displayCopiedText}" скопійовано!`);
            })
            .catch(err => {
                console.error('Не вдалося скопіювати текст:', err);
                showToast('Не вдалося скопіювати текст!');
            });
    }
    // Remove highlighting after click (ensure it applies to the target)
    // Make sure originalBackgroundColor is correctly stored for the target or re-evaluated
    if (target.nodeType === Node.ELEMENT_NODE && target.textContent.trim().length > 0) {
        target.style.backgroundColor = ''; // Або поверніть оригінальний колір, якщо ви його зберігаєте для кожного елемента
                                           // Простіше скинути, якщо немає складної логіки для збереження індивідуальних кольорів
    }
}

// Function to attach/detach event listeners
function toggleEventListeners(attach) {
    if (attach) {
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
        document.addEventListener('click', handleClick);
    } else {
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
        document.removeEventListener('click', handleClick);
    }
}

// Listen for messages from background script to activate/deactivate
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "activateCopier") {
        console.log("Content script received activate signal.");
        toggleEventListeners(true);
        sendResponse({ status: "Copier activated" });
    } else if (request.action === "deactivateCopier") {
        console.log("Content script received deactivate signal.");
        toggleEventListeners(false);
        sendResponse({ status: "Copier deactivated" });
    }
    // Important: return true to indicate you will send a response asynchronously
    return true; // For async responses
});

// Initial check: if content script is loaded directly, activate it.
// This handles cases where the plugin is already active when a new page loads.
chrome.runtime.sendMessage({ action: "getPluginStatus" }, (response) => {
    if (response && response.isActive) {
        toggleEventListeners(true);
    }
});
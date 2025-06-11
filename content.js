// Function to show toast notification
function showToast(message) {
    const toastId = 'chrome-text-copier-toast';
    let toast = document.getElementById(toastId);

    if (!toast) {
        toast = document.createElement('div');
        toast.id = toastId;
        toast.classList.add('chrome-text-copier-toast');
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000); // Hide after 2 seconds
}

let originalBackgroundColor = '';
let highlightedElement = null; // Для відстеження елемента, який зараз підсвічений

function handleMouseOver(event) {
    const target = event.target;
    if (target.nodeType === Node.ELEMENT_NODE && target.textContent.trim().length > 0 && !target.closest('#chrome-text-copier-toast')) {
        // Якщо вже є підсвічений елемент, і це не поточний, скидаємо його
        if (highlightedElement && highlightedElement !== target) {
            highlightedElement.classList.remove('chrome-text-copier-highlight'); // ВИДАЛЯЄМО КЛАС
        }

        target.classList.add('chrome-text-copier-highlight'); // ДОДАЄМО КЛАС
        highlightedElement = target; // Запам'ятовуємо цей елемент як підсвічений
    }
}

function handleMouseOut(event) {
    const target = event.target;
    if (target.nodeType === Node.ELEMENT_NODE && target.textContent.trim().length > 0 && !target.closest('#chrome-text-copier-toast')) {
        if (highlightedElement === target) { // Перевіряємо, чи це той самий елемент, що був підсвічений
            target.classList.remove('chrome-text-copier-highlight'); // ВИДАЛЯЄМО КЛАС
            highlightedElement = null; // Скидаємо посилання на підсвічений елемент
        }
    }
}

function handleClick(event) {
    const target = event.target;
    const textToCopy = target.textContent.trim();

    const closestLink = target.closest('a');
    if (closestLink) {
        event.preventDefault();
        event.stopPropagation();
        console.log("Клік по посиланню, зупинено перехід та поширення події.");
    }

    if (textToCopy.length > 0) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                const displayCopiedText = textToCopy.length > 50 ?
                    textToCopy.substring(0, 50) + '...' :
                    textToCopy;
                showToast(`Text "${displayCopiedText}" Copied!`);
            })
            .catch(err => {
                console.error('Could not copy text:', err);
                showToast('Could not copy text!');
            });
    }
    // Скидаємо підсвічування після кліку
    if (highlightedElement === target) {
        target.classList.remove('chrome-text-copier-highlight'); // ВИДАЛЯЄМО КЛАС
        highlightedElement = null;
    }
}


// Функція для скидання підсвічування з будь-якого активного елемента
function clearHighlight() {
    if (highlightedElement) {
        highlightedElement.classList.remove('chrome-text-copier-highlight'); // ВИДАЛЯЄМО КЛАС
        highlightedElement = null; // Очищаємо посилання
    }
}


// Function to attach/detach event listeners
function toggleEventListeners(attach) {
    if (attach) {
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
        // Використовуємо useCapture = true для handleClick, щоб перехопити подію на етапі захоплення
        document.addEventListener('click', handleClick, true);
    } else {
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
        document.removeEventListener('click', handleClick, true);
        clearHighlight(); // Викликаємо цю функцію при деактивації, щоб очистити підсвічування
    }
}

// Listen for messages from background script to activate/deactivate
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "activateCopier") {
        toggleEventListeners(true);
        sendResponse({ status: "Copier activated" });
    } else if (request.action === "deactivateCopier") {
        toggleEventListeners(false);
        sendResponse({ status: "Copier deactivated" });
    }
    return true; // For async responses
});

// Initial check: if content script is loaded directly, activate it.
// This handles cases where the plugin is already active when a new page loads.
chrome.runtime.sendMessage({ action: "getPluginStatus" }, (response) => {
    if (response && response.isActive) {
        toggleEventListeners(true);
    }
});
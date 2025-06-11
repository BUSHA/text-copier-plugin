function showToast(message) {
  const toastId = "chrome-text-copier-toast"
  let toast = document.getElementById(toastId)

  if (!toast) {
    toast = document.createElement("div")
    toast.id = toastId
    toast.classList.add("chrome-text-copier-toast")
    document.body.appendChild(toast)
  }

  toast.textContent = message
  toast.classList.add("show")

  setTimeout(() => {
    toast.classList.remove("show")
  }, 2000)
}

let originalBackgroundColor = ""
let highlightedElement = null

function handleMouseOver(event) {
  const target = event.target
  if (
    target.nodeType === Node.ELEMENT_NODE &&
    target.textContent.trim().length > 0 &&
    !target.closest("#chrome-text-copier-toast")
  ) {
    if (highlightedElement && highlightedElement !== target) {
      highlightedElement.classList.remove("chrome-text-copier-highlight")
    }

    target.classList.add("chrome-text-copier-highlight")
    highlightedElement = target
  }
}

function handleMouseOut(event) {
  const target = event.target
  if (
    target.nodeType === Node.ELEMENT_NODE &&
    target.textContent.trim().length > 0 &&
    !target.closest("#chrome-text-copier-toast")
  ) {
    if (highlightedElement === target) {
      target.classList.remove("chrome-text-copier-highlight")
      highlightedElement = null
    }
  }
}

function handleClick(event) {
  const target = event.target
  const textToCopy = target.textContent.trim()

  const closestLink = target.closest("a")
  if (closestLink) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (textToCopy.length > 0) {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        const displayCopiedText =
          textToCopy.length > 50
            ? textToCopy.substring(0, 50) + "..."
            : textToCopy
        showToast(`Text "${displayCopiedText}" Copied!`)
      })
      .catch((err) => {
        console.error("Could not copy text:", err)
        showToast("Could not copy text!")
      })
  }
  if (highlightedElement === target) {
    target.classList.remove("chrome-text-copier-highlight")
    highlightedElement = null
  }
}

function clearHighlight() {
  if (highlightedElement) {
    highlightedElement.classList.remove("chrome-text-copier-highlight")
    highlightedElement = null
  }
}

function toggleEventListeners(attach) {
  if (attach) {
    document.addEventListener("mouseover", handleMouseOver)
    document.addEventListener("mouseout", handleMouseOut)
    document.addEventListener("click", handleClick, true)
  } else {
    document.removeEventListener("mouseover", handleMouseOver)
    document.removeEventListener("mouseout", handleMouseOut)
    document.removeEventListener("click", handleClick, true)
    clearHighlight()
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "activateCopier") {
    toggleEventListeners(true)
    sendResponse({ status: "Copier activated" })
  } else if (request.action === "deactivateCopier") {
    toggleEventListeners(false)
    sendResponse({ status: "Copier deactivated" })
  }
  return true
})

chrome.runtime.sendMessage({ action: "getPluginStatus" }, (response) => {
  if (response && response.isActive) {
    toggleEventListeners(true)
  }
})

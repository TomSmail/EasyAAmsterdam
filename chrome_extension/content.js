if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("added message listener")
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "getInnerText") {
        const innerText = document.body.innerText;
        sendResponse({ innerText: innerText });
      }
    });
  });
} else {
  console.log("added message listener 2")
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getInnerText") {
      const innerText = document.body.innerText;
      sendResponse({ innerText: innerText });
    }
  });
};


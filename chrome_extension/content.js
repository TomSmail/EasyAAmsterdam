// (() => {
//   chrome.runtime.onMessage.addListener((obj, sender, response) => {
//     const { type } = obj;
//     if (type === "fromBackground") {
//       console.log("We hit content message listener!");
//       chrome.runtime.sendMessage({
//         type: "fromContent",
//         value: document.body.innerText
//       });
//     }
//   });
// })();

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


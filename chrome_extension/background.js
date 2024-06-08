// chrome.runtime.onInstalled.addListener(() => {
//   console.log('Extension Installed');
// });


chrome.tabs.onUpdated.addListener((tabId, tab) => {
  console.log("Background on updated tabs: ", tabId, tab);

  if (tab.url && tab.url.includes("fake")) {
    console.log("Sending message to content.js");
    chrome.tabs.sendMessage(tabId, {
      type: "fromBackground"
    });
  }
});

chrome.runtime.onMessage.addListener((obj, sender, response) => {
  const { type, value } = obj;
  if (type === "fromContent") {
    console.log("We hit background message listener!", value);
  }
});

// chrome.runtime.onInstalled.addListener(() => {
//   console.log('Extension Installed');
// });



chrome.tabs.onUpdated.addListener((tabId, tab) => {
  console.log("Background on updated tabs: ", tabId, tab);

  if (tab.url && tab.url.includes("fake")) {
    console.log("Sending message to content.js");
    chrome.tabs.sendMessage(tabId, {
      type: "testMessage1"
    });
  }
});
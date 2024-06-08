chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension Installed');
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'purchaseInfo') {
      console.log('Purchase Info:', message.data);
      // You can store or process the information here
      chrome.storage.local.set({ purchaseInfo: message.data }, () => {
        console.log('Purchase info saved.');
      });
    }
  });
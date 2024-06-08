import { getActiveTabURL } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('purchaseInfo', (result) => {
    if (result.purchaseInfo) {
      document.getElementById('info').textContent = JSON.stringify(result.purchaseInfo, null, 2);
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'purchaseInfo') {
      document.getElementById('info').textContent = JSON.stringify(message.data, null, 2);
    }
  });
});
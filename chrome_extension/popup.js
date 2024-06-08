import { getActiveTabURL } from "./utils.js";

document.getElementById('getText').addEventListener('click', () => {
  console.log("Click")
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getInnerText" }, (response) => {
      document.getElementById('output').innerText = response.innerText;
    });
  });
});

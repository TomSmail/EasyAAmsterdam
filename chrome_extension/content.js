(() => {
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    console.log("We hit content message listener!");
  });
})();
(() => {
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type } = obj;
    if (type === "fromBackground") {
      console.log("We hit content message listener!");
      chrome.runtime.sendMessage({
        type: "fromContent",
        value: document.body.innerText
      });
    }
  });
})();


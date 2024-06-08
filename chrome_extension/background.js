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
    prompt = `Find the distance between the departure and arrival from this text: ${value}' and return it as JSON in the form: {distance: <distance>}`;
    distance = openAiRequest(prompt)
    console.log(distance)
  }
});




apiKey = 'ASK_TOM'

function openAiRequest(innerText) {
    prompt = `Find the distance between the departure and arrival from this text: ${value}' and just return it as JSON in the form: {distance: <distance>}`;
    console.log(`***PROMPT*** : \n ${prompt}`)
    fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
        model: "gpt-4",
        messages: [{"role": "user", "content": prompt}]
    })
    })
    .then(response => {
        return response.json()
    })
    .then(data => {
    console.log(data);
    })
    .catch(error => {
    console.error('Error:', error);
    });
}

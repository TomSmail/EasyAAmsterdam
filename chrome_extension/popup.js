import { getActiveTabURL } from "./utils.js";

// document.addEventListener('DOMContentLoaded', () => {
//   chrome.storage.local.get('purchaseInfo', (result) => {
//     if (result.purchaseInfo) {
//       document.getElementById('info').textContent = JSON.stringify(result.purchaseInfo, null, 2);
//     }
//   });

//   chrome.runtime.onMessage.addListener((message) => {
//     if (message.type === 'purchaseInfo') {
//       document.getElementById('info').textContent = JSON.stringify(message.data, null, 2);
//     }
//   });
// });

apiKey = 'ASK_TOM_FOR_KEY'

function openAiRequest(innerText) {
    prompt = `Get me the departure and arrival from this text: '${innerText}' and return it as JSON in the form: {departure: <city1>, arrival: <city2>}`;
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
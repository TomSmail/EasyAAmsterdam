import { getActiveTabURL } from "./utils.js";

document.getElementById('getText').addEventListener('click', () => {
  console.log("Click")
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getInnerText" }, (response) => {
			const innerText = response.innerText;
      document.getElementById('output').innerText = innerText;
			kilosOfCO2 = openAiRequest(innerText);
			// INSERT CODE HERE TO ADD TO CHAIN
			console.log(kilosOfCO2);
    });
  });
});

const apiKey = ''

function openAiRequest(innerText) {
	prompt = `Find the number of kilos generated between the departure and arrival from this text: ${value}' and just return it as JSON in the form: {flight_emissions: <emissions>}`;
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
	if (typeof data.flight_emissions !== 'undefined') {
    // the variable is defined
		return data.flight_emissions
	}	else {
		return 0
	}
	})
	.catch(error => {
	console.error('Error:', error);
	});
}
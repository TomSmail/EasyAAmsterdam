import { getActiveTabURL } from "./utils.js";

const CO2_MULTIPLIER = 0.15

document.getElementById('getText').addEventListener('click', () => {
  console.log("Click")
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getInnerText" }, (response) => {
			console.log(response);
			const innerText = response.innerText;
			const prompt1 = `Extract the departure and arrival location from this text: ${innerText}' and just return it as JSON in the form: {departure: <city1>, arrival: <city2>}`;
      document.getElementById('output').innerText = innerText;
			let description = ''
			const distance = openAiRequest(prompt1)
				.then(locations => {
					console.log(`Locations data: ${locations}`)
					locations = JSON.parse(locations)
					if (typeof locations.departure !== undefined && typeof locations.arrival !== undefined) {
						description = `Flight from ${locations.departure} to ${locations.arrival}`
						console.log(locations);
						const prompt2 = `Return the distance between these two places: ${locations.departure} and ${locations.arrival} in kilometers and nothing else`
						openAiRequest(prompt2)
							.then(distance => {
									console.log(distance);
									// Calculate URL
									const carbon = distance * CO2_MULTIPLIER
									const url = `https://12312312.com?carbon=${carbon}&description=${description}`
									// Go to this URL in new tab
									chrome.tabs.create({'url': url});
								}
						);
					} else {
						console.error("GPT did not return correct output")
						return 0;
					}
				}
			);
    });
  });
});

const apiKey = ''

async function openAiRequest(prompt) {
	// console.log(JSON.parse('{\n"departure": "London Heathrow (LHR)",\n"arrival": "Amsterdam Schiphol (AMS)"\n}'));
	console.log(`***PROMPT*** : \n ${prompt}`);
	return fetch('https://api.openai.com/v1/chat/completions', {
	method: 'POST',
	headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`
	},
	body: JSON.stringify({
			model: "gpt-4",
			messages: [{"role": "user", "content": prompt}],
			temperature: 0
	})
	})
	.then(response => {
			return response.json()
	})
	.then(data => {
		console.log("openai function")
		console.log(data);
		console.log(data.choices[0].message.content)
		return data.choices[0].message.content;
	})
	.catch(error => {
	console.error('Error:', error);
	});
}
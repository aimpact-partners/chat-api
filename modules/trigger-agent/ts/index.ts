import fetch from 'node-fetch';

export /*bundle*/ class TriggerAgent {
	#url = 'http://localhost:5010/agent';
	#options = {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
	};

	async call(text: string) {
		try {
			const options = {...this.#options, body: JSON.stringify({text})};

			const response = await fetch(this.#url, options);
			const responseJson = await response.json();

			return responseJson;
		} catch (e) {
			console.error('Error en la petición:', e);
			return {status: false, error: e.message};
		}
	}
}

import fetch from 'node-fetch';
import config from '@aimpact/chat-api/config';

export /*bundle*/ class TriggerAgent {
    #url = config.params.AGENTS_SERVER;
    #options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    };

    async call(text: string, path: string) {
        try {
            const options = { ...this.#options, body: JSON.stringify({ text: text, path: path }) };
            const response = await fetch(this.#url, options);
            const responseJson = await response.json();

            return responseJson;
        } catch (e) {
            console.error('Error en la petición:', e);
            return { status: false, error: e.message };
        }
    }
}

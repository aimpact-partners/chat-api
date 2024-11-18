import type { IVoiceAudioDetection, AgentStatusType } from '@aimpact/agents-api/realtime/agents/base';
import { ClientSessionBase } from '@aimpact/agents-api/realtime/client/base';

// Define the server URL and the authentication token
const SERVER_URL = 'ws://localhost:8080';
const AUTH_TOKEN = 'your_secret_token';

export /*bundle*/ class ClientSession extends ClientSessionBase {
	#ws: WebSocket;

	#error: Error;
	get error() {
		return this.#error;
	}

	get status(): AgentStatusType {
		if (!this.#ws) return 'closed';

		const { readyState: state } = this.#ws;
		if (this.#error) {
			return 'error';
		} else if (state === WebSocket.CONNECTING) {
			return 'connecting';
		} else if (state === WebSocket.OPEN) {
			return 'open';
		} else if (state === WebSocket.CLOSING) {
			return 'closing';
		} else if (state === WebSocket.CLOSED) {
			return 'closed';
		}
	}

	#connected: boolean = false;
	get connected(): boolean {
		return this.#connected;
	}

	async connect(): Promise<boolean> {
		const headers = {
			Authorization: `Bearer ${AUTH_TOKEN}`
		};

		const ws = (this.#ws = new WebSocket(SERVER_URL, { headers }));

		// Handle the open connection
		ws.on('open', () => {
			this.#connected = true;
		});

		// Handle messages from the server
		ws.on('message', (message: string) => {
			console.log(`Received from server: ${message}`);
		});

		// Handle connection errors
		ws.on('error', (error: Error) => {
			console.error(`Connection error: ${error.message}`);
		});

		// Handle connection close
		ws.on('close', () => {
			this.#connected = false;
		});

		return true;
	}

	async close() {
		this.#ws.close();
		return await super.close();
	}

	async update(settings: { conversation: { id: string } }): Promise<void> {}

	listen(data: { mono: Int16Array; raw: Int16Array }): void {}
}

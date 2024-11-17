import type { WebSocket as WebSocketNode, Data as MessageDataType } from 'ws';
import { Events } from '@beyond-js/events/events';

export /*bundle*/ type ChannelStatusType = 'closed' | 'connecting' | 'open' | 'closing' | 'error';

/**
 * Interface defining settings for initializing the web socket.
 */
export /*bundle*/ interface IChannelSettings {
	url?: string;
	apiKey: string;
	model?: string;
	dangerouslyAllowAPIKeyInBrowser?: boolean;
}

const defaults = {
	url: 'wss://api.openai.com/v1/realtime',
	model: 'gpt-4o-realtime-preview-2024-10-01'
};

export /*bundle*/ class Channel extends Events {
	#settings: IChannelSettings;

	#ws: WebSocket | WebSocketNode;
	get ws() {
		return this.#ws;
	}

	#browser: boolean;
	get browser() {
		return this.#browser;
	}

	get status(): ChannelStatusType {
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

	#error: Error;
	get error() {
		return this.#error;
	}

	#listeners: { [event: string]: any } = {};

	constructor(settings: IChannelSettings) {
		super();
		this.#settings = settings;
	}

	#create() {
		let { url, apiKey, model } = this.#settings;
		url = `${url || defaults.url}${model ? `?model=${model}` : `?model=${defaults.model}`}`;
		apiKey = apiKey || null;
		model = model || defaults.model;

		// Determine if running in the browser or Node.js
		this.#browser = !(globalThis as any).process?.versions?.node;

		if (this.#browser) {
			// Browser WebSocket setup
			const WebSocket = (globalThis as any).WebSocket;
			const headers = ['realtime', `openai-insecure-api-key.${apiKey}`, 'openai-beta.realtime-v1'];
			this.#ws = <WebSocket>new WebSocket(url, headers);

			// Define event handlers for the browser
			this.#listeners = {
				open: () => this.trigger('open'),
				message: (event: MessageEvent) => this.trigger('message', event.data),
				close: (event: CloseEvent) => this.trigger('close', event.code, event.reason),
				error: (event: Event) => this.trigger('error', event)
			};

			// Attach listeners using addEventListener
			for (const [event, listener] of Object.entries(this.#listeners)) {
				this.#ws.addEventListener(event, listener);
			}
		} else {
			// Node.js WebSocket setup
			const { WebSocket } = require('ws');
			const headers = { Authorization: `Bearer ${apiKey}`, 'OpenAI-Beta': 'realtime=v1' };
			this.#ws = <WebSocketNode>new WebSocket(url, { headers });

			// Define event handlers for node.js
			this.#listeners = {
				open: () => this.trigger('open'),
				message: (data: MessageDataType) => this.trigger('message', data),
				close: (code: number, reason: string) => this.trigger('close', code, reason),
				error: (error: Error) => this.trigger('error', error)
			};

			// Attach listeners using .on
			for (const [event, listener] of Object.entries(this.#listeners)) {
				this.#ws.on(event, listener);
			}
		}

		// Attach to the close event to cleanup and remove the web socket instance
		// Socket can be reconnected by calling the `connect` method
		this.on('close', this.#onclose);
	}

	/**
	 * Sends data through the WebSocket
	 */
	send(data: any): void {
		const { status } = this;
		if (status !== 'open') throw new Error(`Channel is not in an 'open' state. Actual state is '${status}'`);

		this.#ws.send(data);
	}

	/**
	 * Removes all event listeners and closes the WebSocket.
	 */
	#cleanup(): void {
		// Remove all listeners based on the environment
		if (this.#browser) {
			// Browser: Remove listeners with removeEventListener
			for (const [event, listener] of Object.entries(this.#listeners)) {
				(<WebSocket>this.#ws).removeEventListener(event, listener);
			}
		} else {
			// Node.js: Remove listeners with off (for ws library in Node.js)
			for (const [event, listener] of Object.entries(this.#listeners)) {
				(<WebSocketNode>this.#ws).off(event, listener);
			}
		}
	}

	#onclose = () => {
		this.#cleanup();
		this.#ws = void 0;
		this.off('close', this.#onclose);
	};

	async connect(): Promise<boolean> {
		if (this.#ws) throw new Error(`Socket status must be 'closed' before attempting to connect`);
		this.#create();

		const promise: Promise<boolean> = new Promise(resolve => {
			const off = () => {
				this.off('open', onopen);
				this.off('error', onerror);
				this.off('close', onclose);
			};

			const onopen = () => {
				off();
				resolve(true);
			};

			const onerror = (ws: WebSocket, error: Error) => {
				off();
				this.#error = error;
				resolve(false);
			};

			const onclose = (ws: WebSocket, code: number, reason: Buffer) => {
				off();
				this.#ws = void 0;
				if (this.#error) return;

				this.#error = new Error(`WebSocket closed unexpectedly. Code: ${code}. Reason: ${reason}`);
				resolve(false);
			};

			this.on('open', onopen);
			this.on('error', onerror);
			this.on('close', onclose);
		});

		return await promise;
	}

	/**
	 * Closes the WebSocket connection and waits for the close event.
	 */
	async close(): Promise<void> {
		const ws = this.#ws;
		if (ws.readyState === WebSocket.CLOSED) {
			return; // Already closed
		}

		return new Promise(resolve => {
			// Listen for the close event
			const onclose = () => setTimeout(resolve, 0);

			// Attach the close listener
			this.on('close', onclose);

			// Initiate the closing handshake
			ws.close();
		});
	}
}

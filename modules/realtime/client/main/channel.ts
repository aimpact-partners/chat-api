import { Channel as ChannelBase } from '@aimpact/agents-api/realtime/channel';
import { Events } from '@beyond-js/events/events';

const SERVER_URL = 'ws://localhost:8080';

export class Channel extends Events {
	#channel: ChannelBase;

	get status() {
		return this.#channel.status;
	}

	get error() {
		return this.#channel.error;
	}

	constructor() {
		super();
		this.#channel = new ChannelBase({ url: SERVER_URL });

		this.#channel.on('open', this.#onopen);
		this.#channel.on('close', this.#onclose);
		this.#channel.on('message', this.#onmessage);
	}

	#onopen = () => this.trigger('open');
	#onclose = () => this.trigger('close');

	#onmessage = (message: any) => {
		try {
			const parsed = JSON.parse(message);
			const { event, data } = parsed;

			if (!event) {
				console.warn(`Agent message seems to be invalid, event not defined:`, message);
				return;
			}

			console.log(`Event "${event}" has been received:`, data);
			this.trigger(event, data);
		} catch (exc) {
			console.warn(`Unable to parse agent message:`, message, exc.message);
			return;
		}
	};

	#cleanup() {
		this.#channel.off('open', this.#onopen);
		this.#channel.off('close', this.#onclose);
		this.#channel.off('message', this.#onmessage);
	}

	async connect() {
		return await this.#channel.connect();
	}

	async close() {
		this.#cleanup();
		return await this.#channel.close();
	}

	send(event: string, data: any) {
		this.#channel.send(JSON.stringify({ event, data }));
	}
}

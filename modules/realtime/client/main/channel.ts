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
	}

	#onopen = () => this.trigger('open');
	#onclose = () => this.trigger('close');

	cleanup() {
		this.#channel.off('open', this.#onopen);
		this.#channel.off('close', this.#onclose);
	}

	async connect() {
		return await this.#channel.connect();
	}

	async close() {
		return await this.#channel.close();
	}
}

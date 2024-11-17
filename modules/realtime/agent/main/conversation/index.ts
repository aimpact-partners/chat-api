import type {
	IConversationCreatedServerEvent,
	IInputAudioBufferSpeechStartedServerEvent,
	IInputAudioBufferSpeechStoppedServerEvent
} from '@aimpact/agents-api/realtime/interfaces/open-ai-events';
import type { Agent } from '..';
import { Items } from './items';
import { ConversationResponses } from './responses';
import { Speech } from './speech';

export class Conversation {
	#id: string;
	get id() {
		return this.#id;
	}

	#agent: Agent;
	get agent() {
		return this.#agent;
	}

	#speech: Speech;
	get speech() {
		return this.#speech;
	}

	#items: Items;
	get items() {
		return this.#items;
	}

	#responses: ConversationResponses;
	get responses() {
		return this.#responses;
	}

	constructor(agent: Agent) {
		this.#agent = agent;
		this.#items = new Items(this);
		this.#responses = new ConversationResponses(this);
		this.#speech = new Speech(this);

		const { session } = agent;
		session.on('conversation.created', this.onCreated.bind(this));
		session.on('input_audio_buffer.speech_started', this.onSpeechStarted.bind(this));
		session.on('input_audio_buffer.speech_stopped', this.onSpeechStopped.bind(this));
	}

	listen(chunk: Int16Array) {
		this.#speech.append(chunk);
	}

	onCreated(event: IConversationCreatedServerEvent) {
		console.log('[IMPLEMENTED] on[Conversation]Created event received:', event);
		this.#id = event.conversation.id;
	}

	onSpeechStarted(event: IInputAudioBufferSpeechStartedServerEvent) {
		console.log('[IMPLEMENTED] onSpeechStarted event received:', event);
		this.#speech.onStarted(event);
		this.#items.speechStarted(event);
	}

	onSpeechStopped(event: IInputAudioBufferSpeechStoppedServerEvent, audio: Int16Array) {
		console.log('onSpeechStopped event received:', event);

		// if (!this.#lookup.has(event.item_id)) {
		// 	this.trigger('error', { error: `input_audio_buffer.speech_stopped: Item "${event.item_id}" not found` });
		// 	return;
		// }
		// const item = this.#lookup.get(event.item_id);
		// item.speechStopped(event, audio);
	}
}

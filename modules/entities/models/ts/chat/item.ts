// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import { ChatProvider } from '@aimpact/chat-api/backend-provider';
import { Message } from './messages/item';
interface IChat {
	name: string;
	userId: string;
	category: string;
	system: string;
	parent: string;
	knowledgeBoxId: string;
	usage: {
		completionTokens: number;
		promptTokens: number;
		totalTokens: number;
	};
}

export /*bundle*/ class Chat extends Item<IChat> {
	protected properties = [
		'id',
		'autoplay',
		'name',
		'userId',
		'system',
		'parent',
		'category',
		'usage',
		'knowledgeBoxId',
	];

	declare fetching: boolean;
	declare triggerEvent: () => void;
	declare provider: any;
	#messages: Map<string, any> = new Map();
	get messages() {
		return [...this.#messages.values()];
	}

	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Chat', provider: ChatProvider });
	}

	loadAll = async specs => {
		//@ts-ignore
		const response = await this.load(specs);

		let messages = new Map();
		if (response.data.messages?.length) {
			response.data.messages.forEach(message => messages.set(message.id, message));
		}
		this.#messages = messages;
	};

	async setAudioMessage({ user, response }) {
		const messageItem = new Message();
		const responseItem = new Message();
		await Promise.all([messageItem.isReady, responseItem.isReady]);

		await messageItem.publish(user);
		await responseItem.publish(response);

		const finalData = { ...user };
		const data = this.#messages.get('temporal');
		this.#messages.set(messageItem.id, { ...finalData, id: messageItem.id, audio: data.audio });
		this.#messages.delete('temporal');

		this.#messages.set(responseItem.id, { ...response, id: responseItem.id });
		this.triggerEvent();

		return responseItem;
	}

	async sendAudio(audio, transcription = undefined) {
		const item = new Message();
		await item.isReady;
		item.setOffline(true);

		const specs = {
			id: 'temporal',
			chatId: this.id,
			type: 'audio',
			audio,
			role: 'user',
			timestamp: Date.now(),
		};
		if (transcription) {
			specs.content = transcription;
		}

		this.#messages.set('temporal', specs);
		this.triggerEvent();
	}
	async sendMessage(content: string) {
		try {
			this.fetching = true;
			const item = new Message();
			await item.isReady;
			item.setOffline(true);

			this.#messages.set(item.id, {
				id: item.id,
				chatId: this.id,
				content,
				role: 'user',
				timestamp: Date.now(),
			});
			this.triggerEvent();

			await item.publish({ chatId: this.id, content, role: 'user', timestamp: Date.now() });

			this.triggerEvent();

			const data = { ...item.getProperties() };

			const response = await this.provider.sendMessage({ chatId: this.id, ...data });
			if (!response.status) {
				throw new Error(response.error);
			}
			this.#messages.set(response.data.response.id, response.data.response);
			this.#messages.set(response.data.message.id, response.data.message);

			this.triggerEvent();
			return { response: response.data.response, message: response.data.message };
		} catch (e) {
			console.error(e);
		} finally {
			this.fetching = false;
		}
	}

	getMessage(id) {
		return this.#messages.get(id);
	}
}

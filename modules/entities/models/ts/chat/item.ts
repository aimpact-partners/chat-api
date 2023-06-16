// ChatItem
import { Item } from '@beyond-js/reactive-2/entities';
import { ChatProvider } from '@aimpact/chat-api/backend-provider';
import { Message } from './messages/item';
import { Messages } from './messages';

interface IChat {
	userId: string;
	category: string;
	knowledgeBoxId: string;
}

export /*bundle*/ class Chat extends Item<IChat> {
	protected properties = ['id', 'userId', 'category', 'knowledgeBoxId', 'name'];

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

		//@ts-ignore
	};

	async setAudioMessage(messages: { text: string; role: string }[]) {
		const messageItem = new Message();
		const promises = [];

		messages.forEach(message => {
			if (this.#messages.has(message.id)) {
				const data = this.#messages.get(message.id);
				data.text = message.text;
				promises.push(messageItem.publish(data));
			} else {
				this.#messages.set(message.id, message);
				promises.push(messageItem.publish(message));
			}

			//@ts-ignore
		});
		this.triggerEvent();
		await Promise.all(promises);

		const response = await this.provider.bulkSave(messages);

		return response;
	}

	sendAudio(audio, transcription = undefined) {
		const item = new Message();
		//@ts-ignore
		item.setOffline(true);

		const specs = {
			//@ts-ignore
			id: item.id,
			//@ts-ignore
			chatId: this.id,
			type: 'audio',
			audio,
			role: 'user',
			timestamp: Date.now(),
		};
		if (transcription) {
			//@ts-ignore
			specs.text = transcription;
		}
		//@ts-ignore
		this.#messages.set(item.id, specs);
		//@ts-ignore
		this.triggerEvent();
	}
	async sendMessage(text: string) {
		try {
			//@ts-ignore
			this.fetching = true;
			//@ts-ignore
			const item = new Message();
			//@ts-ignore
			item.setOffline(true);

			//@ts-ignore
			this.#messages.set(item.id, { id: item.id, chatId: this.id, text, role: 'user', timestamp: Date.now() });

			//TODO no se guarda el chatID en el cliente?
			//@ts-ignore
			await item.publish({ chatId: this.id, text, role: 'user', timestamp: Date.now() });

			//@ts-ignore
			this.triggerEvent();
			//@ts-ignore
			const data = { ...item.getValues() };

			//@ts-ignore
			const response = await this.provider.sendMessage({ chatId: this.id, ...data });
			if (!response.status) {
				throw new Error(response.error);
			}

			this.#messages.set(response.data.response.id, response.data.response);
			//@ts-ignore
			this.triggerEvent('new.message');
		} catch (e) {
			console.error(e);
		} finally {
			//@ts-ignore
			this.fetching = false;
		}
	}
}

// ChatItem
import { Item } from '@beyond-js/reactive-2/entities';
import { ChatProvider } from '@aimpact/chat-api/backend-provider';
import { Message } from './messages/item';
import { Messages } from './messages';

interface IChat {
	userId: string;
	category: string;
}

export /*bundle*/ class Chat extends Item<IChat> {
	protected properties = ['id', 'userId', 'category', 'name'];

	#messages: any[];
	get messages() {
		return this.#messages;
	}

	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Chat', provider: ChatProvider });
	}

	loadAll = async specs => {
		//@ts-ignore
		const response = await this.load(specs);
		console.log(12, response);
		this.#messages = response.data.messages ?? response.data.messages;

		//@ts-ignore
	};

	async sendMessage(text: string) {
		try {
			//@ts-ignore
			this.fetching = true;
			//@ts-ignore
			const messageItem = new Message();
			//@ts-ignore
			messageItem.setOffline(true);
			//@ts-ignore
			this.#messages.push({ id: messageItem.id, text, role: 'user', timestamp: Date.now() });
			//@ts-ignore
			await messageItem.publish({ text, role: 'user', timestamp: Date.now() });
			//@ts-ignore
			this.triggerEvent('new.message');
			//@ts-ignore
			const data = { ...messageItem.getValues() };

			//@ts-ignore
			const response = await this.provider.sendMessage({ chatId: this.id, ...data });
			if (!response.status) {
				throw new Error(response.error);
			}

			this.#messages.push(response.data.response);
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

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

	#messages: Messages;
	get messages() {
		return [];
	}

	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Chat', provider: ChatProvider });
	}

	loadAll = async specs => {
		//@ts-ignore
		const response = await this.load(specs);
		console.log(0.1, response);
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
			await messageItem.publish({ text, role: 'user', timestamp: Date.now() });
			this.triggerEvent('new.message');
			//@ts-ignore
			const data = { ...messageItem.getValues() };
			console.log(2, data);
			//@ts-ignore
			const response = await this.provider.sendMessage({ chatId: this.id, ...data });
			if (!response.status) {
				throw new Error(response.error);
			}
			console.log(10, response);
			this.#messages.add(response.data.response);
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

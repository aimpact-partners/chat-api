// ChatItem
import {Item} from '@beyond-js/reactive-2/entities';
import {ChatProvider} from '@aimpact/chat-api/provider';

interface IChat {
	userId: string;
	category: string;
}

export /*bundle*/ class Chat extends Item<IChat> {
	protected properties = ['id', 'userId', 'category'];
	protected storeName = 'chat';
	protected db = 'chat-api@1';

	constructor({id = undefined} = {}) {
		super({id});
		this.provider = new ChatProvider();
	}
}

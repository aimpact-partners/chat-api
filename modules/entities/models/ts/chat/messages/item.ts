// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import { MessageProvider } from '@aimpact/chat-api/backend-provider';

interface IMessage {
    chatId: string;
    userId: string;
    text: string;
    role: string;
    timestamp: number;
}

export /*bundle*/ class Message extends Item<IMessage> {
    protected properties = ['id', 'chatId', 'userId', 'text', 'timestamp', 'role'];

    constructor({ id = undefined } = {}) {
        super({ id, db: 'chat-api', storeName: 'Messages', provider: MessageProvider });
    }
}

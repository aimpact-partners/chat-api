import { Collection } from '@beyond-js/reactive-2/entities';
import { ChatProvider } from '@aimpact/chat-api/backend-provider';
import { Chat } from './item';

interface IChats {
    items: Chat[];
}

export /*bundle*/ class Chats extends Collection {
    item = Chat;
    constructor() {
        super({ provider: ChatProvider, storeName: 'Chat', db: 'chat-api' });
    }
}

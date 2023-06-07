
import { Collection } from '@beyond-js/reactive-2/entities';
import { Chat } from './item';

interface IChats {
    items: Chat[];
}

export class Chats extends Collection {
    item = Chat;
    protected storeName = 'Chat';
    protected db = 'chat-api';

    constructor() {
        super();
        this.init();
    }
}

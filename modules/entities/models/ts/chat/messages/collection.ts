import { Collection } from '@beyond-js/reactive/entities';
import { Message } from './item';

interface IChats {
    items: Message[];
}

export class Messages extends Collection {
    item = Message;
    protected storeName = 'Messages';
    protected db = 'chat-api';

    constructor() {
        super();
        this.init();
    }
}

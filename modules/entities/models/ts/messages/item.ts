// ChatItem
import { ReactiveModel } from "@beyond-js/reactive-2/model";
import { Item } from "@beyond-js/reactive-2/entities";

interface IMessage {
    userId: string;
    category: string;
    
}

export /*bundle*/ class Message extends Item<IMessage> {
    protected properties = ['id', "chatId", "userId", "timestamp"];
    protected storeName = "messages";
    protected db = "chat-api@1";

    constructor({ id = undefined } = {}) {
        super({id});
    }
}
// ChatItem
import { ReactiveModel } from "@beyond-js/reactive-2/model";
import { Item } from "@beyond-js/reactive-2/entities";

interface IChat {
    userId: string;
    category: string;
}

export /*bundle*/ class Chat extends Item<IChat> {
    protected properties = ["id", "userId", "category"];
    protected storeName = "chat";
    protected db = "chat-api@1";

    constructor({ id = undefined } = {}) {
        super({id});
    }
}
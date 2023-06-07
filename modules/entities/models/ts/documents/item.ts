// Document
import { ReactiveModel } from "@beyond-js/reactive-2/model";
import { Item } from "@beyond-js/reactive-2/entities";

interface IDocument {
    knowledgeBaseId: string;
    // additional properties...
}

export class Document extends Item<IDocument> {
    protected properties = ["id", "knowledgeBaseId", /* additional properties... */];
    protected storeName = "Documents";
    protected db = "chat-api@1";

    constructor({ id = undefined } = {}) {
        super({id});
    }
}

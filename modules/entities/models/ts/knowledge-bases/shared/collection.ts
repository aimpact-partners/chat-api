import { Collection } from '@beyond-js/reactive/entities';
import { SharedKnowledgeProvider } from '@aimpact/chat-api/backend-provider';
import { SharedKnowledge } from './item';

interface ISharedKnowledges {
    items: SharedKnowledge[];
}

export class SharedKnowledges extends Collection {
    item = SharedKnowledge;
    protected storeName = 'SharedKnowledgeBases';
    protected db = 'chat-api';

    constructor() {
        super();
        this.provider = new SharedKnowledgeProvider();
        this.init();
    }
}

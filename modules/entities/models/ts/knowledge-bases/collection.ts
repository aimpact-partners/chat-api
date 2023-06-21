import { Collection } from '@beyond-js/reactive/entities';
import { KnowledgeProvider } from '@aimpact/chat-api/backend-provider';
import { Knowledge } from './item';

interface IKnowledges {
    items: Knowledge[];
}

export class Knowledges extends Collection {
    item = Knowledge;
    protected storeName = 'KnowledgeBases';
    protected db = 'chat-api';

    constructor() {
        super();
        this.provider = new KnowledgeProvider();
        this.init();
    }
}

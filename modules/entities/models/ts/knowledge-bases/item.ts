// KnowledgeItem
import {Item} from '@beyond-js/reactive-2/entities';
import {KnowledgeProvider} from '@aimpact/chat-api/backend-provider';

interface IKnowledge {
	userId: string;
}

export /*bundle*/ class Knowledge extends Item<IKnowledge> {
	protected properties = ['id', 'userId', 'category'];

	constructor({id = undefined} = {}) {
		super({id, db: 'chat-api', storeName: 'KnowledgeBases', provider: KnowledgeProvider});
	}
}

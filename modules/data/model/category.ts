import { Collection } from '@beyond-js/firestore-collection/collection';
import { IPromptCategoryBaseData } from '@aimpact/chat-api/data/interfaces';

class PromptCategories extends Collection<IPromptCategoryBaseData> {
	constructor() {
		super('PromptCategories');
	}
}

export /*bundle*/ const promptsCategories: Collection<IPromptCategoryBaseData> = new PromptCategories();

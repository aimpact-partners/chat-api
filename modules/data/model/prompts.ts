import { Collection, SubCollection } from '@beyond-js/firestore-collection/collection';
import { IPromptData, IPromptOptionData } from '@aimpact/chat-api/data/interfaces';

class Prompts extends Collection<IPromptData> {
	#options: SubCollection<IPromptOptionData>;
	get options() {
		return this.#options;
	}

	constructor() {
		super('Prompts');
		this.#options = new SubCollection('Options', this);
	}
}

export /*bundle*/ const prompts: Collection<IPromptData> = new Prompts();

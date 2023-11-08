import { Collection, SubCollection } from '@beyond-js/firestore-collection/collection';
import { IPromptTemplateData, IPromptLanguageData } from '@aimpact/chat-api/data/interfaces';
import { Languages } from './languages';

class Prompts extends Collection<IPromptTemplateData> {
	#languages: SubCollection<IPromptLanguageData>;
	get languages() {
		return this.#languages;
	}

	constructor() {
		super('Prompts');
		this.#languages = new Languages(this);
	}
}

export /*bundle*/ const prompts = new Prompts();

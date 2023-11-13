import { Collection, SubCollection } from '@beyond-js/firestore-collection/collection';
import type { IPromptTemplateData, IPromptLanguageData } from '@aimpact/chat-api/data/interfaces';
import { Languages } from './languages';

class Prompts extends Collection<IPromptTemplateData> {
	#languages: Languages;
	get languages() {
		return this.#languages;
	}

	constructor() {
		super('Prompts');
		this.#languages = new Languages(this);
	}
}

export /*bundle*/ const prompts = new Prompts();

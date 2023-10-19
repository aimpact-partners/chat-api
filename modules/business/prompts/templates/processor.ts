import { prompts } from '@aimpact/chat-api/data/model';
import { BusinessErrorManager, ErrorGenerator } from '@beyond-js/firestore-collection/errors';
import type { IPromptData } from '@aimpact/chat-api/data/interfaces';

export interface IPromptGenerationParams {
	category: string;
	name: string;
	language: string;
	options: Record<string, string>;
	literals: Record<string, string>;
}

export /*bundle*/ class PromptTemplateProcessor implements IPromptGenerationParams {
	#category: string;
	get category() {
		return this.#category;
	}

	#name: string;
	get name() {
		return this.#name;
	}

	#language: string;
	get language() {
		return this.#language;
	}

	#id: string;
	get id() {
		return this.#id;
	}

	#options: Record<string, string>;
	get options() {
		return this.#options;
	}

	#literals: Record<string, string>;
	get literals() {
		return this.#literals;
	}

	#data: IPromptData;
	get data() {
		return this.#data;
	}

	#value: string;
	get value() {
		return this.#value;
	}

	#dependencies: IPromptData[];
	get dependencies() {
		return this.#dependencies;
	}

	#processedValue: string;
	get processedValue() {
		return this.#processedValue;
	}

	#error: BusinessErrorManager;
	get error() {
		return this.#error;
	}
	get valid() {
		return !this.#error;
	}

	constructor(params: IPromptGenerationParams) {
		this.#category = params.category;
		this.#name = params.name;
		this.#language = params.language;
		this.#options = params.options;
		this.#literals = params.literals;
	}

	async #load(): Promise<void> {
		const { category, name, language } = this;
		const id = (this.#id = `${category}.${name}.${language}`);

		// Get the prompt data
		await (async () => {
			const response = await prompts.data({ id });
			if (response.error) return (this.#error = new BusinessErrorManager(response.error));
			if (!response.data.exists) return (this.#error = new BusinessErrorManager(response.data.error));
			this.#data = response.data.data;
		})();
		if (!this.valid) return;

		// The prompt cannot be an options prompt
		if (this.#data.options) {
			this.#error = ErrorGenerator.promptIsOptions(prompt.name);
			return;
		}

		// Get the prompts dependencies
		await (async (): Promise<any> => {
			if (!this.#data.dependencies?.length) return (this.#dependencies = []);

			const response = await prompts.dataset({ ids: this.#data.dependencies });
			const dependencies: IPromptData[] = (this.#dependencies = []);

			// Process the dependencies and check for possible errors
			for (const { error, data } of response) {
				if (error || !data.exists) return (this.#error = ErrorGenerator.promptDependenciesError());
				dependencies.push(data.data);
			}
		})();
	}

	async process() {
		await this.#load();

		// Check that all required literals has been received
		(() => {
			const received = this.literals; // The key/value literals received to be applied to the prompt
			const expected = this.#data.literals; // The literals as specified in the database
			if (!expected) return;

			const notfound = expected.filter(literal => !received.hasOwnProperty(literal));
			if (notfound.length) {
				this.#error = ErrorGenerator.promptLiteralsNotFound(notfound);
				return;
			}
		})();

		// Check that all required options has been received
		(() => {
			const received = this.options; // The key/value options received to be applied to the prompt
			const expected = this.#data.options; // The options as specified in the database
			if (!expected) return;

			const notfound = expected.filter(option => !received.hasOwnProperty(option));
			if (notfound.length) {
				this.#error = ErrorGenerator.promptOptionsNotFound(notfound);
				return;
			}
		})();

		if (!this.valid) return;

		// Process the value of the prompt with the replacement of the received literals and options
		this.#processedValue = (() => {
			let value = this.#value;
			const replacement = (received: Record<string, string>): void => {
				Object.entries(received).forEach(([name, value]) => {
					// Convert camelCase to SCREAMING_SNAKE_CASE
					let screaming = name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

					// Replace the literal
					const regex = new RegExp(screaming, 'g');
					value = value.replace(regex, value);
				});
			};

			// Replace the literals
			replacement(this.literals);

			// Process the dependencies that are not options (ex: HEADER)

			// Process the options
			replacement(this.options);

			return value;
		})();
	}
}

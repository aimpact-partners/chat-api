import { prompts } from '@aimpact/chat-api/data/model';
import { FirestoreErrorManager, ErrorGenerator } from '@beyond-js/firestore-collection/errors';
import type { IPromptData } from '@aimpact/chat-api/data/interfaces';

export interface IPromptGenerationParams {
	category: string;
	name: string;
	language: string;
	options: Record<string, string>;
	literals: { pure: Record<string, string> };
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

	#literals: { pure: Record<string, string> };
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

	#error: FirestoreErrorManager;
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
		const id = (this.#id = `${name}.${language}`);

		// Get the prompt data
		await (async () => {
			const response = await prompts.languages.data({ id: language, parents: { Prompts: name } });
			if (response.error) return (this.#error = new FirestoreErrorManager(response.error));
			if (!response.data.exists) return (this.#error = new FirestoreErrorManager(response.data.error));

			const data = response.data.data;
			this.#data = data;
		})();

		if (!this.valid) return;

		// The prompt cannot be an options prompt
		if (this.#data.options) {
			this.#error = ErrorGenerator.promptIsOptions(prompt.name);
			return;
		}

		this.#value = this.#data.value;
		// Get the prompts dependencies
		await (async (): Promise<any> => {
			if (!this.#data.literals?.dependencies?.length) return (this.#dependencies = []);

			const records: { id: string; parents?: Record<string, string> }[] = [];
			this.#data.literals.dependencies.forEach((dependency: string) => {
				records.push({
					id: this.#data.language,
					parents: { Prompts: [this.#data.project.identifier, dependency].join('.') }
				});
			});

			const response = await prompts.languages.dataset({ records });
			const dependencies: IPromptData[] = (this.#dependencies = []);

			// Process the dependencies and check for possible errors
			for (const { error, data } of response) {
				if (error || !data.exists) return (this.#error = ErrorGenerator.promptDependenciesError());
				dependencies.push(data.data);
			}

			records.length = 0;
			this.#data.dependencies = [];
			dependencies.forEach(dependency => {
				const [projectId, promptId, languageId] = dependency.id.split('.');
				if (dependency.value) {
					const specs = {};
					specs[promptId] = dependency.value;
					this.#data.dependencies.push(specs);
					return;
				}

				if (!(promptId in this.#options)) return;

				records.push({
					id: this.#options[promptId],
					parents: {
						Prompts: [this.#data.project.identifier, promptId].join('.'),
						Languages: this.#data.language
					}
				});
			});

			const responseOptions = await prompts.languages.options.dataset({ records });
			this.#data.options = [];
			responseOptions.forEach(option => {
				if (option.error) return (this.#error = ErrorGenerator.promptOptionsError(option.error));
				if (option.data.error) return (this.#error = ErrorGenerator.promptOptionsError(option.data.error));

				const specs = {};
				specs[option.data.data.prompt] = option.data.data.value; //@ftovar8 agregar en el publish el prompt en el option
				this.#data.options.push(specs);
			});
		})();
	}

	async process() {
		await this.#load();

		// Check that all required pure literals has been received
		(() => {
			const received = this.literals?.pure; // The key/value literals received to be applied to the prompt
			const expected = this.#data.literals?.pure; // The literals as specified in the database
			if (!expected) return;

			const notfound = expected.filter((pureLiteral: string) => !received.hasOwnProperty(pureLiteral));
			if (notfound.length) {
				this.#error = ErrorGenerator.promptLiteralsNotFound(notfound);
				return;
			}
		})();

		// Check that all required dependencies literals has been received
		(() => {
			const received = this.#data.literals?.dependencies; // The key/value literals received to be applied to the prompt
			const expected = this.#data.dependencies; // The literals as specified in the database
			if (!expected) return;

			const notfound = expected.filter(
				literalDependency => !received.includes(Object.keys(literalDependency)[0])
			);
			if (notfound.length) {
				this.#error = ErrorGenerator.promptDependenciesNotFound(notfound);
				return;
			}
		})();

		// Check that all required options has been received
		(() => {
			const received = this.options; // The key/value options received to be applied to the prompt
			const expected = this.#data.options; // The options as specified in the database
			if (!expected) return;

			const notfound = expected.filter(option => {
				return !received.hasOwnProperty(Object.keys(option)[0]);
			});
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
				Object.entries(received).forEach(([name, val]) => {
					// Convert camelCase to SCREAMING_SNAKE_CASE
					// let screaming = name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
					// Replace the literal
					const regex = new RegExp(`\{${name}\}`, 'g');
					value = value.replace(regex, val);
				});
			};

			// Replace the literals
			this.literals?.pure && replacement(this.literals.pure);

			// Process the dependencies that are not options (ex: HEADER)
			this.#data.dependencies && this.#data.dependencies.forEach(dependency => replacement(dependency));

			// Process the options
			this.#data.options && this.#data.options.forEach(option => replacement(option));

			return value;
		})();
	}
}

import { Item } from '@beyond-js/reactive/entities';
import { ClassesProvider } from '@aimpact/chat-api/backend-provider';
interface IClass {
	title: string;
	objectives: string;
}

export /*bundle*/ class Class extends Item<IClass> {
	protected properties = [
		'id',
		'curriculumObjective',
		'topics',
		'status',
		'content',
		'assessment',
		'synthesis',
		'relevance',
	];
	declare curriculumObjective: string;
	declare topics: string[];
	declare isReady: Promise<boolean>;
	declare provider: any;
	declare triggerEvent: (string) => void;
	declare fetching: boolean;
	declare id: string;
	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Classes', provider: ClassesProvider });
	}

	async #generate(specs) {
		try {
			this.fetching = true;
			await this.isReady;
			const response = this.provider.generate(this.id, this.curriculumObjective, specs);
			this.fetching = false;
			return response;
		} catch {
			console.error('error generating', specs);
		}
	}
	async generateTopicActivity(topic, element) {
		return this.#generate({
			is: 'topic',
			element,
			topic,
		});
	}
	async generateClassAction(element) {
		const response = await this.#generate({
			is: 'class',
			element,
			topics: this.topics,
		});
		if (!response) throw new Error('error generating');

		this.triggerEvent('class.generate.content');
		return response;
	}
}

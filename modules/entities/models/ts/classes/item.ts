import { Item } from '@beyond-js/reactive/entities';
import { ClassesProvider } from '@aimpact/chat-api/backend-provider';
interface IClass {
	title: string;
	objectives: string;
}

export /*bundle*/ class Class extends Item<IClass> {
	protected properties = ['curriculumObjective', 'topics'];
	declare curriculumObjective: string;
	declare topics: string[];
	declare isReady: Promise<boolean>;
	declare provider: any;

	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Classes', provider: ClassesProvider });
	}

	async generateTopicActivity(topic, element) {
		await this.isReady;
		try {
			const specs = {
				is: 'topic',
				element,
				topic,
				topics: [topic],
			};
			console.log(9, topic, element, specs);
			const response = await this.provider.generate(this.curriculumObjective, specs);
			console.log(10, response);
			return response;
		} catch (err) {
			console.log(err);
		}

		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(true);
			}, 2000);
		});
	}
}

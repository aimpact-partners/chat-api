import { ReactiveModel } from '@beyond-js/reactive/model';
// import { ChainModel } from "@aimpact/langchain/models";

interface IStore {}
interface IMessages {
	type: string;
	content: string;
}
export class StoreManager extends ReactiveModel<IStore> {
	#path = 'trending';
	#model;
	#messages: IMessages[] = [];
	get messages() {
		return this.#messages;
	}

	constructor() {
		super();

		// this.#model = new ChainModel();
	}

	//   async query(question: string) {
	//     this.fetching = true;
	//     this.#messages.push({ type: "question", content: question });
	//     this.triggerEvent();

	//     const response = await this.#model.query(question, this.#path);
	//     if (!response.status) {
	//       console.error("Error on embeddings", response.error);
	//     }

	//     this.fetching = false;
	//     this.#messages.push({ type: "response", content: response.data });
	//     this.triggerEvent();
	//   }
}

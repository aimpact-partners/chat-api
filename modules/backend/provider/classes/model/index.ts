import { db } from '@aimpact/chat-api/backend-db';
export class Model {
	#id: string;
	private table = 'classes';
	private collection;

	constructor(id) {
		this.#id = id;
		this.collection = db.collection(this.table);
	}

	async set(data) {
		await this.collection.doc(this.#id).set(data);
		const item = await this.collection.doc(this.#id).get();
		return item.data();
	}

	async update(data) {
		await this.collection.doc(this.#id).update(data);
		const item = await this.collection.doc(this.#id).get();
		return item.data();
	}

	async saveTopic(topic, data) {
		const classDocRef = this.collection.doc(this.#id);
		const topics = classDocRef.collection('topics');

		return db.runTransaction(async transaction => {
			return transaction.get(topics.doc(topic)).then(topicDoc => {
				if (!topicDoc.exists) {
					transaction.set(topics.doc(topic), data);
				} else {
					transaction.set(topics.doc(topic), data);
				}
			});
		});
	}
}

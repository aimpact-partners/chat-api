import { db } from '@aimpact/chat-api/backend-db';

export class BatchDeleter {
	constructor(private collectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>) {}

	async deleteAll() {
		const snapshot = await this.collectionRef.get();
		const batch = db.batch();

		snapshot.docs.forEach(doc => {
			batch.delete(doc.ref);
		});

		return batch.commit();
	}
}

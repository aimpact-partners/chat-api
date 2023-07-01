import { initializeApp } from 'firebase/app';
import { Storage } from '@google-cloud/storage';
import { getFirebaseConfig } from '@aimpact/chat-api/firebase-config';

export class FilestoreFile {
	private app;
	private storage;
	firebaseConfig;
	constructor() {
		this.firebaseConfig = getFirebaseConfig();
		this.app = initializeApp(this.firebaseConfig);
		this.storage = new Storage();
	}

	getFile(destination: string) {
		const bucketName = this.firebaseConfig.storageBucket;
		console.log(11, bucketName, destination);
		const file = this.storage.bucket(bucketName).file(destination);
		console.log(11.2, file);
		return file;
	}
	async upload(path: string, destination: string): Promise<string> {
		const bucketName = this.firebaseConfig.storageBucket;
		await this.storage.bucket(bucketName).upload(path, { destination });

		return destination;
	}
}

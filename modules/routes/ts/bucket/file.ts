import { initializeApp } from 'firebase/app';
import { getFirebaseConfig } from './credentials';
import { Storage } from '@google-cloud/storage';

export class FilestoreFile {
	private app;
	private storage;
	firebaseConfig;
	constructor() {
		this.firebaseConfig = getFirebaseConfig();
		this.app = initializeApp(this.firebaseConfig);
		this.storage = new Storage();
	}

	async upload(path: string, destination: string): Promise<string> {
		const bucketName = this.firebaseConfig.storageBucket;
		await this.storage.bucket(bucketName).upload(path, { destination });

		return destination;
	}
}

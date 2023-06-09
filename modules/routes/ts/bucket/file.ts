import {initializeApp} from 'firebase/app';
import {firebaseConfig} from './credentials';
import {Storage} from '@google-cloud/storage';

export class FilestoreFile {
	private app;
	private storage;

	constructor() {
		this.app = initializeApp(firebaseConfig);
		this.storage = new Storage();
	}

	async upload(path: string, destination: string): Promise<string> {
		const bucketName = firebaseConfig.storageBucket;
		await this.storage.bucket(bucketName).upload(path, {destination});

		return destination;
	}
}

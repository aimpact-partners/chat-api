import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeClient } from '@pinecone-database/pinecone';
import type { Documents } from './documents';

export class Vector {
	static async init() {
		const client = new PineconeClient();

		try {
			await client.init({
				apiKey: process.env.PINECONE_API_KEY,
				environment: process.env.PINECONE_ENVIRONMENT,
			});
		} catch (e) {
			console.error(e);
			throw Error(`Pinecode Client not init ${e.message}`);
		}

		return client;
	}

	static async get(metadata: {} = undefined) {
		const client = await Vector.init();

		try {
			const pineconeIndex = client.Index(process.env.PINECONE_INDEX_NAME);
			const embedding = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY });

			const specs: ISpecs = { pineconeIndex };
			metadata && (specs.filter = metadata);
			return await PineconeStore.fromExistingIndex(embedding, specs);
		} catch (e) {
			console.error(e);
		}
	}

	static async update(documents: Documents) {
		const client = await Vector.init();

		const indexes = await client.listIndexes();
		if (!indexes.length && !indexes.includes(process.env.PINECONE_INDEX_NAME)) {
			return { status: false, error: `Embedding index "${process.env.PINECONE_INDEX_NAME}" not found` };
		}

		const specs = { openAIApiKey: process.env.OPEN_AI_KEY };
		const embedding = new OpenAIEmbeddings(specs);

		const pineconeIndex = client.Index(process.env.PINECONE_INDEX_NAME);
		await PineconeStore.fromDocuments(documents.items, embedding, { pineconeIndex });

		return { status: true, data: { message: 'Embeddings updated' } };
	}
}

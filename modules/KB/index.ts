import { PineconeClient } from '@pinecone-database/pinecone';
import type { VectorOperationsApi } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';
import type { Vector } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/models/Vector';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const { PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX_NAME, OPEN_AI_KEY } = process.env;
const model = 'text-embedding-ada-002';

export /*bundle*/ class KB {
	static #error: string;
	static #initialization: Promise<void>;
	static #index: VectorOperationsApi;
	static #openai: OpenAI;

	static async #initialise(): Promise<{ error?: string }> {
		if (this.#error) return { error: this.#error };
		if (this.#initialization) {
			await this.#initialization;
			return this.#error ? { error: this.#error } : {};
		}

		let resolve: () => void;
		this.#initialization = new Promise(r => (resolve = r));

		try {
			const pinecone = new PineconeClient();
			await pinecone.init({
				apiKey: PINECONE_API_KEY,
				environment: PINECONE_ENVIRONMENT
			});
			this.#index = pinecone.Index('testing');

			this.#openai = new OpenAI({ apiKey: OPEN_AI_KEY });
		} catch (exc) {
			const error = `Error on KB initialization`;
			this.#error = error;
			return { error };
		}

		return {};
	}

	/**
	 * Split text by paragraph delimiter '\n\n' and filter out empty strings
	 * @param text
	 * @returns
	 */
	static #splitter(text: string): string[] {
		const cleaner = (text: string) => {
			// Remove leading and trailing whitespaces
			text = text.trim();
			// Remove extra whitespaces
			text = text.replace(/\s+/g, ' ');
			// Remove special characters
			text = text.replace(/[^\w\s]/gi, '');
			// Convert to lowercase
			text = text.toLowerCase();

			return text;
		};

		return text.split(/\n\n+/).map(paragraph => cleaner(paragraph));
	}

	static async upsert(id: string, text: string, namespace: string, metadata: object) {
		const { error } = await this.#initialise();
		if (error) return { error };

		const paragraphs = this.#splitter(text);
		const response = await this.#openai.embeddings.create({ input: paragraphs, model });

		const vectors: Vector[] = [];
		paragraphs.forEach((paragraph, index) => {
			const values = response.data[index].embedding;
			const vector = { id, values, metadata };

			vectors.push(vector);
		});

		const request = { vectors, namespace };
		await this.#index.upsert({ upsertRequest: request });
	}
}

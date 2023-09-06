import type { Request, Response, Application } from 'express';
import { db } from '@aimpact/chat-api/firestore';
import { uploader } from '@aimpact/chat-api/documents-upload';
import { KB, Documents } from '@aimpact/chat-api/models/kb';
import * as dotenv from 'dotenv';
dotenv.config();

export class KBRoutes {
	static setup(app: Application) {
		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors
			});
		});

		app.post('/kb/upload', uploader);
		app.post('/kb/texts', KBRoutes.texts);
		app.get('/kb/search', KBRoutes.search);
		app.post('/kb/documents', KBRoutes.documents);
	}

	static async texts(req: Request, res: Response) {
		const { content, metadata, token } = req.body;
		if (token !== process.env.GCLOUD_INVOKER) {
			return res.status(400).send({ status: false, error: 'Token request not valid' });
		}

		const { status, error, data } = await KB.fromTexts([content], [metadata]);
		res.json({ status, error, data });
	}

	/**
	 * Actualizamos el vector luego de cargado un documento
	 * se llama mediante una task
	 * @param req
	 * @param res
	 * @returns
	 */
	static async documents(req: Request, res: Response) {
		const { id } = req.params;
		const { path, metadata, token } = req.body;
		if (token !== process.env.GCLOUD_INVOKER) {
			return res.status(400).send({ status: false, error: 'Token request not valid' });
		}

		if (!id) return { status: false, error: `knowledgeBox id is required` };
		if (!path) return { status: false, error: `path is required` };

		const documents = new Documents();
		const response = await documents.prepare(path, metadata);

		const statusKB = !response.status ? 'failed' : 'processed';
		const collection = db.collection('KnowledgeBoxes');
		await collection.doc(id).update({ status: statusKB });

		if (!response.status) {
			return response;
		}

		if (!documents.items.length) {
			return { status: false, error: `Documents not found in path "${path}"` };
		}

		const { status, error, data } = await KB.update(documents);
		res.json({ status, error, data });
	}

	/**
	 * hace una busqueda dentro del vector segun el texto y los filtros pasados como parametros
	 * @param req
	 * @param res
	 * @returns
	 */
	static async search(req: Request, res: Response) {
		const { text, filter, token } = req.query;

		let metadata;
		try {
			metadata = JSON.parse(filter);
		} catch (e) {
			return res.status(400).send({ status: false, error: 'Parameter filter not valid' });
		}

		if (token !== process.env.GCLOUD_INVOKER) {
			return res.status(400).send({ status: false, error: 'Token request not valid' });
		}

		const { status, error, data } = await KB.similaritySearch(text, metadata, 3);
		const results = data.map(document => document.pageContent);

		res.json({ status, error, data: { results } });
	}
}

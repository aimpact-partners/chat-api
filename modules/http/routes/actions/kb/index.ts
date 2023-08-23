import type { Request, Response, Application } from 'express';
import { db } from '@aimpact/chat-api/firestore';
import { uploader } from '@aimpact/chat-api/documents-upload';
import { KB as KBModel, Documents } from '@aimpact/chat-api/models/kb';
import * as dotenv from 'dotenv';
dotenv.config();

export /*bundle*/ class KB {
	#app: Application;

	constructor(app: Application) {
		this.#app = app;

		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors,
			});
		});

		console.log('uploader', !!uploader);

		app.post('/kb', this.set.bind(this));
		app.post('/kb/upload', uploader);
		app.post('/kb/search', this.search.bind(this));
	}

	/**
	 * Actualizamos el vector luego de cargado un documento
	 * se llama mediante una task
	 * @param req
	 * @param res
	 * @returns
	 */
	set = async (req: Request, res: Response) => {
		const { id } = req.params;
		const { path, metadata, token } = req.body;
		if (token !== process.env.GCLOUD_INVOKER) {
			return res.status(400).send({ status: false, error: 'Token request not valid' });
		}

		if (!id) return { status: false, error: `knowledgeBox id is required` };
		if (!path) return { status: false, error: `path is required` };

		const documents = new Documents();
		const response = await documents.prepare(path, metadata);

		const status = !response.status ? 'failed' : 'processed';
		const collection = db.collection('KnowledgeBoxes');
		await collection.doc(id).update({ status });

		if (!response.status) {
			return response;
		}

		if (!documents.items.length) {
			return { status: false, error: `Documents not found in path "${path}"` };
		}

		return await KBModel.update(documents);
	};

	/**
	 * hace una busqueda dentro del vector segun el texto y los filtros pasados como parametros
	 * @param req
	 * @param res
	 * @returns
	 */
	search = async (req: Request, res: Response) => {
		const { text, filter, token } = req.body;

		console.log('search ', text, filter, token);
		if (token !== process.env.GCLOUD_INVOKER) {
			return res.status(400).send({ status: false, error: 'Token request not valid' });
		}

		const { status, error, data } = await KBModel.search(text, filter);
		res.json({ status, error, data });
	};
}

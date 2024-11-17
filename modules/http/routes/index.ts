import type { Application, Response as IResponse, Request } from 'express';
import type { IRoutes } from '@aimpact/agents-api/beyond-js/backend';
// import { KBRoutes } from './kb';
// import { UploadRoutes } from './upload';
import { AudiosRoutes } from './audios';
import { ChatsRoutes } from './chats';
import { ProjectsRoutes } from './projects';
import { PromptsRoutes } from './prompts';
import { UsersRoutes } from './users';
import { join } from 'path';

export /*bundle*/ class Routes implements IRoutes {
	static setup(app: Application) {
		try {
			app.get('/', (req: Request, res: IResponse) => res.send('AImpact Chat API http server'));

			AudiosRoutes.setup(app);
			ChatsRoutes.setup(app);
			ProjectsRoutes.setup(app);
			PromptsRoutes.setup(app);
			UsersRoutes.setup(app);
			// KBRoutes.setup(app);
			// UploadRoutes.setup(app);
		} catch (exc) {
			console.error('Routes error:', exc);
		}
	}
}

export /*bundle*/ async function specs() {
	const { findUp } = await import('find-up');
	const root = await findUp('chat-api', { cwd: __dirname, type: 'directory' });
	return join(root, 'openapi/merged.yaml');
}

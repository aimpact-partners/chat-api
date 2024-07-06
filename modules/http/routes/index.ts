import type { Application, Response as IResponse, Request } from 'express';
// import { KBRoutes } from './kb';
// import { UploadRoutes } from './upload';
import { AudiosRoutes } from './audios';
import { ChatsRoutes } from './chats';
import { ProjectsRoutes } from './projects';
import { PromptsRoutes } from './prompts';
import { UsersRoutes } from './users';

export /*bundle*/ class Routes {
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

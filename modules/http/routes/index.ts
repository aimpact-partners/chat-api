import type { Request, Response as IResponse, Application } from 'express';
// import { KBRoutes } from './kb';
// import { UploadRoutes } from './upload';
import { ChatsRoutes } from './chats';
import { UsersRoutes } from './users';
import { PromptsRoutes } from './prompts';
import { ProjectsRoutes } from './projects';

export /*bundle*/ class Routes {
	static setup(app: Application) {
		try {
			app.get('/', (req: Request, res: IResponse) => res.send('AImpact Chat API http server'));

			UsersRoutes.setup(app);
			ChatsRoutes.setup(app);
			PromptsRoutes.setup(app);
			ProjectsRoutes.setup(app);
			// KBRoutes.setup(app);
			// UploadRoutes.setup(app);
		} catch (exc) {
			console.error('Routes error catched:', exc);
		}
	}
}

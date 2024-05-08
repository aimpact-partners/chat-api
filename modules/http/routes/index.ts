import type { Request, Response as IResponse, Application } from 'express';
import { KBRoutes } from './kb';
import { ChatsRoutes } from './chats';
import { UsersRoutes } from './users';
import { UploadRoutes } from './upload';
import { PromptsRoutes } from './prompts';
import { ProjectsRoutes } from './projects';

export /*bundle*/ class Routes {
	static setup(app: Application) {
		try {
			app.get('/', (req: Request, res: IResponse) => res.send('AImpact Chat API http server'));

			KBRoutes.setup(app);
			UsersRoutes.setup(app);
			ChatsRoutes.setup(app);
			UploadRoutes.setup(app);
			PromptsRoutes.setup(app);
			ProjectsRoutes.setup(app);
		} catch (exc) {
			console.error('Routes error catched:', exc);
		}
	}
}

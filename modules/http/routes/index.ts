import { KBRoutes } from './actions/kb';
import { UsersRoutes } from './actions/users';
import { ChatsRoutes } from './actions/chats';
import { PromptsRoutes } from './actions/prompts';
import { ProjectsRoutes } from './actions/projects';
import { ConversationsRoutes } from './actions/conversations';
import type { Request, Response, Application } from 'express';

export /*bundle*/ class Routes {
	static setup(app: Application) {
		try {
			app.get('/', (req: Request, res: Response) => res.send('AImpact Chat API http server'));

			KBRoutes.setup(app);
			UsersRoutes.setup(app);
			ChatsRoutes.setup(app);
			PromptsRoutes.setup(app);
			ProjectsRoutes.setup(app);
			ConversationsRoutes.setup(app);
		} catch (e) {
			console.error('error catched', e);
		}
	}
}
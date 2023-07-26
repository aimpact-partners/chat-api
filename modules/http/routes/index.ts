import { Chats } from './actions/chats';

import { uploader } from './actions/uploader';

export /*bundle*/
function routes(app) {
	try {
		app.get('/', (req, res) => res.send('AImpact Chat API http server'));
		app.post('/upload', uploader);
		
		new Chats(app);
	}catch(e) {
		console.log("error catched");
		console.error(e);
	}
	
}
``
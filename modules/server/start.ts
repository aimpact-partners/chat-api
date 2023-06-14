import { beyondstarted } from './dotenv';
import { Server } from './server';

console.log(process.env.STORAGEBUCKET);
new Server();

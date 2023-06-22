import { Server } from './server';
import * as dotenv from 'dotenv';
dotenv.config();

!process.env.FUNCTION_REGION && new Server();

import * as functions from '@google-cloud/functions-framework';
import { uploader } from '@aimpact/chat-api/routes';
import * as dotenv from 'dotenv';
dotenv.config();

process.env.FUNCTION_REGION && functions.http('chat-api-uploader', uploader);

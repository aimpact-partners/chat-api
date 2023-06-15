// Initialize library beyondJS backend server
import { listen } from '@beyond-js/backend/listen';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import * as dotenv from 'dotenv';
dotenv.config();

listen();

// Initialize firebase App
initializeApp({ credential: applicationDefault() });

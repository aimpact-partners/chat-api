// Initialize library beyondJS backend server
import { listen } from '@beyond-js/backend/listen';
import * as dotenv from 'dotenv';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
dotenv.config();
console.log(process.env.STORAGEBUCKET);
listen();

// Initialize firebase App

initializeApp({ credential: applicationDefault() });

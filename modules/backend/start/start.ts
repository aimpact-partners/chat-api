// Initialize library beyondJS backend server
import {listen} from '@beyond-js/backend/listen';
listen();

// Initialize firebase App
import {initializeApp, applicationDefault} from 'firebase-admin/app';
initializeApp({credential: applicationDefault()});

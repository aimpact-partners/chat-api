import admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from '@aimpact/chat-api/config/service-account';

initializeApp({ credential: admin.credential.cert(credential) });

export /*bundle*/ const db = getFirestore();

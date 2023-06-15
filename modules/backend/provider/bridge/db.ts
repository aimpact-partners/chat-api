import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseConfig } from '@aimpact/chat-api/firebase-config';

initializeApp(getFirebaseConfig());

export /*bundle*/ const db = getFirestore();

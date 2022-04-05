import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, applicationDefault } from "firebase-admin/app"

initializeApp({ credential: applicationDefault() })

const db = getFirestore()
const auth = getAuth()

export { db, auth }

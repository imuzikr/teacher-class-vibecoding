import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
  updateProfile,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import type { AuthenticatedUser, FirebaseGalleryRecord, PersistedState } from './types.ts';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
);

const firebaseApp = hasFirebaseConfig ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;
const googleProvider = auth ? new GoogleAuthProvider() : null;

function serializeUser(user: User): AuthenticatedUser {
  return {
    uid: user.uid,
    displayName: user.displayName ?? '학습자',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
  };
}

export function subscribeToAuth(callback: (user: AuthenticatedUser | null) => void) {
  if (!auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, (user) => {
    callback(user ? serializeUser(user) : null);
  });
}

export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication이 아직 설정되지 않았습니다.');
  }

  const result = await signInWithPopup(auth, googleProvider);
  return serializeUser(result.user);
}

export async function signInWithEmail(email: string, password: string) {
  if (!auth) {
    throw new Error('Firebase Authentication이 아직 설정되지 않았습니다.');
  }

  const result = await signInWithEmailAndPassword(auth, email, password);
  return serializeUser(result.user);
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  if (!auth) {
    throw new Error('Firebase Authentication이 아직 설정되지 않았습니다.');
  }

  const result = await createUserWithEmailAndPassword(auth, email, password);

  if (name.trim()) {
    await updateProfile(result.user, {
      displayName: name.trim(),
    });
  }

  return serializeUser(auth.currentUser ?? result.user);
}

export async function signOutFromFirebase() {
  if (!auth) {
    return;
  }

  await signOut(auth);
}

export async function loadUserState(uid: string) {
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, 'users', uid, 'app', 'current'));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return (data.state ?? null) as PersistedState | null;
}

export async function saveUserState(uid: string, state: PersistedState, user?: AuthenticatedUser | null) {
  if (!db) {
    return;
  }

  await setDoc(
    doc(db, 'users', uid, 'app', 'current'),
    {
      state,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  if (user) {
    await setDoc(
      doc(db, 'users', uid),
      {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
}

export async function fetchGalleryRecords(): Promise<FirebaseGalleryRecord[]> {
  if (!db) {
    return [];
  }

  const userSnapshots = await getDocs(collection(db, 'users'));
  const records = await Promise.all(
    userSnapshots.docs.map(async (userDoc) => {
      const profile = userDoc.data();
      const stateSnapshot = await getDoc(doc(db, 'users', userDoc.id, 'app', 'current'));
      const stateData = stateSnapshot.exists() ? ((stateSnapshot.data().state ?? null) as PersistedState | null) : null;

      return {
        uid: userDoc.id,
        displayName: String(profile.displayName ?? '학습자'),
        email: String(profile.email ?? ''),
        photoURL: String(profile.photoURL ?? ''),
        state: stateData,
      };
    }),
  );

  return records;
}

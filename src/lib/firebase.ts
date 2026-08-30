import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Member, MembershipPlan, ActivityLog, SystemSettings, INITIAL_MEMBERS, INITIAL_PLANS, INITIAL_ACTIVITY_LOGS, DEFAULT_SETTINGS } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use specified custom Firestore database ID if provided
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Auth helper functions
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    return { user: null, error: error?.message || 'Google sign-in failed' };
  }
}

export async function loginWithEmail(email: string, pass: string) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return { user: res.user, error: null };
  } catch (error: any) {
    console.error('Error logging in with email:', error);
    return { user: null, error: error?.message || 'Login failed' };
  }
}

export async function registerWithEmail(email: string, pass: string) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    return { user: res.user, error: null };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { user: null, error: error?.message || 'Registration failed' };
  }
}

export async function logoutUser() {
  try {
    await fbSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { success: false, error: error?.message };
  }
}

// Ensure initial documents exist for a new user in Firestore
export async function initializeUserGymData(userId: string, defaultOwnerName?: string, defaultGymName?: string) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      // 1. Create main user document
      const initialSettings: SystemSettings = {
        ...DEFAULT_SETTINGS,
        ownerName: defaultOwnerName || DEFAULT_SETTINGS.ownerName,
        gymName: defaultGymName || DEFAULT_SETTINGS.gymName,
      };

      await setDoc(userDocRef, {
        ownerName: initialSettings.ownerName,
        gymName: initialSettings.gymName,
        currency: initialSettings.currency,
        reminderTemplates: initialSettings.reminderTemplates,
        createdAt: new Date().toISOString()
      }, { merge: true });

      // 2. Populate initial plans
      const plansCol = collection(db, 'users', userId, 'plans');
      const plansSnap = await getDocs(plansCol);
      if (plansSnap.empty) {
        const batch = writeBatch(db);
        INITIAL_PLANS.forEach(plan => {
          const pRef = doc(db, 'users', userId, 'plans', plan.id);
          batch.set(pRef, plan);
        });
        await batch.commit();
      }
    }
  } catch (error) {
    console.error('Error initializing user gym data in Firestore:', error);
  }
}

// Real-time listener for user settings
export function subscribeToSettings(userId: string, onUpdate: (settings: SystemSettings) => void) {
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(userDocRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      onUpdate({
        gymName: data.gymName || DEFAULT_SETTINGS.gymName,
        ownerName: data.ownerName || DEFAULT_SETTINGS.ownerName,
        currency: data.currency || DEFAULT_SETTINGS.currency,
        reminderTemplates: data.reminderTemplates || DEFAULT_SETTINGS.reminderTemplates,
      });
    }
  }, (err) => {
    console.error('Settings subscription error:', err);
  });
}

// Real-time listener for members
export function subscribeToMembers(userId: string, onUpdate: (members: Member[]) => void) {
  const membersCol = collection(db, 'users', userId, 'members');
  return onSnapshot(membersCol, (snap) => {
    const list: Member[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Member;
      list.push({ ...data, id: docSnap.id });
    });
    if (list.length > 0) {
      onUpdate(list);
    }
  }, (err) => {
    console.error('Members subscription error:', err);
  });
}

// Real-time listener for plans
export function subscribeToPlans(userId: string, onUpdate: (plans: MembershipPlan[]) => void) {
  const plansCol = collection(db, 'users', userId, 'plans');
  return onSnapshot(plansCol, (snap) => {
    const list: MembershipPlan[] = [];
    snap.forEach((docSnap) => {
      list.push({ ...(docSnap.data() as MembershipPlan), id: docSnap.id });
    });
    if (list.length > 0) {
      // Sort numerically by durationMonths
      list.sort((a, b) => (a.durationMonths || 0) - (b.durationMonths || 0));
      onUpdate(list);
    }
  }, (err) => {
    console.error('Plans subscription error:', err);
  });
}

// Real-time listener for activity logs
export function subscribeToLogs(userId: string, onUpdate: (logs: ActivityLog[]) => void) {
  const logsCol = collection(db, 'users', userId, 'activityLogs');
  return onSnapshot(logsCol, (snap) => {
    const list: ActivityLog[] = [];
    snap.forEach((docSnap) => {
      list.push({ ...(docSnap.data() as ActivityLog), id: docSnap.id });
    });
    if (list.length > 0) {
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(list);
    }
  }, (err) => {
    console.error('Logs subscription error:', err);
  });
}

// Save or update single member in Firestore
export async function saveMemberToFirestore(userId: string, member: Member) {
  try {
    const mRef = doc(db, 'users', userId, 'members', member.id);
    await setDoc(mRef, member, { merge: true });
  } catch (error) {
    console.error('Error saving member to Firestore:', error);
    throw error;
  }
}

// Delete member in Firestore
export async function deleteMemberFromFirestore(userId: string, memberId: string) {
  try {
    const mRef = doc(db, 'users', userId, 'members', memberId);
    await deleteDoc(mRef);
  } catch (error) {
    console.error('Error deleting member from Firestore:', error);
    throw error;
  }
}

// Save activity log
export async function saveLogToFirestore(userId: string, log: ActivityLog) {
  try {
    const lRef = doc(db, 'users', userId, 'activityLogs', log.id);
    await setDoc(lRef, log);
  } catch (error) {
    console.error('Error saving log to Firestore:', error);
  }
}

// Save settings to user document
export async function saveSettingsToFirestore(userId: string, settings: SystemSettings) {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      gymName: settings.gymName,
      ownerName: settings.ownerName,
      currency: settings.currency,
      reminderTemplates: settings.reminderTemplates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving settings to Firestore:', error);
    throw error;
  }
}

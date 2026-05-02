// Admin-only helpers
import { db, doc, updateDoc, deleteDoc, addDoc, collection, serverTimestamp } from "./firebase.js";

export const updateMember = (uid, data) => updateDoc(doc(db, "users", uid), data);
export const deleteMember = (uid) => deleteDoc(doc(db, "users", uid));

export const createContributionType = (data) =>
  addDoc(collection(db, "contributionTypes"), { ...data, createdAt: serverTimestamp() });

export const postAnnouncement = (data) =>
  addDoc(collection(db, "announcements"), { ...data, createdAt: serverTimestamp() });

export const logSMS = (data) =>
  addDoc(collection(db, "smsLogs"), { ...data, createdAt: serverTimestamp() });

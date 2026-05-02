// Auth helpers
import {
  auth, db, storage,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  doc, setDoc, getDoc, sRef, uploadBytes, getDownloadURL, serverTimestamp
} from "./firebase.js";

export async function uploadImage(file, path) {
  if (!file) return "";
  const r = sRef(storage, path);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
}

export async function registerUser(form, profileFile, partnerFile) {
  // Prevent duplicate by email is enforced by Firebase Auth itself.
  const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
  const uid = cred.user.uid;

  let photoURL = "";
  if (profileFile) photoURL = await uploadImage(profileFile, `users/${uid}/profile.jpg`);

  let partnerPhotoURL = "";
  if (partnerFile) partnerPhotoURL = await uploadImage(partnerFile, `users/${uid}/partner.jpg`);

  const data = {
    uid,
    firstName: form.firstName,
    middleName: form.middleName || "",
    lastName: form.lastName,
    fullName: `${form.firstName} ${form.middleName || ""} ${form.lastName}`.replace(/\s+/g, " ").trim(),
    dob: form.dob,
    gender: form.gender,
    phone: form.phone,
    email: form.email,
    occupation: form.occupation,
    region: form.region,
    district: form.district,
    relationship: form.relationship, // none | married | engaged
    partner: form.relationship !== "none" ? {
      firstName: form.partnerFirstName || "",
      middleName: form.partnerMiddleName || "",
      lastName: form.partnerLastName || "",
      phone: form.partnerPhone || "",
      photoURL: partnerPhotoURL
    } : null,
    photoURL,
    role: "member",
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, "users", uid), data);
  return data;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  return snap.exists() ? snap.data() : null;
}

export async function logoutUser() {
  await signOut(auth);
}

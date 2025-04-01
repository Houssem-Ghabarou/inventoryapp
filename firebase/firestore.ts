import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// Generic function to get all documents from a collection
export const getCollection = async (collectionName: string) => {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Get a single document by ID
export const getDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } else {
    return null;
  }
};

// Add a new document to a collection
export const addDocument = async (collectionName: string, data: any) => {
  const collectionRef = collection(db, collectionName);
  const docRef = await addDoc(collectionRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Update a document
export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: any
) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return docId;
};

// Delete a document
export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
  return docId;
};

// Query documents with conditions
export const queryDocuments = async (
  collectionName: string,
  conditions: Array<{ field: string; operator: string; value: any }>,
  orderByField?: string,
  orderDirection?: "asc" | "desc",
  limitCount?: number
) => {
  const collectionRef = collection(db, collectionName);

  // Build the query with conditions
  let q = query(collectionRef);

  conditions.forEach((condition) => {
    q = query(
      q,
      where(condition.field, condition.operator as any, condition.value)
    );
  });

  // Add ordering if specified
  if (orderByField) {
    q = query(q, orderBy(orderByField, orderDirection || "asc"));
  }

  // Add limit if specified
  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

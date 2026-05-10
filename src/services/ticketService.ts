import { 
  collection, 
  query, 
  where, 
  or,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Ticket, TicketStatus, TicketPriority, Comment } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const TICKETS_COLLECTION = 'tickets';

export async function getTickets(userId?: string, role?: string) {
  let q;
  
  if (role === 'EMPLOYEE' && userId) {
    q = query(
      collection(db, TICKETS_COLLECTION), 
      or(
        where('assignedToId', '==', userId),
        where('createdById', '==', userId)
      ),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, TICKETS_COLLECTION), orderBy('createdAt', 'desc'));
  }
  
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      };
    }) as Ticket[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, TICKETS_COLLECTION);
    return [];
  }
}

export function subscribeTickets(callback: (tickets: Ticket[]) => void, userId?: string, role?: string) {
  let q;
  
  if (role === 'EMPLOYEE' && userId) {
    q = query(
      collection(db, TICKETS_COLLECTION), 
      or(
        where('assignedToId', '==', userId),
        where('createdById', '==', userId)
      ),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, TICKETS_COLLECTION), orderBy('createdAt', 'desc'));
  }
  
  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      };
    }) as Ticket[];
    callback(tickets);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, TICKETS_COLLECTION);
  });
}

export async function createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, TICKETS_COLLECTION), {
      ...ticket,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, TICKETS_COLLECTION);
  }
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
  try {
    await updateDoc(ticketRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${TICKETS_COLLECTION}/${ticketId}`);
  }
}

export async function updateTicket(ticketId: string, updates: Partial<Ticket>) {
  const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
  try {
    await updateDoc(ticketRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${TICKETS_COLLECTION}/${ticketId}`);
  }
}

export async function deleteTicket(ticketId: string) {
  try {
    await deleteDoc(doc(db, TICKETS_COLLECTION, ticketId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${TICKETS_COLLECTION}/${ticketId}`);
  }
}

// Comments
export function subscribeComments(ticketId: string, callback: (comments: Comment[]) => void) {
  const q = query(collection(db, TICKETS_COLLECTION, ticketId, 'comments'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    }) as Comment[];
    callback(comments);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `${TICKETS_COLLECTION}/${ticketId}/comments`);
  });
}

export async function addComment(ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>) {
  try {
    await addDoc(collection(db, TICKETS_COLLECTION, ticketId, 'comments'), {
      ...comment,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${TICKETS_COLLECTION}/${ticketId}/comments`);
  }
}

// Users
export async function getAllEmployees() {
  const q = query(collection(db, 'users'), where('role', '==', 'EMPLOYEE'));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
}

export async function getAllUsers() {
  const q = query(collection(db, 'users'), orderBy('name', 'asc'));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
}

export async function updateUserRole(userId: string, role: 'ADMIN' | 'EMPLOYEE') {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

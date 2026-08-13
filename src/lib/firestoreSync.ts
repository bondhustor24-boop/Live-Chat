import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  try {
    return (import.meta as any)?.env?.[key];
  } catch (e) {
    return undefined;
  }
};

const firebaseConfig = {
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || firebaseAppletConfig.projectId,
  appId: getEnv('VITE_FIREBASE_APP_ID') || firebaseAppletConfig.appId,
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || firebaseAppletConfig.apiKey,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || firebaseAppletConfig.authDomain,
  firestoreDatabaseId: getEnv('VITE_FIREBASE_DATABASE_ID') || firebaseAppletConfig.firestoreDatabaseId,
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || firebaseAppletConfig.storageBucket,
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || firebaseAppletConfig.messagingSenderId,
};

// Initialize Firebase App
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore instance for specific database ID
const dbId = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId.trim() !== '')
  ? firebaseConfig.firestoreDatabaseId
  : '(default)';

let firestoreDb: any;
try {
  firestoreDb = initializeFirestore(firebaseApp, {
    experimentalAutoDetectLongPolling: true,
  }, dbId);
} catch (e) {
  firestoreDb = getFirestore(firebaseApp, dbId);
}

export const db = firestoreDb;

// Collection References
const CHATS_COL = 'chats';
const MESSAGES_COL = 'messages';
const SETTINGS_COL = 'settings';
const TYPING_COL = 'typing_status';
const BLOCKED_COL = 'blocked_users';

// Save or Update Blocked User in Firestore
export async function syncBlockedUserToFirestore(blockedUser: any) {
  if (!blockedUser || !blockedUser.id) return;
  try {
    const docRef = doc(db, BLOCKED_COL, blockedUser.id);
    await setDoc(docRef, JSON.parse(JSON.stringify(blockedUser)), { merge: true });
  } catch (err) {
    console.error('Error syncing blocked user to Firestore:', err);
  }
}

// Remove Blocked User from Firestore
export async function deleteBlockedUserFromFirestore(id: string) {
  if (!id) return;
  try {
    const docRef = doc(db, BLOCKED_COL, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting blocked user from Firestore:', err);
  }
}

// Save or Update Typing Status in Firestore
export async function syncTypingStatusToFirestore(chatId: string, senderRole: 'customer' | 'agent', isTyping: boolean, senderName?: string) {
  if (!chatId) return;
  try {
    const docId = `${chatId}_${senderRole}`;
    const typingRef = doc(db, TYPING_COL, docId);
    await setDoc(typingRef, {
      chatId,
      senderRole,
      isTyping,
      senderName: senderName || (senderRole === 'customer' ? 'Customer' : 'Agent'),
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Error syncing typing status to Firestore:', err);
  }
}

// Save or Update a Chat in Firestore
export async function syncChatToFirestore(chat: any) {
  if (!chat || !chat.id) return;
  try {
    const chatRef = doc(db, CHATS_COL, chat.id);
    await setDoc(chatRef, JSON.parse(JSON.stringify(chat)), { merge: true });
  } catch (err) {
    console.error(`Firestore sync error for chat ${chat.id}:`, err);
  }
}

// Delete a Chat and its messages from Firestore
export async function deleteChatFromFirestore(chatId: string) {
  if (!chatId) return;
  try {
    const chatRef = doc(db, CHATS_COL, chatId);
    await deleteDoc(chatRef);

    // Also remove messages for this chat
    const messagesSnap = await getDocs(collection(db, MESSAGES_COL));
    messagesSnap.forEach(async (docSnap) => {
      const msg = docSnap.data();
      if (msg && msg.chatId === chatId) {
        await deleteDoc(doc(db, MESSAGES_COL, docSnap.id));
      }
    });
  } catch (err) {
    console.error(`Firestore delete error for chat ${chatId}:`, err);
  }
}

// Save or Update a Message in Firestore
export async function syncMessageToFirestore(message: any) {
  if (!message || !message.id) return;
  try {
    const cleanData = JSON.parse(JSON.stringify(message));
    if (!cleanData.createdAt) {
      cleanData.createdAt = new Date().toISOString();
    }
    const msgRef = doc(db, MESSAGES_COL, message.id);
    await setDoc(msgRef, cleanData, { merge: true });
  } catch (err) {
    console.error(`Firestore sync error for message ${message.id}:`, err);
  }
}

// Save Widget Config Settings to Firestore
export async function syncWidgetConfigToFirestore(config: any) {
  try {
    const configRef = doc(db, SETTINGS_COL, 'widgetConfig');
    await setDoc(configRef, JSON.parse(JSON.stringify(config)), { merge: true });
  } catch (err) {
    console.error('Firestore sync error for widgetConfig:', err);
  }
}

// Fetch all initial data from Firestore
export async function loadFirestoreData() {
  try {
    const chatsSnap = await getDocs(collection(db, CHATS_COL));
    const messagesSnap = await getDocs(collection(db, MESSAGES_COL));
    const settingsSnap = await getDocs(collection(db, SETTINGS_COL));
    const blockedSnap = await getDocs(collection(db, BLOCKED_COL));

    const loadedChats: any[] = [];
    chatsSnap.forEach((docSnap) => {
      loadedChats.push(docSnap.data());
    });

    const loadedMessages: Record<string, any[]> = {};
    messagesSnap.forEach((docSnap) => {
      const msg = docSnap.data();
      if (msg && msg.chatId) {
        if (!loadedMessages[msg.chatId]) loadedMessages[msg.chatId] = [];
        loadedMessages[msg.chatId].push(msg);
      }
    });

    // Sort messages in each chat chronologically
    for (const chatId in loadedMessages) {
      loadedMessages[chatId].sort((a, b) => {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return timeA - timeB;
      });
    }

    let loadedConfig = null;
    settingsSnap.forEach((docSnap) => {
      if (docSnap.id === 'widgetConfig') {
        loadedConfig = docSnap.data();
      }
    });

    const loadedBlocked: any[] = [];
    blockedSnap.forEach((docSnap) => {
      loadedBlocked.push(docSnap.data());
    });

    return {
      chats: loadedChats,
      messages: loadedMessages,
      widgetConfig: loadedConfig,
      blockedUsers: loadedBlocked,
    };
  } catch (err) {
    console.error('Error loading data from Firestore:', err);
    return null;
  }
}

// Realtime Firestore Listener
export function setupFirestoreRealtimeListeners(
  onChatsUpdate: (chats: any[]) => void,
  onMessagesUpdate: (messagesMap: Record<string, any[]>) => void,
  onTypingUpdate?: (chatId: string, senderRole: 'customer' | 'agent', isTyping: boolean, senderName?: string) => void,
  onBlockedUsersUpdate?: (blockedUsers: any[]) => void
) {
  let unsubscribeChats: (() => void) | null = null;
  let unsubscribeMessages: (() => void) | null = null;
  let unsubscribeTyping: (() => void) | null = null;
  let unsubscribeBlocked: (() => void) | null = null;

  const listenChats = () => {
    try {
      if (unsubscribeChats) {
        try { unsubscribeChats(); } catch (e) {}
      }
      unsubscribeChats = onSnapshot(
        collection(db, CHATS_COL),
        (snapshot) => {
          const chatsList: any[] = [];
          snapshot.forEach((d) => chatsList.push(d.data()));
          // Sort chats by updatedAt desc
          chatsList.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
          onChatsUpdate(chatsList);
        },
        (error) => {
          // Idle stream disconnect or cancelled listener, auto-reconnect
          console.log('Firestore chats listener idle/reconnect event:', error.message || error);
          setTimeout(() => {
            listenChats();
          }, 2000);
        }
      );
    } catch (e) {
      console.warn('Error initiating chats listener:', e);
    }
  };

  const listenMessages = () => {
    try {
      if (unsubscribeMessages) {
        try { unsubscribeMessages(); } catch (e) {}
      }
      unsubscribeMessages = onSnapshot(
        collection(db, MESSAGES_COL),
        (snapshot) => {
          const messagesMap: Record<string, any[]> = {};
          snapshot.forEach((d) => {
            const msg = d.data();
            if (msg && msg.chatId) {
              if (!messagesMap[msg.chatId]) messagesMap[msg.chatId] = [];
              messagesMap[msg.chatId].push(msg);
            }
          });
          // Sort messages in each chat chronologically
          for (const chatId in messagesMap) {
            messagesMap[chatId].sort((a, b) => {
              const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
              const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
              return timeA - timeB;
            });
          }
          onMessagesUpdate(messagesMap);
        },
        (error) => {
          // Idle stream disconnect or cancelled listener, auto-reconnect
          console.log('Firestore messages listener idle/reconnect event:', error.message || error);
          setTimeout(() => {
            listenMessages();
          }, 2000);
        }
      );
    } catch (e) {
      console.warn('Error initiating messages listener:', e);
    }
  };

  const listenTyping = () => {
    if (!onTypingUpdate) return;
    try {
      if (unsubscribeTyping) {
        try { unsubscribeTyping(); } catch (e) {}
      }
      unsubscribeTyping = onSnapshot(
        collection(db, TYPING_COL),
        (snapshot) => {
          const now = Date.now();
          snapshot.forEach((d) => {
            const data = d.data();
            if (data && data.chatId) {
              // Ignore typing status older than 6 seconds
              const isRecent = data.updatedAt && (now - data.updatedAt < 6000);
              const isTypingActive = data.isTyping && isRecent;
              onTypingUpdate(data.chatId, data.senderRole, isTypingActive, data.senderName);
            }
          });
        },
        (error) => {
          console.log('Firestore typing listener idle/reconnect event:', error.message || error);
          setTimeout(() => {
            listenTyping();
          }, 2000);
        }
      );
    } catch (e) {
      console.warn('Error initiating typing listener:', e);
    }
  };

  const listenBlocked = () => {
    if (!onBlockedUsersUpdate) return;
    try {
      if (unsubscribeBlocked) {
        try { unsubscribeBlocked(); } catch (e) {}
      }
      unsubscribeBlocked = onSnapshot(
        collection(db, BLOCKED_COL),
        (snapshot) => {
          const blockedList: any[] = [];
          snapshot.forEach((d) => blockedList.push(d.data()));
          onBlockedUsersUpdate(blockedList);
        },
        (error) => {
          console.log('Firestore blocked users listener idle/reconnect event:', error.message || error);
          setTimeout(() => {
            listenBlocked();
          }, 2000);
        }
      );
    } catch (e) {
      console.warn('Error initiating blocked listener:', e);
    }
  };

  listenChats();
  listenMessages();
  listenTyping();
  listenBlocked();
}

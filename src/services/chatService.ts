import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Message } from '../types/chat';

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  conversationId?: string; // Voiceflow conversation ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  messages: Message[];
  messageCount?: number;
}

class ChatService {
  private chatsCollection = 'chats';

  async createChatSession(userId: string, title: string = 'New Chat', conversationId?: string): Promise<string> {
    const chatData: any = {
      userId,
      title,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      messages: [],
      messageCount: 0
    };

    if (conversationId) {
      chatData.conversationId = conversationId;
    }

    const docRef = await addDoc(collection(db, this.chatsCollection), chatData);
    return docRef.id;
  }

  async getUserChats(userId: string): Promise<ChatSession[]> {
    const q = query(
      collection(db, this.chatsCollection),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatSession));
  }

  async addMessage(chatId: string, message: Message, conversationId?: string): Promise<void> {
    const chatRef = doc(db, this.chatsCollection, chatId);
    const chatDoc = await getDocs(query(collection(db, this.chatsCollection), where('__name__', '==', chatId)));
    const chatData = chatDoc.docs[0].data() as ChatSession;

    const updatedMessages = [...chatData.messages, message];
    const messageCount = updatedMessages.length;

    const updateData: any = {
      messages: updatedMessages,
      messageCount,
      updatedAt: Timestamp.now(),
      title: updatedMessages.length > 1 ? this.generateTitle(updatedMessages) : chatData.title
    };

    if (conversationId) {
      updateData.conversationId = conversationId;
    }

    await updateDoc(chatRef, updateData);
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    const chatDoc = await getDocs(query(collection(db, this.chatsCollection), where('__name__', '==', chatId)));
    const chatData = chatDoc.docs[0].data() as ChatSession;
    return chatData.messages || [];
  }

  async getChatById(chatId: string): Promise<ChatSession> {
    const chatDoc = await getDocs(query(collection(db, this.chatsCollection), where('__name__', '==', chatId)));
    const chatData = chatDoc.docs[0].data() as Omit<ChatSession, 'id'>;
    return {
      id: chatDoc.docs[0].id,
      ...chatData
    };
  }

  async deleteChat(chatId: string): Promise<void> {
    const chatRef = doc(db, this.chatsCollection, chatId);
    await deleteDoc(chatRef);
  }

  private generateTitle(messages: Message[]): string {
    const firstUserMessage = messages.find(m => m.sender === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
    }
    return 'New Chat';
  }
}

export const chatService = new ChatService();
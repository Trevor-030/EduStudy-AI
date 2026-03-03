import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Message } from '../types/chat';
import { voiceflowService } from './voiceflowService';

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

    try {
      const docRef = await this.withTimeout(addDoc(collection(db, this.chatsCollection), chatData), 10000);
      return docRef.id;
    } catch (error) {
      console.error('Failed to create chat session:', error);
      throw error;
    }
  }

  async getUserChats(userId: string): Promise<ChatSession[]> {
    try {
      const q = query(
        collection(db, this.chatsCollection),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await this.withTimeout(getDocs(q), 10000);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatSession));
    } catch (error) {
      console.error('Failed to get user chats:', error);
      return []; // Return empty array on error
    }
  }

  async addMessage(chatId: string, message: Message, conversationId?: string): Promise<void> {
    try {
      const chatRef = doc(db, this.chatsCollection, chatId);
      const chatSnap = await this.withTimeout(getDoc(chatRef), 5000);
      if (!chatSnap.exists()) {
        throw new Error(`Chat document ${chatId} not found`);
      }
      const chatData = chatSnap.data() as ChatSession;

      const updatedMessages = [...chatData.messages, message];
      const messageCount = updatedMessages.length;

      const updateData: any = {
        messages: updatedMessages,
        messageCount,
        updatedAt: Timestamp.now(),
        title: this.generateTitle(updatedMessages)
      };

      if (conversationId) {
        updateData.conversationId = conversationId;
      }

      await this.withTimeout(updateDoc(chatRef, updateData), 10000);
    } catch (error) {
      console.error('Failed to add message:', error);
      throw error;
    }
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    try {
      const chatRef = doc(db, this.chatsCollection, chatId);
      const chatSnap = await this.withTimeout(getDoc(chatRef), 5000);
      if (!chatSnap.exists()) {
        return [];
      }
      const chatData = chatSnap.data() as ChatSession;
      return chatData.messages || [];
    } catch (error) {
      console.error('Failed to get chat messages:', error);
      return [];
    }
  }

  async getChatById(chatId: string): Promise<ChatSession> {
    try {
      const chatRef = doc(db, this.chatsCollection, chatId);
      const chatSnap = await this.withTimeout(getDoc(chatRef), 5000);
      if (!chatSnap.exists()) {
        throw new Error(`Chat ${chatId} not found`);
      }
      const chatData = chatSnap.data();
      return {
        id: chatSnap.id,
        ...chatData
      } as ChatSession;
    } catch (error) {
      console.error('Failed to get chat by ID:', error);
      throw error;
    }
  }

  async renameChat(chatId: string, newTitle: string): Promise<void> {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      throw new Error('Chat name cannot be empty');
    }
    if (trimmedTitle.length > 50) {
      throw new Error('Chat name must be 50 characters or less');
    }
    // Simple offensive content check - can be expanded
    const offensiveWords = ['offensive', 'badword1', 'badword2']; // Add more as needed
    const lowerTitle = trimmedTitle.toLowerCase();
    if (offensiveWords.some(word => lowerTitle.includes(word))) {
      throw new Error('Chat name contains inappropriate content');
    }

    try {
      // Get the chat document to check for conversationId
      const chatRef = doc(db, this.chatsCollection, chatId);
      const chatSnap = await this.withTimeout(getDoc(chatRef), 5000);
      if (!chatSnap.exists()) {
        throw new Error(`Chat ${chatId} not found`);
      }
      const chatData = chatSnap.data() as ChatSession;

      // Update Firestore
      await this.withTimeout(updateDoc(chatRef, {
        title: trimmedTitle,
        updatedAt: Timestamp.now()
      }), 10000);

      // Update Voiceflow conversation name if conversationId exists
      if (chatData.conversationId) {
        await voiceflowService.updateConversationName(chatData.conversationId, trimmedTitle);
      }
    } catch (error) {
      console.error('Failed to rename chat:', error);
      throw error;
    }
  }

  async deleteChat(chatId: string): Promise<void> {
    try {
      const chatRef = doc(db, this.chatsCollection, chatId);
      await this.withTimeout(deleteDoc(chatRef), 5000);
    } catch (error) {
      console.error('Failed to delete chat:', error);
      throw error;
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
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
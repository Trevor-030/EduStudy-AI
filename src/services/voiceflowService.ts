import type { Message, MessageType } from '../types/chat';

interface VoiceflowResponse {
  type: string;
  payload?: any;
  text?: string;
}

interface VoiceflowMessage {
  type: string;
  payload?: any;
  text?: string;
}

class VoiceflowService {
  private apiKey: string;
  private versionId: string;
  private baseUrl = 'https://general-runtime.voiceflow.com';

  constructor() {
    this.apiKey = import.meta.env.VITE_VOICEFLOW_API_KEY;
    this.versionId = import.meta.env.VITE_VOICEFLOW_VERSION_ID;

    if (!this.apiKey || !this.versionId) {
      throw new Error('Voiceflow API key and version ID must be configured in environment variables');
    }
  }

  async sendMessage(message: string, conversationId?: string): Promise<{ messages: Message[]; conversationId: string }> {
    try {
      const usedId = conversationId || Date.now().toString();
      const url = `${this.baseUrl}/state/${this.versionId}/user/${usedId}/interact`;

      const requestBody = {
        action: {
          type: 'text',
          payload: { text: message },
        },
        config: {
          tts: false,
          stripSSML: true,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Voiceflow API error:', response.status, errorText);
        throw new Error(`Voiceflow API error: ${response.status} ${response.statusText}`);
      }

      const data: VoiceflowMessage[] = await response.json();

      // Extract conversation ID from response
      // Voiceflow typically returns conversation ID in response data or headers
      let newConversationId = usedId;

      // Check if any response item contains conversation info
      const conversationItem = data.find(item =>
        item.type === 'conversation' ||
        item.type === 'session' ||
        (item.payload && typeof item.payload === 'object' && 'conversationId' in item.payload)
      );

      if (conversationItem?.payload?.conversationId) {
        newConversationId = conversationItem.payload.conversationId;
      } else if (response.headers.get('conversation-id')) {
        newConversationId = response.headers.get('conversation-id')!;
      } else if (response.headers.get('x-conversation-id')) {
        newConversationId = response.headers.get('x-conversation-id')!;
      }


      // Process the response to create Message objects
      const messages: Message[] = data
        .filter(item => item.type === 'text' || item.type === 'quiz' || item.type === 'lesson' || item.type === 'interactive')
        .map((item, index) => {
          const baseMessage = {
            id: `${Date.now()}-${index}`,
            sender: 'ai' as const,
            timestamp: new Date(),
            avatar: '/ai-avatar.png',
          };

          if (item.type === 'text') {
            return {
              ...baseMessage,
              type: 'text' as MessageType,
              content: item.payload?.message || item.text || '',
            };
          } else if (item.type === 'quiz' && item.payload) {
            return {
              ...baseMessage,
              type: 'quiz' as MessageType,
              content: item.payload.question || '',
              quizData: {
                question: item.payload.question || '',
                options: item.payload.options || [],
              },
            };
          } else if (item.type === 'lesson' && item.payload) {
            return {
              ...baseMessage,
              type: 'lesson' as MessageType,
              content: item.payload.title || '',
              lessonData: {
                title: item.payload.title || '',
                content: item.payload.content || '',
              },
            };
          } else if (item.type === 'interactive' && item.payload) {
            return {
              ...baseMessage,
              type: 'interactive' as MessageType,
              content: item.payload.prompt || '',
              interactiveData: {
                prompt: item.payload.prompt || '',
                choices: item.payload.choices || [],
              },
            };
          } else {
            // Fallback to text
            return {
              ...baseMessage,
              type: 'text' as MessageType,
              content: item.text || 'Unsupported message type.',
            };
          }
        });

      if (messages.length === 0) {
        messages.push({
          id: `${Date.now()}-fallback`,
          type: 'text',
          content: 'I\'m sorry, I couldn\'t process that response.',
          sender: 'ai',
          timestamp: new Date(),
          avatar: '/ai-avatar.png',
        });
      }

      return {
        messages,
        conversationId: newConversationId,
      };
    } catch (error) {
      console.error('Voiceflow API error:', error);
      throw new Error('Failed to communicate with Voiceflow API');
    }
  }
}

export const voiceflowService = new VoiceflowService();
import React, { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../contexts/MessagesContext';
import { useApiKey } from '../contexts/ApiKeyContext';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const ChatWindow: React.FC = () => {
  const { messages, addMessage, clearMessages } = useMessages();
  const { apiKey } = useApiKey();
  const [isTyping, setIsTyping] = useState(false);

  const callOpenAI = async (userMessage: string) => {
    if (!apiKey) {
      addMessage({ text: 'API key not set. Please set your OpenAI API key.', sender: 'bot' });
      return;
    }

    setIsTyping(true);
    try {
      const response = await fetch(`https://general-runtime.voiceflow.com/v2/project/${apiKey}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          action: {
            type: 'text',
            payload: userMessage,
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          addMessage({ text: 'Invalid API key. Please check your Voiceflow API key.', sender: 'bot' });
        } else if (response.status === 429) {
          addMessage({ text: 'Rate limit exceeded. Please try again later.', sender: 'bot' });
        } else {
          addMessage({ text: `API error: ${response.status} ${response.statusText}`, sender: 'bot' });
        }
        return;
      }

      const data = await response.json();
      // Assuming the response has the message in data[0].payload.message or similar
      const aiMessage = data[0]?.payload?.message || 'No response from Voiceflow';
      addMessage({ text: aiMessage, sender: 'bot' });
    } catch (error) {
      addMessage({ text: 'Network error. Please check your connection and try again.', sender: 'bot' });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (message: string) => {
    const newMessage: Message = { text: message, sender: 'user' };
    addMessage(newMessage);
    callOpenAI(message);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-lg">
      <div className="flex justify-end p-2">
        <button
          onClick={clearMessages}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Chat
        </button>
      </div>
      <MessageList messages={messages} isTyping={isTyping} />
      <MessageInput onSend={handleSend} />
    </div>
  );
};

export default React.memo(ChatWindow);
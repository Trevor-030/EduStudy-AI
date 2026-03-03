import type { Message } from "../types/chat";

class VoiceflowService {
  private apiKey: string;
  private versionId: string;
  private projectId: string;
  private baseUrl = "https://general-runtime.voiceflow.com";

  constructor() {
    this.apiKey = import.meta.env.VITE_VOICEFLOW_API_KEY;
    this.versionId = import.meta.env.VITE_VOICEFLOW_VERSION_ID;
    this.projectId = import.meta.env.VITE_VOICEFLOW_PROJECT_ID;

    if (!this.apiKey || !this.versionId || !this.projectId) {
      throw new Error("Voiceflow API key, version ID, and project ID must be configured");
    }
  }

  async updateConversationName(conversationId: string, name: string): Promise<void> {
    try {
      const url = `https://api.voiceflow.com/v2/projects/${this.projectId}/conversations/${conversationId}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const err = await response.text();
        console.error('VF Update Conversation Error:', err);
        throw new Error(`Voiceflow API error: ${response.status} ${response.statusText} - ${err}`);
      }

      console.log('Conversation name updated successfully in Voiceflow');
    } catch (error) {
      console.error('Failed to update conversation name in Voiceflow:', error);
      // Don't throw error to avoid breaking the rename if Voiceflow update fails
      // The local rename will still work
    }
  }

  async sendMessage(
    message: string,
    conversationId?: string,
    userId?: string
  ): Promise<{ messages: Message[]; conversationId: string }> {
    try {
      const usedUserId = userId || `user_${Date.now()}`;
      const usedConversationId = conversationId || usedUserId;

      const url = `${this.baseUrl}/state/${this.versionId}/user/${usedUserId}/interact`;

      console.log("VF Endpoint:", url);

      // Add timeout logic
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds
      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: {
              type: "text",
              payload: message,
            },
          }),
          signal: controller.signal,
        });
      } catch (fetchError) {
        clearTimeout(timeout);
        throw new Error("Network error or request timed out: " + fetchError);
      }
      clearTimeout(timeout);

      if (!response.ok) {
        const err = await response.text();
        console.error("VF ERROR:", err);
        throw new Error(`Voiceflow API error: ${response.status} ${response.statusText} - ${err}`);
      }

      let traces;
      try {
        traces = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse Voiceflow response as JSON', jsonError);
        throw new Error("Invalid response from assistant: " + jsonError);
      }

      const messages: Message[] = [];

      if (Array.isArray(traces)) {
        // Extract text messages from traces
        const textMessages = traces
          .filter((trace: any) => trace.type === "text" && trace.payload?.message)
          .map((trace: any) => trace.payload.message);

        const agentReply = textMessages.join("\n");

        if (agentReply.trim()) {
          messages.push({
            id: `ai_${Date.now()}`,
            type: "text",
            content: agentReply,
            sender: "ai",
            timestamp: new Date(),
          });
        }
      }

      // If there are no text messages, show a fallback with trace info for debugging
      if (messages.length === 0) {
        messages.push({
          id: `ai_${Date.now()}`,
          type: "text",
          content: "I didn't receive any message from the assistant. (Debug: traces=" + JSON.stringify(traces) + ")",
          sender: "ai",
          timestamp: new Date(),
        });
      }

      return { messages, conversationId: usedConversationId };
    } catch (err) {
      console.error("VF Service Error:", err);
      return {
        messages: [
          {
            id: `err_${Date.now()}`,
            type: "text",
            content: `I'm having trouble connecting to the assistant. Error details: ${err}`,
            sender: "ai",
            timestamp: new Date(),
          },
        ],
        conversationId: conversationId || `err_${Date.now()}`,
      };
    }
  }
}

export const voiceflowService = new VoiceflowService();
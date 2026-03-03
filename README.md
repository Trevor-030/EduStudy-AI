# EduStudy AI - Interactive Educational Platform

An AI-powered educational platform built with React, TypeScript, and Vite, featuring interactive lessons, quizzes, and real-time chat with AI assistants powered by Voiceflow.

## 🚀 Features

- **User Authentication**: Secure login/signup with Firebase Auth
- **Interactive Chat**: Real-time AI conversations powered by Voiceflow
- **Quiz System**: Dynamic quizzes with multiple choice questions
- **Interactive Dialogues**: Branching conversation experiences
- **Progress Tracking**: User progress storage and analytics
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom components
- **State Management**: Redux Toolkit
- **Backend Services**:
  - Firebase (Authentication & Firestore)
  - Voiceflow (AI Chat Assistant)
- **Build Tools**: Vite, ESLint, TypeScript

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- Voiceflow account with API access

## ⚙️ Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd edustudy-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env` and update the following variables:

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Voiceflow Configuration
   VITE_VOICEFLOW_API_KEY=VF.DM.your_api_key_here
   VITE_VOICEFLOW_VERSION_ID=production
   ```

### 🔑 Voiceflow Setup

1. **Get your API Key and Project ID**:
   - Go to Voiceflow Dashboard → Your Assistant → API/Integrations
   - Copy the API Key (starts with `VF.DM.`)
   - The Project ID is embedded in your API key: `VF.DM.{PROJECT_ID}.{SECRET}`

2. **Version ID**:
   - Use `"production"` for the live version of your assistant
   - Or specify a custom version ID if you have multiple versions

3. **Test your configuration**:
   ```bash
   curl -X POST \
     "https://general-runtime.voiceflow.com/state/YOUR_PROJECT_ID/user/test/interact" \
     -H "Authorization: VF.DM.YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"action": {"type": "text", "payload": "hello"}}'
   ```

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🔧 Troubleshooting

### Voiceflow 404 Error
- **Cause**: Incorrect Version ID
- **Solution**: Use the exact Version ID from Voiceflow API settings, not "production"

### Voiceflow 401 Error
- **Cause**: Invalid API Key
- **Solution**: Ensure API key starts with `VF.DM.` and is copied correctly

### Build Errors
- **Cause**: Missing environment variables or TypeScript errors
- **Solution**: Check `.env` file and run `npm run build` to see specific errors

### Chat Not Working
- **Cause**: Voiceflow service misconfiguration
- **Solution**: Verify API endpoint format and credentials

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChatWindow.tsx   # Main chat interface
│   ├── Sidebar.tsx      # Navigation and chat history
│   ├── LoginForm.tsx    # Authentication forms
│   └── ...
├── services/            # External API services
│   ├── voiceflowService.ts  # Voiceflow AI integration
│   ├── authService.ts       # Firebase auth
│   └── chatService.ts        # Chat persistence
├── store/               # Redux state management
├── types/               # TypeScript type definitions
├── pages/               # Route components
└── utils/               # Utility functions
```

## 🎯 Voiceflow Integration Details

The application integrates with Voiceflow's Dialog Manager Runtime API:

- **Endpoint**: `https://general-runtime.voiceflow.com/state/{projectId}/user/{userId}/interact`
- **Authentication**: API key in Authorization header
- **Request Format**: `{"action": {"type": "text", "payload": "message"}}`
- **Response**: Array of trace objects containing text/speak responses

### Required Environment Variables
- `VITE_VOICEFLOW_API_KEY`: Your Dialog Manager API key (VF.DM.xxxx)
- `VITE_VOICEFLOW_VERSION_ID`: Version to use ("production" recommended)

### Request Body Format
```json
{
  "request": {
    "type": "text",
    "payload": "your message here"
  }
}
```

### ✅ Client-Side Fixes Applied
- ✅ Correct request body format (`"request"` not `"action"`)
- ✅ Fresh session ID generation to prevent stale sessions
- ✅ Enhanced error logging with detailed API response information
- ✅ Proper user ID handling for multi-user scenarios
- ✅ TypeScript compilation without errors

### Debugging Tips
- Check browser console for detailed Voiceflow API logs
- Use fresh session IDs to avoid stale session errors
- Ensure your Voiceflow project is published and has a valid start block
- Test with Postman using the curl command above

### Troubleshooting 500 Internal Server Errors

A **500 Internal Server Error** from Voiceflow indicates a server-side issue with your Voiceflow project logic:

#### Most Common Causes:
1. **Code Block Issues**: JavaScript syntax errors, undefined variables, invalid returns
2. **API Block Failures**: Invalid URLs, wrong methods, or unexpected response formats
3. **Variable Problems**: Using undefined variables in blocks
4. **Corrupted Project Version**: Unstable publish or runtime issues

#### Step-by-Step Voiceflow Debugging:
1. **Open Test Mode**: Click "Test" in Voiceflow Creator to debug your flow
2. **Check Code Blocks**:
   - Look for JavaScript syntax errors
   - Ensure variables are defined before use
   - Verify return statements are correct
3. **Review API Blocks**:
   - Test endpoints in Postman first
   - Ensure correct headers and methods
   - Map response data properly
4. **Check Variables**:
   - Initialize variables at flow start
   - Use Set Blocks for defaults
5. **Re-publish Project**: Click "Publish" for fresh production build
6. **Check Integrations**: Verify external services have valid API keys

#### Code Block Best Practices:
```javascript
// ✅ Correct - Always return expected format
return "Hello, this works!";

// ✅ Correct - For variable updates
return { userName: "John", score: 100 };

// ❌ Wrong - Undefined variables
return variables.undefinedVar; // Crash!

// ❌ Wrong - Syntax errors
return "Missing quote; // Crash!
```

#### Common 500 Error Fixes:
| Issue | Symptom | Fix |
|-------|---------|-----|
| Code Block Syntax | Flow stops at code block | Check JS syntax, add console.log() |
| API Block Failure | External call fails | Test API separately, check response format |
| Missing Variables | `variables.myVar` undefined | Initialize with Set Block first |
| Complex Logic | Multiple blocks failing | Break into smaller sub-flows |

#### Quick Test:
```bash
# Test with curl
curl -X POST "https://general-runtime.voiceflow.com/state/YOUR_PROJECT_ID/user/test/interact" \
-H "Authorization: YOUR_API_KEY" \
-H "Content-Type: application/json" \
-d '{"request":{"type":"text","payload":"hello"}}'
```

If the curl command also returns 500, the issue is in your Voiceflow project configuration.

### ✅ Working Voiceflow Flow Example

Here's a **500-error-free Voiceflow flow** you can recreate to test your integration:

#### **Flow Structure:**
```
Start → Set Variables → Speak Greeting → Capture Input → Process Response → End
```

#### **Step-by-Step Setup:**

1. **Add Start Block** (Trigger):
   - Connect to your first Speak block

2. **Add Set Block** (Initialize Variables):
   ```
   Variables to set:
   - userName: "" (empty string)
   - conversationCount: 0 (number)
   - lastMessage: "" (empty string)
   ```

3. **Add Speak Block** (Greeting):
   ```
   Message: "Hello! I'm your AI assistant. How can I help you today?"
   ```

4. **Add Capture Block** (Wait for User Input):
   - Connect back to itself for continuous conversation
   - Set intent: "Default Fallback" (catches all input)

5. **Add Code Block** (Process Input - SAFE VERSION):
   ```javascript
   // Safe Code Block - No undefined variables, proper error handling
   try {
     const userInput = input; // 'input' is automatically available
     const currentCount = variables.conversationCount || 0;

     // Update conversation count
     variables.conversationCount = currentCount + 1;
     variables.lastMessage = userInput;

     // Always return a string for Speak blocks
     return `You said: "${userInput}". This is message #${currentCount + 1} in our conversation.`;

   } catch (error) {
     // Safe error handling - never crash
     console.error('Processing error:', error);
     return "I had trouble processing that. Can you try again?";
   }
   ```

6. **Add Speak Block** (Response):
   - Connect from Code Block
   - Set message to: `{code}` (uses Code Block output)

7. **Add Choice Block** (Continue Conversation):
   ```
   Question: "Would you like to continue?"
   Options:
   - "Yes" → Connect back to Capture block
   - "No" → Connect to End block
   ```

8. **Add End Block** (Conversation Complete):
   ```
   Message: "Thanks for chatting! Have a great day!"
   ```

#### **Why This Flow Avoids 500 Errors:**

- ✅ **No undefined variables** - All initialized in Set Block
- ✅ **Safe Code Block** - Try/catch prevents crashes
- ✅ **Proper returns** - Code Block always returns string
- ✅ **Simple logic** - No complex API calls or integrations
- ✅ **Error handling** - Graceful fallbacks for any issues

#### **Testing the Flow:**

1. **Publish** your project in Voiceflow Creator
2. **Test locally** with your React app
3. **Check browser console** for detailed logs
4. **Use curl** to verify API responses

This flow should work immediately and help you identify if the issue is with your Voiceflow project logic or the React integration.

### Supported Trace Types
- `text`: Direct text responses
- `speak`: Spoken/audio responses (treated as text)
- Additional trace types are parsed and handled appropriately

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.


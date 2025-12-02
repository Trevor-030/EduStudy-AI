# My App

A React-based chat application with Firebase authentication and OpenAI integration.

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Firebase account
- OpenAI API key

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in `.env`:

   ### Firebase Configuration
   - `VITE_FIREBASE_API_KEY`: Your Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
   - `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `VITE_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
   - `VITE_FIREBASE_APP_ID`: Your Firebase app ID

   ### OpenAI Configuration
   - `VITE_OPENAI_API_KEY`: Your OpenAI API key (optional, can be set via the app UI)

## Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)

2. Create a new project or select an existing one

3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google as a sign-in provider
   - Add your domain to authorized domains if deploying

4. Get your Firebase config:
   - Go to Project settings > General
   - Scroll down to "Your apps" section
   - If no app exists, click "Add app" and select Web
   - Copy the config values to your `.env` file

## Google Sign-In Configuration

1. In Firebase Console, go to Authentication > Sign-in method

2. Click on Google in the provider list

3. Toggle the Enable switch

4. Enter your project name and support email

5. Click Save

6. (Optional) If deploying to a custom domain:
   - Go to Authentication > Settings
   - Add your domain to "Authorized domains"

## Running Locally

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

Build the app for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard or using CLI:
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   # Repeat for other variables
   ```

### Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Drag and drop the `dist` folder to Netlify's deploy area, or connect your repository

3. Set environment variables in Netlify dashboard under Site settings > Environment variables

### Other Platforms

For other hosting platforms, ensure they support SPA routing and set the environment variables as required.

## Usage

1. Open the app in your browser
2. Sign in with Google
3. If not set via environment variable, enter your OpenAI API key in the app
4. Start chatting!

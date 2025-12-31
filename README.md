# Vocab App

A modern vocabulary learning application built with Next.js 14, TypeScript, and Firebase Firestore. Features spaced repetition learning, progress tracking, and a beautiful UI.

## 🚀 Features

- **Smart Learning**: Spaced repetition algorithm for optimal vocabulary retention
- **Dictionary Integration**: Automatic word definitions, examples, and pronunciations
- **Progress Tracking**: Visual heatmap showing your learning streak
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Real-time Sync**: Firebase Firestore for instant data synchronization

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Hosting**: Vercel
- **Icons**: Lucide React

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/vocab-app.git

# Navigate to project directory
cd vocab-app

# Install dependencies
npm install

# Create .env.local file with your Firebase credentials
# (See .env.example for required variables)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

## 🚀 Deployment

This app is optimized for deployment on Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/vocab-app)

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

# Dan Wu's AI-Powered Personal Website & Storefront

A modern, AI-powered personal website and storefront built with React Router, Convex, and advanced AI agents. This project serves as both a personal portfolio and an interactive AI assistant that can answer questions about Dan Wu's work, career journey, and ceramic art.

## 🚀 Features

### 🤖 AI-Powered Conversations
- **Intelligent AI Agent**: Powered by xAI's Grok-3 model, the AI agent can answer questions about Dan's software engineering expertise, ceramic art, and career transition story
- **RAG (Retrieval-Augmented Generation)**: Uses advanced RAG techniques to provide accurate, context-aware responses based on Dan's CV and career story
- **Real-time Streaming**: Messages stream in real-time for a smooth conversational experience
- **Thread Management**: Organize conversations into persistent threads with search functionality

### 🔐 Authentication & User Management
- **WorkOS Integration**: Seamless authentication with WorkOS AuthKit
- **Anonymous Users**: Support for anonymous conversations with persistent thread storage
- **User Profiles**: Authenticated users get personalized experiences with profile management

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first design that works beautifully on all devices
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Shadcn/ui Components**: Built with high-quality, accessible UI components
- **Smooth Animations**: Powered by Framer Motion for delightful interactions

### 🛠 Developer Experience
- **Type Safety**: Full TypeScript support across frontend and backend
- **Real-time Updates**: Convex provides real-time data synchronization
- **Form Handling**: TanStack Form with Zod validation
- **Code Quality**: Biome for formatting and linting, Oxlint for additional checks

## 🏗 Tech Stack

### Frontend
- **[React Router v7](https://reactrouter.com/)** - Modern React framework with file-based routing
- **[React 18](https://react.dev/)** - Latest React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[TanStack Query](https://tanstack.com/query)** - Powerful data fetching and caching
- **[TanStack Form](https://tanstack.com/form)** - Type-safe form handling
- **[Lucide React](https://lucide.dev/)** - Beautiful SVG icons
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations

### Backend
- **[Convex](https://convex.dev/)** - Real-time backend-as-a-service
- **[Convex Agent](https://github.com/get-convex/agent)** - AI agent framework
- **[Convex RAG](https://github.com/get-convex/rag)** - Retrieval-augmented generation
- **[xAI Grok-3](https://x.ai/)** - Advanced language model
- **[WorkOS](https://workos.com/)** - Authentication and user management

### Development Tools
- **[Vite](https://vitejs.dev/)** - Fast build tool
- **[Biome](https://biomejs.dev/)** - Fast formatter and linter
- **[Oxlint](https://oxc.rs/)** - High-performance linter
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

## 🎯 Project Purpose

This project serves multiple purposes:

1. **Personal Portfolio**: Showcase Dan Wu's work as a software engineer and ceramic artist
2. **AI Assistant**: Provide an interactive way for visitors to learn about Dan's expertise and experience
3. **Career Story**: Share Dan's inspiring journey from ceramics to software engineering
4. **Technical Demonstration**: Showcase modern web development practices and AI integration

## 🚀 Getting Started

### Prerequisites
- Node.js 22.0.0 or higher
- pnpm (recommended) or npm
- Convex account
- WorkOS account (for authentication)
- xAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/danwu/ai-storefront.git
   cd ai-storefront
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Convex
   CONVEX_DEPLOYMENT=your-convex-deployment
   
   # WorkOS
   WORKOS_API_KEY=your-workos-api-key
   WORKOS_CLIENT_ID=your-workos-client-id
   WORKOS_REDIRECT_URI=http://localhost:5173/callback
   
   # xAI
   XAI_API_KEY=your-xai-api-key
   ```

4. **Set up Convex**
   ```bash
   npx convex dev
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
ai-storefront/
├── app/                          # React Router application
│   ├── components/              # Reusable UI components
│   │   ├── auth/               # Authentication components
│   │   └── ui/                 # Shadcn/ui components
│   ├── routes/                 # File-based routing
│   │   ├── _shell/            # Shell layout with sidebar
│   │   └── _shell.chat.$threadId/ # Chat thread pages
│   ├── lib/                    # Utility functions and hooks
│   └── hooks/                  # Custom React hooks
├── convex/                      # Convex backend
│   ├── agents/                 # AI agents (store, summary)
│   ├── ai/                     # AI-related functions
│   ├── helpers/                # Helper functions
│   ├── schema/                 # Database schemas
│   └── users/                  # User management
└── public/                     # Static assets
```

## 🤖 AI Agent Features

### Store Agent
The main AI agent that represents Dan Wu and can:
- Answer questions about software engineering expertise
- Discuss ceramic art and creative work
- Share career transition stories
- Provide technical insights and advice
- Search through Dan's CV and experience

### Summary Agent
Automatically generates concise titles for conversation threads (15 words or less).

### RAG Integration
- **CV Embeddings**: Searchable database of Dan's professional experience
- **Career Story Embeddings**: Detailed narrative of Dan's transition from ceramics to tech
- **Contextual Responses**: AI responses are grounded in real information about Dan

## 🎨 UI Components

Built with Shadcn/ui components including:
- **Sidebar Navigation**: Collapsible sidebar with thread management
- **Chat Interface**: Real-time messaging with streaming responses
- **Form Controls**: Type-safe forms with validation
- **Theme Toggle**: Dark/light mode switching
- **Responsive Design**: Mobile-first approach

## 🔧 Development Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm convex:dev       # Start Convex development

# Building
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run linting
pnpm format           # Format code
pnpm typecheck        # Type checking

# Deployment
pnpm convex:deploy    # Deploy to Convex
```

## 🚀 Deployment

### Convex Deployment
```bash
pnpm convex:deploy
```

### Frontend Deployment
The app can be deployed to any platform that supports Node.js:
- Vercel
- Netlify
- Railway
- Render

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



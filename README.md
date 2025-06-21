# Snappin UI

Modern React frontend for Snappin - AI-powered face recognition photo gallery.

## 🚀 Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   └── features/       # Feature-specific components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Static assets
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   ```

3. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Check TypeScript types

## 🎨 Design System

### Colors

- **Primary**: Blue color palette for main actions
- **Secondary**: Gray color palette for text and subtle elements

### Components

- All components follow Tailwind CSS utility classes
- Consistent spacing and typography
- Accessibility features included
- Responsive design by default

## 📋 Development Guidelines

- Use TypeScript for all components
- Follow the cursor rules in `.cursorrules`
- Use Tailwind classes instead of custom CSS
- Implement accessibility features
- Use descriptive naming with `handle` prefix for event functions
- Use `const` declarations instead of `function`
- Implement early returns for better readability

## 🔗 API Integration

The frontend communicates with the Snappin backend API running on `http://localhost:5001`. API proxy is configured in Vite for seamless development.

## 🚦 Deployment

```bash
# Build for production
npm run build

# The `dist` folder contains the production build
```

## 📝 License

MIT License

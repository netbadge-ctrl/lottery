# AI彩票识别工具 (AI Lottery Recognition Tool)

## Overview
This is a React + TypeScript + Vite application that uses AI to recognize Chinese lottery tickets (双色球 and 超级大乐透). The app analyzes uploaded lottery ticket images using Zhipu AI's GLM-4V-Plus model to identify lottery type, issue number, and ticket numbers, then checks for winning combinations.

## Project Architecture
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (via CDN)
- **AI Service**: Zhipu AI GLM-4V-Plus for image recognition
- **Build System**: Vite with custom configuration for Replit environment

## Configuration
- **Development Server**: Configured to run on 0.0.0.0:5000 for Replit environment
- **Deployment**: Autoscale deployment with build/preview commands
- **Environment Variables**: 
  - `VITE_ZHIPU_API_KEY`: Required for AI image recognition (fallback key provided)
  - `GEMINI_API_KEY`: Alternative API configuration

## Recent Changes (2025-09-22)
- Fixed TypeScript configuration and installed missing React types
- Configured Vite to work properly in Replit environment:
  - Removed Node.js-specific imports (path, __dirname)
  - Set server to bind to 0.0.0.0:5000
  - Configured HMR for port 5000
- Set up Frontend Server workflow
- Configured autoscale deployment with proper build and preview commands

## Project Structure
```
├── components/          # React components
│   ├── icons/          # Icon components
│   ├── Header.tsx
│   ├── ImageUploader.tsx
│   ├── ResultDisplay.tsx
│   └── Spinner.tsx
├── services/           # API and business logic services
│   ├── aiService.ts    # Main AI image recognition service
│   ├── lotteryService.ts # Lottery number checking logic
│   └── ...
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
├── index.html         # HTML template with Tailwind CDN
├── vite.config.ts     # Vite configuration
└── types.ts           # TypeScript type definitions
```

## Development
- **Start**: `npm run dev` (configured as workflow)
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Features
- AI-powered lottery ticket image recognition
- Support for 双色球 (Double Color Ball) and 超级大乐透 (Super Lotto)
- Automatic winning number checking
- Manual correction interface for lottery results
- Data management for lottery history
- Responsive design for mobile and desktop

## User Preferences
- **Communication Language**: Chinese (中文)

## Status
✅ Successfully imported and configured for Replit environment
✅ Frontend server running on port 5000
✅ Build process working correctly
✅ Deployment configuration complete
# GestiFiltres - Frontend

This is the frontend application for GestiFiltres, a filter management system for heavy machinery.

## Quick Start

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env file with your actual Supabase credentials
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `GEMINI_API_KEY`: Google Gemini AI API key (optional, for AI features)

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Project Structure

```
frontend/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── ...             # Feature-specific components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── index.html          # HTML template
├── index.tsx           # Application entry point
├── App.tsx             # Main App component
└── vite.config.ts      # Vite configuration
```

## Key Features

- **Machine Management**: Track and manage heavy machinery
- **Filter Management**: Inventory and assign filters to machines
- **Maintenance Scheduling**: Preventive maintenance tracking
- **Dashboard & Analytics**: Visual insights and reporting
- **Theme Customization**: Multiple themes and custom color options
- **AI Assistant**: Smart recommendations and analysis
- **QR Code Support**: Quick machine identification

## Technologies Used

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Supabase for backend services
- Google Gemini AI for intelligent features

## Notes

- The application uses import maps for dependencies in development
- Tailwind CSS is loaded via CDN in the HTML template
- The project supports both light and dark themes
- Hot reload is enabled for development
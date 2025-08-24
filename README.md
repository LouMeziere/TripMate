# TripMate 🧳

A full-stack React application for AI-powered trip planning with three core features: Dashboard, Trip Creation, and Chat Interface.

## 🎯 Project Overview

TripMate transforms trip planning by combining the power of AI with an intuitive user interface. The application features:

- **Dashboard**: View and manage current and past trips
- **Create Trip**: Form-based trip creation with AI-powered itinerary generation
- **Chat Interface**: Natural language trip planning assistant

### Technology Stack

- **Frontend**: React 18 with TypeScript, Tailwind CSS, React Router
- **Backend**: Express.js API server with RESTful endpoints
- **AI Integration**: Google Gemini AI for trip generation
- **External APIs**: Foursquare Places API for location data
- **Development**: Concurrent frontend/backend development with hot reloading

## 🚀 Quick Start

### Prerequisites (What you need installed)

- **Node.js** (v16 or higher) - JavaScript runtime for running the server
- **npm** - Package manager (comes with Node.js)
- **Git** - Version control system
- **A code editor** - VS Code is recommended

### Installation & Setup

1. **Clone the repository (download the code)**
   ```bash
   git clone https://github.com/LouMeziere/TripMate.git
   cd TripMate
   ```

2. **Install dependencies (download required packages)**
   ```bash
   # Install backend dependencies (Express server)
   npm install
   
   # Install frontend dependencies (React app)
   cd frontend
   npm install
   cd ..
   ```

3. **Start the development environment (run both servers)**
   ```bash
   # From the root directory - starts both backend and frontend
   npm run dev
   ```

   This will start:
   - **Backend API Server**: `http://localhost:3001` (handles data and AI)
   - **Frontend React App**: `http://localhost:3000` (what users see)

4. **Open your browser**
   - Navigate to `http://localhost:3000` to see the application
   - The React app will automatically send API requests to the Express server

## 📁 Project Structure (How the code is organized)

```
TripMate/
├── frontend/               # React frontend application (what users see)
│   ├── src/
│   │   ├── components/     # React components (Dashboard, CreateTrip, Chat)
│   │   ├── services/       # API service layer (talks to backend)
│   │   └── App.tsx         # Main app component with routing
│   ├── public/             # Static assets (images, favicon, etc.)
│   └── package.json        # Frontend dependencies and scripts
├── server/                 # Express.js backend (handles data and logic)
│   ├── routes/             # API route handlers
│   │   ├── trips.js        # Trip CRUD operations (Create, Read, Update, Delete)
│   │   ├── generate.js     # AI trip generation
│   │   └── chat.js         # Chat interface
│   ├── utils/              # Utility functions
│   ├── app.js              # Express app configuration
│   └── server.js           # Server entry point (starts the server)
├── integrations/           # External API integrations
│   ├── foursquareAPI.js    # Places API integration
│   └── geminiAPI.js        # AI integration
├── docs/                   # Project documentation
└── package.json            # Root dependencies and scripts (main project file)
```

## 🔍 How It All Works

### The Big Picture
1. **Frontend (React)**: The website users interact with - buttons, forms, pages
2. **Backend (Express)**: The server that handles requests, talks to AI, manages data
3. **APIs**: External services for places data (Foursquare) and AI (Google Gemini)

### When you visit the app:
1. React app loads in your browser (`http://localhost:3000`)
2. When you click something, React sends a request to Express (`http://localhost:3001`)
3. Express processes the request (maybe talks to AI or gets place data)
4. Express sends data back to React
5. React updates what you see on screen

## 🧪 Testing the Application

### 1. Frontend Testing (React Website)

Visit `http://localhost:3000` and test:

- **Navigation**: Click between Dashboard, Create Trip, and Chat tabs
- **Routing**: Visit URLs directly in your browser:
  - `/` - Dashboard (Coming Soon)
  - `/create-trip` - Trip Creation Form (Coming Soon)
  - `/chat` - Chat Interface (Coming Soon)

### 2. Backend API Testing (Server Endpoints)

Test the backend endpoints directly using curl commands in your terminal:

**Health Check**
```bash
curl http://localhost:3001/api/health
# Expected: {"status":"Server is running!"}
```

**Get All Trips**
```bash
curl http://localhost:3001/api/trips
# Returns: Array of 3 dummy trips (Paris, Tokyo, London)
```

**Create New Trip**
```bash
curl -X POST http://localhost:3001/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekend in Rome",
    "destination": "Rome, Italy",
    "startDate": "2025-09-15",
    "endDate": "2025-09-17",
    "travelers": 2,
    "budget": "medium"
  }'
```

**Generate Trip (with dummy data)**
```bash
curl -X POST http://localhost:3001/api/generate-trip \
  -H "Content-Type: application/json" \
  -d '{
    "userInput": "I want a 3-day trip to Rome focusing on food and history"
  }'
# Note: Returns dummy Rome itinerary after 2-second delay
```

**Chat with AI Assistant**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me plan a trip to Tokyo",
    "tripId": "trip-1"
  }'
```

## 🛠️ Available Scripts

### Essential Commands
```bash
npm run dev              # Start both backend and frontend servers (recommended for development)
npm run dev:server       # Start only the Express backend server (port 3001)
npm run dev:frontend     # Start only the React frontend app (port 3000)
npm run build:frontend   # Build the React app for production
npm run start:server     # Start only the backend server (production mode)
```

### Frontend Directory (`/frontend`)
```bash
npm start            # Start React development server (same as npm run dev:frontend from root)
npm run build        # Build React app for production deployment
```

### Most Common Commands:
- `npm run dev` - Start everything for development
- `npm install` - Fix dependency issues
- `npm run build:frontend` - Prepare for deployment

## 🐛 Troubleshooting (When things go wrong)

### Common Issues & Solutions

**"Port 3000 (or 3001) is already in use":**
- Another app is using that port
- Solution: Close other development servers or the app will ask to use a different port
- You can say "yes" to use the suggested alternative port

**"Module not found" or "Cannot find package" errors:**
```bash
# Try reinstalling dependencies
npm install                    # For backend
cd frontend && npm install     # For frontend
```

**"npm: command not found":**
- Node.js and npm aren't installed properly
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal after installation

**Frontend shows "Loading..." forever:**
- Check if the backend server is running (should show messages in terminal)
- Make sure both servers started successfully with `npm run dev`
- Check browser console (F12) for error messages

**API calls fail with "Network Error":**
- Ensure both frontend (3000) and backend (3001) are running
- Check browser Developer Tools → Network tab for failed requests
- Verify the proxy setting in `frontend/package.json`

**Git issues:**
- Make sure you're in the right directory: `/TripMate`
- Check git status: `git status`
- If confused about git, focus on the code first!

## 🔮 Current Features

### Backend (Express Server)
- RESTful API endpoints for trips (GET, POST, PUT, DELETE)
- Dummy data responses for UI development
- Chat interface with contextual responses
- Trip generation endpoint (returns sample Rome itinerary)
- CORS and error handling middleware

### Frontend (React App)
- TypeScript configuration
- React Router for navigation
- Tailwind CSS styling
- API service layer with axios
- Component structure for three main screens

### Development Environment
- Concurrent frontend/backend development
- Hot reloading for both frontend and backend
- Proxy configuration for API calls
- ESLint and TypeScript configuration

## 🎓 Development Notes

### Key Concepts:
1. **Frontend vs Backend**: Frontend = what users see, Backend = data and logic
2. **API Endpoints**: URLs that the frontend calls to get/send data
3. **Components**: Reusable pieces of UI (like LEGO blocks for web pages)
4. **State Management**: How React keeps track of changing data
5. **Hot Reloading**: Code changes automatically appear in browser (no manual refresh!)

### Development Workflow:
1. Make changes to React components in `/frontend/src/`
2. Browser automatically updates to show changes
3. Make changes to API routes in `/server/routes/`
4. Server automatically restarts with new changes
5. Test everything works together

## 🚀 Future Enhancements

- Real AI integration (currently using dummy data)
- User authentication and profiles
- Trip sharing and collaboration
- Map integration with itinerary visualization
- Mobile app (React Native)
- Offline functionality
- Photo uploads and trip memories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Open an issue on GitHub with detailed error information

---

**Happy Trip Planning!** ✈️🗺️
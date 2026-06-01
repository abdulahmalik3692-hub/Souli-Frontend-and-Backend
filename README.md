Souli — Frontend & Backend
Souli is a full-stack AI-powered application built with React + Vite on the frontend and Python (Flask/FastAPI) on the backend. It leverages the Groq API for high-performance LLM inference, delivering a seamless conversational AI experience.

Table of Contents
•Overview
•Architecture
•Project Structure
•Frontend
–Tech Stack
–How It Runs
–Key Methodologies
–Development Workflow
•Backend
–Tech Stack
–How It Runs
–Key Methodologies
–API Design
•Environment Configuration
•Getting Started
–Prerequisites
–Installation
–Running Locally
•Deployment
•Contributing
•License

Overview
Souli is designed as a modern, scalable full-stack application that bridges a responsive React frontend with a Python-powered backend. The architecture follows a clean separation of concerns, with the frontend handling UI/UX and state management while the backend manages business logic, AI model orchestration via Groq, and data processing.
Key Features
•AI-Powered Conversations — Integrates Groq’s ultra-fast LLM inference API
•Modern React UI — Built with Vite for lightning-fast development and production builds
•RESTful API — Clean, predictable API endpoints for frontend-backend communication
•Environment-Driven Configuration — Secure secret management via .env files
•Scalable Structure — Monorepo layout supporting independent frontend/backend development

Architecture
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React + Vite Frontend                   │   │
│  │  • Component-based UI (JSX)                         │   │
│  │  • React Hooks for state & side effects             │   │
│  │  • Fetch/Axios for API calls                        │   │
│  │  • Vite HMR for rapid development                   │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │ HTTP Requests (JSON)              │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Python Backend Server                     │   │
│  │  • Flask / FastAPI framework                        │   │
│  │  • Groq API integration for LLM inference           │   │
│  │  • Request validation & error handling              │   │
│  │  • CORS-enabled for frontend communication          │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              External Services                        │   │
│  │  • Groq API (LLM inference)                         │   │
│  │  • Environment variables for secrets                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
Communication Flow
User Input → React Component → State Update → API Call (POST /api/chat)
                                                          │
                                                          ▼
User ← Rendered Response ← React State ← JSON Response ← Backend
                                                          │
                                                          ▼
                                                    Groq API (LLM)

Project Structure
Souli-Frontend-and-Backend/
├── 📁 frontend/                    # React + Vite Application
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable UI components
│   │   ├── 📁 pages/               # Route-level page components
│   │   ├── 📁 hooks/               # Custom React hooks
│   │   ├── 📁 services/            # API service functions
│   │   ├── 📁 context/             # React Context providers
│   │   ├── 📁 assets/              # Static assets (images, fonts)
│   │   ├── App.jsx                 # Root component & routing
│   │   ├── main.jsx                # Entry point (ReactDOM.render)
│   │   └── index.css               # Global styles
│   ├── 📁 public/                  # Public static files
│   ├── index.html                  # HTML template
│   ├── vite.config.js              # Vite configuration
│   ├── package.json                # Frontend dependencies
│   └── .eslintrc.cjs               # ESLint configuration
│
├── 📁 backend/                     # Python API Server
│   ├── 📁 app/
│   │   ├── 📁 routes/              # API route definitions
│   │   ├── 📁 services/            # Business logic & Groq integration
│   │   ├── 📁 models/              # Data models & schemas
│   │   ├── 📁 utils/               # Utility functions
│   │   └── __init__.py             # App factory
│   ├── 📁 tests/                   # Unit & integration tests
│   ├── app.py                      # Application entry point
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Environment variables (NOT in Git)
│
├── .gitignore                      # Git ignore rules
└── README.md                       # This file

Frontend
Frontend Tech Stack
Technology	Purpose	Version
React	UI library for building component-based interfaces	^18.x
Vite	Next-generation frontend build tool (replaces CRA)	^5.x
JavaScript (ES6+)	Primary language with modern syntax	ES2022
CSS3	Styling with modern features (Flexbox, Grid)	—
ESLint	Static code analysis for code quality	^8.x
Why Vite over Create React App?
•Instant Server Start — Dev server starts in milliseconds (native ESM)
•Lightning-Fast HMR — Hot Module Replacement via native browser modules
•Optimized Builds — Uses Rollup for highly optimized production bundles
•Out-of-the-box Support — JSX, TypeScript, CSS imports work immediately
How the Frontend Runs
Development Mode
cd frontend
npm install        # Install dependencies
npm run dev        # Start Vite dev server (default: http://localhost:5173)
What happens when you run npm run dev:
1.Vite starts an ESM-based dev server on localhost:5173
2.On-demand compilation — Files are compiled only when the browser requests them
3.HMR (Hot Module Replacement) — Changes to React components update in the browser instantly without losing state
4.Source maps are generated for easy debugging
5.Proxy configuration (if set in vite.config.js) forwards /api requests to the backend server
Production Build
npm run build      # Creates optimized `dist/` folder
Build process:
1.Vite uses Rollup to bundle all JS/CSS into optimized chunks
2.Tree-shaking removes unused code
3.Code splitting creates separate chunks for routes (lazy loading)
4.Minification via Terser reduces file sizes
5.Asset hashing enables long-term browser caching
6.Output is a static dist/ folder ready for deployment (Vercel, Netlify, Nginx, etc.)
Frontend Methodologies
1. Component-Based Architecture
The UI is broken into reusable, self-contained components:
// Example: ChatMessage component
const ChatMessage = ({ role, content, timestamp }) => (
  <div className={`message ${role}`}>
    <p>{content}</p>
    <span>{timestamp}</span>
  </div>
);
Principles: - Single Responsibility — Each component does one thing well - Props Down, Events Up — Data flows down via props; actions flow up via callbacks - Composition over Inheritance — Components are composed together rather than extended
2. React Hooks for State Management
// useState for local component state
const [messages, setMessages] = useState([]);

// useEffect for side effects (API calls, subscriptions)
useEffect(() => {
  fetchChatHistory();
}, []);

// Custom hooks for reusable logic
const useChat = () => { ... };
3. Declarative UI with JSX
The UI is described declaratively — you define what the UI should look like for a given state, and React handles the DOM updates:
// Declarative: "Show loading spinner if loading, else show messages"
{isLoading ? <Spinner /> : <MessageList messages={messages} />}
4. Client-Side Routing (if applicable)
If using React Router:
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/chat" element={<ChatPage />} />
</Routes>
5. API Integration Pattern
// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const sendMessage = async (message) => {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return response.json();
};
Frontend Development Workflow
1. Edit component file (e.g., src/components/Chat.jsx)
         │
         ▼
2. Vite detects change via file watcher
         │
         ▼
3. HMR updates only the changed module in the browser
         │
         ▼
4. Browser state preserved; UI updates instantly
         │
         ▼
5. Developer sees changes immediately without refresh

Backend
Backend Tech Stack
Technology	Purpose	Version
Python	Primary backend language	3.10+
Flask / FastAPI	Web framework for API endpoints	Latest
Groq SDK	Integration with Groq’s LLM inference API	Latest
python-dotenv	Environment variable management	Latest
Flask-CORS	Cross-Origin Resource Sharing support	Latest
How the Backend Runs
Development Mode
cd backend
python -m venv venv              # Create virtual environment
source venv/bin/activate         # Activate (macOS/Linux)
# OR: venv\Scripts\activate    # Activate (Windows)

pip install -r requirements.txt  # Install dependencies
python app.py                    # Start the server (default: http://localhost:5000)
What happens when you run python app.py:
1.Environment variables are loaded from .env via python-dotenv
2.Flask/FastAPI app initializes with CORS enabled for frontend communication
3.Routes are registered — API endpoints become available
4.Server starts (Flask dev server or Uvicorn for FastAPI)
5.Groq client initializes with the API key from environment variables
Production Mode
# For Flask
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# For FastAPI
pip install uvicorn
uvicorn app:app --host 0.0.0.0 --port 5000 --workers 4
Backend Methodologies
1. RESTful API Design
Endpoints follow REST conventions:
POST   /api/chat          → Send a message, get AI response
GET    /api/health        → Health check
GET    /api/history       → Retrieve chat history
Principles: - Stateless — Each request contains all information needed; no server-side session - Resource-based URLs — Nouns, not verbs (/api/chat, not /api/sendMessage) - JSON as the standard format — Consistent request/response bodies
2. Service Layer Pattern
Business logic is separated from route handlers:
# services/groq_service.py
from groq import Groq
import os

class GroqService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def generate_response(self, message, model="llama3-8b-8192"):
        completion = self.client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": message}]
        )
        return completion.choices[0].message.content

# routes/chat.py
from services.groq_service import GroqService

groq_service = GroqService()

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    response = groq_service.generate_response(data['message'])
    return jsonify({"response": response})
3. Environment-Based Configuration
Sensitive data (API keys, database URLs) is never hardcoded:
# .env (NOT committed to Git)
GROQ_API_KEY=your_groq_api_key_here
FLASK_ENV=development
FLASK_PORT=5000
CORS_ORIGIN=http://localhost:5173
# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    DEBUG = os.getenv("FLASK_ENV") == "development"
    CORS_ORIGINS = [os.getenv("CORS_ORIGIN", "http://localhost:5173")]
4. Error Handling & Validation
@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400

        response = groq_service.generate_response(data['message'])
        return jsonify({"response": response})

    except Exception as e:
        app.logger.error(f"Chat error: {str(e)}")
        return jsonify({"error": "Failed to generate response"}), 500
5. CORS Configuration
The backend explicitly allows the frontend origin:
from flask_cors import CORS

CORS(app, origins=["http://localhost:5173", "https://yourdomain.com"])
API Design
Chat Endpoint
Request:
POST /api/chat
Content-Type: application/json

{
  "message": "Explain quantum computing in simple terms",
  "model": "llama3-8b-8192"  // optional
}
Response:
{
  "response": "Quantum computing is a type of computing that uses...",
  "model": "llama3-8b-8192",
  "tokens_used": 150,
  "timestamp": "2024-01-15T10:30:00Z"
}

Environment Configuration
Required Environment Variables
Variable	Description	Example
GROQ_API_KEY	Your Groq API key	gsk_xxxxxxxxxxxxxxxx
FLASK_ENV	Environment mode	development / production
FLASK_PORT	Backend server port	5000
CORS_ORIGIN	Frontend URL for CORS	http://localhost:5173
.env File Setup
Create a .env file in the backend/ directory:
# backend/.env
GROQ_API_KEY=your_actual_groq_api_key_here
FLASK_ENV=development
FLASK_PORT=5000
CORS_ORIGIN=http://localhost:5173
⚠️ Never commit .env files to Git! The .gitignore should include:
# .gitignore
.env
*.env
__pycache__/
node_modules/
dist/

Getting Started
Prerequisites
•Node.js 18+ (for frontend)
•Python 3.10+ (for backend)
•npm or yarn (comes with Node.js)
•Git
•A Groq API key (Get one here)
Installation
# 1. Clone the repository
git clone https://github.com/abdulahmalik3692-hub/Souli-Frontend-and-Backend.git
cd Souli-Frontend-and-Backend

# 2. Setup Frontend
cd frontend
npm install
cd ..

# 3. Setup Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 4. Configure Environment
cp .env.example .env      # Edit .env with your actual Groq API key
Running Locally
Terminal 1 — Backend:
cd backend
source venv/bin/activate
python app.py
# Server running on http://localhost:5000
Terminal 2 — Frontend:
cd frontend
npm run dev
# Dev server running on http://localhost:5173
Open your browser and navigate to http://localhost:5173 to use the application.

Deployment
Frontend Deployment (Vercel / Netlify)
1.Build the production bundle:
 cd frontend
npm run build
2.Deploy the dist/ folder to Vercel, Netlify, or any static hosting service
3.Set environment variable: VITE_API_URL=https://your-backend-url.com
Backend Deployment (Render / Railway / Heroku)
1.Push code to GitHub
2.Connect your repository to Render/Railway/Heroku
3.Add environment variables in the platform dashboard
4.Set start command: gunicorn app:app (Flask) or uvicorn app:app (FastAPI)

Contributing
1.Fork the repository
2.Create a feature branch: git checkout -b feature/your-feature
3.Commit your changes: git commit -m "Add your feature"
4.Push to the branch: git push origin feature/your-feature
5.Open a Pull Request

License
This project is licensed under the MIT License.

Acknowledgments
•Groq — For providing ultra-fast LLM inference
•React Team — For the powerful UI library
•Vite — For revolutionizing frontend tooling
•Flask/FastAPI Community — For excellent Python web frameworks

Built with ❤️ by Abdulah Malik
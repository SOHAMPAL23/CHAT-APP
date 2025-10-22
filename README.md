# 💬 Real-Time Chat Application

A modern, feature-rich real-time chat application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring instant messaging, password reset functionality, message reactions, and beautiful animations.

![Chat App Banner](https://img.shields.io/badge/MERN-Stack-green) ![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-blue) ![Nodemailer](https://img.shields.io/badge/Nodemailer-Email-red) ![License](https://img.shields.io/badge/license-MIT-orange)

## ✨ Features

### 🔐 Authentication & Security
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Password Hashing** - bcrypt encryption for passwords
- ✅ **Forgot Password** - Email-based password reset flow
- ✅ **Email Verification** - Nodemailer integration with Gmail
- ✅ **Secure Reset Tokens** - 15-minute expiration with crypto hashing
- ✅ **Welcome Emails** - Beautiful HTML emails for new users

### 💬 Messaging Features
- ✅ **Real-time Messaging** - Instant message delivery using Socket.io
- ✅ **Message Reactions** - Add emoji reactions (❤️😂👍😮😢🎉)
- ✅ **Typing Indicators** - See when users are typing
- ✅ **Message Read Receipts** - Track message delivery status
- ✅ **Online/Offline Status** - Real-time user presence indicators
- ✅ **Message Deletion** - Delete your own messages
- ✅ **Message Timestamps** - Track when messages were sent

### 🎨 UI/UX Features
- ✅ **Beautiful Animations** - Smooth entrance and transition effects
- ✅ **Gradient Backgrounds** - Animated color-shifting gradients
- ✅ **Glassmorphism** - Modern frosted glass effects
- ✅ **Pure CSS** - No CSS frameworks, fully custom design
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Custom Scrollbars** - Styled scrollbars throughout
- ✅ **Toast Notifications** - User-friendly feedback messages
- ✅ **Loading States** - Spinners and skeleton screens

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library (v19.x)
- **Pure CSS** - Custom styling with animations
- **Socket.io Client** - Real-time communication
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **date-fns** - Date formatting
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time engine
- **JWT** - Authentication (jsonwebtoken)
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **crypto** - Secure token generation

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1️⃣ Clone the Repository
```bash
git clone <your-repo-url>
cd Chat-App
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGODB_URI=mongodb://localhost:27017/chat-app
# - PORT=5000
# - JWT_SECRET=your_secret_key
# - CLIENT_URL=http://localhost:5173
# - EMAIL_USER=your-email@gmail.com
# - EMAIL_PASSWORD=your-gmail-app-password

# Start the backend server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory (open new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your configuration
# Required variables:
# - VITE_API_URL=http://localhost:5000
# - VITE_SOCKET_URL=http://localhost:5000

# Start the frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4️⃣ MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB on your system
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
Chat-App/
├── backend/
│   ├── config/
│   │   ├── db.js              # Database connection
│   │   ├── socket.js          # Socket.io configuration
│   │   └── email.js           # Nodemailer email service
│   ├── controllers/
│   │   ├── authController.js  # Auth + password reset
│   │   ├── userController.js  # User management
│   │   └── messageController.js # Messages + reactions
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── User.js            # User schema + reset tokens
│   │   └── Message.js         # Message schema + reactions
│   ├── routes/
│   │   ├── authRoutes.js      # Auth + password reset routes
│   │   ├── userRoutes.js      # User endpoints
│   │   └── messageRoutes.js   # Messages + reactions routes
│   ├── .env.example           # Environment variables template
│   ├── server.js              # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Main chat dashboard
│   │   │   ├── HomePage.css          # Chat styles
│   │   │   ├── LoginPage.jsx         # Animated login
│   │   │   ├── LoginPage.css         # Login animations
│   │   │   ├── SignupPage.jsx        # Registration
│   │   │   ├── ForgotPasswordPage.jsx  # Request reset
│   │   │   ├── ResetPasswordPage.jsx   # Reset password
│   │   │   └── ProfilePage.jsx       # User profile
│   │   ├── store/
│   │   │   ├── authStore.js          # Auth state
│   │   │   ├── chatStore.js          # Chat state
│   │   │   └── socketStore.js        # Socket.io state
│   │   ├── utils/
│   │   │   └── api.js                # Axios config
│   │   ├── App.jsx                   # Main app + routes
│   │   ├── App.css                   # Global design system
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Base styles
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── ENHANCED_FEATURES.md    # Detailed features docs
│   ├── QUICK_START.md          # Setup & troubleshooting
│   ├── FEATURE_UPDATE.md       # Feature summary
│   ├── IMPLEMENTATION_SUMMARY.md  # Technical summary
│   └── ARCHITECTURE.md         # System diagrams
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user + send welcome email
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password/:resetToken` - Reset password with token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/profile` - Update profile

### Messages
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages/:userId` - Send message to user
- `GET /api/messages/conversations` - Get all conversations
- `DELETE /api/messages/:messageId` - Delete message
- `POST /api/messages/:messageId/react` - Add emoji reaction
- `DELETE /api/messages/:messageId/react` - Remove reaction

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/chat-app
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

**📧 Gmail Setup for Password Reset:**
1. Go to [Google Account](https://myaccount.google.com/)
2. Navigate to Security → 2-Step Verification (enable it)
3. Go to App Passwords
4. Select "Mail" and "Other (Custom name)"
5. Generate password (16 characters)
6. Copy and paste in `EMAIL_PASSWORD` (remove spaces)

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🎯 Usage Guide

### 1. Register an Account
- Navigate to signup page
- Enter username, email, and password
- Click "Create account"
- Check email for welcome message

### 2. Login
- Enter your email and password
- Click "Sign in"

### 3. Forgot Password?
- Click "Forgot password?" on login page
- Enter your email address
- Check inbox for reset link
- Click link and set new password
- Auto-login after successful reset

### 4. Start Chatting
- Select a user from the sidebar
- Type your message in the input field
- Press Enter or click send button
- See online/offline status
- Watch typing indicators

### 5. Message Reactions (Coming Soon to UI)
- Hover over a message
- Click reaction button
- Select emoji
- See real-time updates

### 6. View Profile
- Click profile icon in sidebar
- View your account information

## 🚀 Deployment

### Backend (Render)
1. Create account on [Render](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set environment variables
5. Deploy

### Frontend (Vercel)
1. Create account on [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set environment variables
4. Deploy

## 🐛 Troubleshooting

### Common Issues

**Issue: Cannot connect to MongoDB**
- Check if MongoDB is running
- Verify connection string in `.env`
- Check network access settings (if using Atlas)

**Issue: Socket.io not connecting**
- Verify `VITE_SOCKET_URL` matches backend URL
- Check CORS settings in backend
- Ensure both servers are running

**Issue: JWT errors**
- Verify `JWT_SECRET` is set in backend `.env`
- Clear browser cookies and localStorage
- Try logging in again

## 📝 Future Enhancements

- [ ] Group chat functionality
- [ ] Image/file sharing
- [ ] Voice messages
- [ ] Video calling
- [ ] Message reactions
- [ ] Dark mode toggle
- [ ] Message search
- [ ] User blocking
- [ ] Push notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ using the MERN stack

## 🙏 Acknowledgments

- Socket.io for real-time functionality
- Tailwind CSS for beautiful styling
- MongoDB for flexible data storage
- The MERN stack community

---

⭐ If you like this project, please give it a star on GitHub!

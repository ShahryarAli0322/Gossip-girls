# 💋 Gossip Girl

> Anonymous gossip platform for campus communities - Share secrets, post anonymously, and connect with your community in real-time.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-5.2-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-orange)

## ✨ Features

- **Anonymous Posting** - Share gossip without revealing your identity
- **Real-time Updates** - Live updates using Socket.IO
- **Image Uploads** - Share images with your posts
- **Reactions** - React with ❤️, 🔥, and 😂
- **Campus Filtering** - Filter posts by campus (BMI, LGS, ROOTS)
- **Admin Panel** - Full admin dashboard for moderation
- **Push Notifications** - Get notified of new blasts even when offline
- **Trending Posts** - See what's hot in your community
- **Report System** - Report inappropriate content
- **Verified Badges** - Official admin blasts with verified badges

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Socket.IO** - Real-time communication
- **Multer** - File upload handling
- **JWT** - Authentication
- **Web Push** - Push notifications

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **HTML5/CSS3** - Modern responsive design
- **Socket.IO Client** - Real-time updates
- **Service Worker** - Offline support & push notifications

## 📁 Project Structure

```
gossip-girl/
│
├── client/                 # Frontend files
│   ├── index.html         # Main application
│   ├── admin.html         # Admin panel
│   ├── app.js             # Main frontend logic
│   ├── admin.js           # Admin panel logic
│   ├── service-worker.js   # PWA service worker
│   └── verified-badge.png  # Verified badge icon
│
├── server/                 # Backend files
│   ├── server.js          # Main server file
│   ├── models/            # MongoDB models
│   │   ├── Post.js
│   │   ├── Admin.js
│   │   ├── Comment.js
│   │   └── Report.js
│   ├── routes/             # API routes
│   │   ├── posts.js
│   │   ├── admin.js
│   │   ├── reports.js
│   │   └── push.js
│   ├── controllers/        # Route controllers
│   │   ├── postController.js
│   │   ├── adminController.js
│   │   ├── commentController.js
│   │   └── reportController.js
│   └── middleware/         # Custom middleware
│       ├── verifyAdminToken.js
│       └── spamFilter.js
│
├── uploads/               # User uploaded images (gitignored)
├── package.json           # Dependencies
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gossip-girl.git
   cd gossip-girl
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=your-secret-key
   EMAIL_PASS=your-gmail-app-password
   VAPID_PUBLIC_KEY=your-vapid-public-key
   VAPID_PRIVATE_KEY=your-vapid-private-key
   VAPID_EMAIL=mailto:your-email@example.com
   ```

4. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Frontend: `http://localhost:5000`
   - API: `http://localhost:5000/api/posts`

## 🌐 Deployment

### Backend (Render/Railway)

1. Push your code to GitHub
2. Connect your repository to Render/Railway
3. Set environment variables in the dashboard
4. Deploy!

**Environment Variables:**
- `PORT` - Server port (usually auto-assigned)
- `MONGO_URI` - MongoDB Atlas connection string
- `CLIENT_URL` - Your frontend URL (Vercel domain)
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_PASS` - Gmail app password
- `VAPID_PUBLIC_KEY` - Web push public key
- `VAPID_PRIVATE_KEY` - Web push private key
- `VAPID_EMAIL` - Contact email for push notifications

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory to `client`
3. Add environment variables:
   - `API_BASE_URL` - Your backend URL
   - `SOCKET_URL` - Your backend URL (for Socket.IO)
4. Deploy!

📖 **Detailed deployment guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔧 Configuration

### MongoDB Atlas Setup

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP addresses (use `0.0.0.0/0` for Render)
4. Get connection string and add to `.env`

### Push Notifications Setup

Generate VAPID keys:
```bash
npm install web-push
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('Public:', keys.publicKey); console.log('Private:', keys.privateKey);"
```

### Email Setup (Admin Verification)

1. Enable 2-factor authentication on Gmail
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Add to `.env` as `EMAIL_PASS`

## 📝 API Endpoints

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/hot` - Get trending posts
- `GET /api/posts/campus/:campus` - Get posts by campus
- `POST /api/posts` - Create new post
- `DELETE /api/posts/:id` - Delete post

### Reactions
- `POST /api/react/:id` - Add reaction to post

### Comments
- `POST /api/comment/:id` - Add comment to post

### Reports
- `POST /api/report/:id` - Report a post

### Admin
- `POST /api/admin/signup` - Admin signup
- `POST /api/admin/login` - Admin login
- `POST /api/admin/blast` - Send official blast
- `GET /api/admin/activity` - Get analytics

### Push Notifications
- `GET /api/push/vapid-key` - Get VAPID public key
- `POST /api/push/subscribe` - Subscribe to push notifications

## 🎯 Features in Detail

### Anonymous Posting
Users can post anonymously by entering a name (stored locally). No account required!

### Real-time Updates
Using Socket.IO, new posts, reactions, and comments appear instantly for all users.

### Admin Panel
Full-featured admin dashboard with:
- Post moderation
- Report management
- Analytics dashboard
- Official blast sending
- User management

### Push Notifications
Users can subscribe to receive push notifications for admin blasts, even when offline.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## ⚠️ Disclaimer

This project is for educational purposes. Use responsibly and ensure compliance with your institution's policies and local laws regarding anonymous posting platforms.

## 🙏 Acknowledgments

- Built with ❤️ for campus communities
- Inspired by anonymous social platforms
- Uses modern web technologies for real-time communication

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Made with 💋 by the Gossip Girl team**

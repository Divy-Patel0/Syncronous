# Syncronous - Real-Time Web Chat Application

**Syncronous** is a real-time web chat application built using the **MERN** stack (MongoDB, Express, React, Node.js) and **Socket.IO** for instant messaging. It includes user authentication, one-on-one and group chats, typing indicators, and file/image sharing via **Cloudinary**.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Real-Time:** Socket.IO
- **Authentication:** JWT, bcrypt
- **File/Image Storage:** Cloudinary
- **Deployment:** Vercel (frontend), Render/Heroku (backend), MongoDB Atlas

---

## 🚀 Features

- 🔐 User registration & login with JWT
- 💬 Real-time one-on-one & group chats
- ✍️ Typing indicators
- 🟢 Online/offline user presence
- 📎 File and image sharing (Cloudinary integration)
- 📜 Chat history saved in MongoDB
- 📱 Fully responsive UI

---

## 📁 Project Structure

```
/client            --> React frontend
/server            --> Express backend
  ├── /controllers
  ├── /models
  ├── /routes
  ├── /middleware
  ├── /config         --> Cloudinary setup here
  ├── /socket
```

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/syncronous.git
cd syncronous
```

### 2. Backend Setup
```bash
cd server
npm install
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
npm start
```

---

## 🌐 Environment Variables

Create a `.env` file in the `/server` folder and populate it like so:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🖼️ File & Image Sharing

- Users can upload files and images in chat.
- Files are stored securely using **Cloudinary**.
- Metadata and file links are saved in MongoDB and rendered in chat messages.

---

## ✅ To Do / Future Improvements

- 🔔 Push notifications (e.g., with OneSignal or FCM)
- 📬 Read receipts
- 📂 Drag & drop file uploads
- ⚙️ Admin controls in group chats
- 🌙 Dark mode toggle

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a new feature branch
3. Commit your changes
4. Open a pull request

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

## 🔗 Contact

- GitHub: [yourusername](https://github.com/yourusername)
- Email: your.email@example.com

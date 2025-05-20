# Collaborative To-Do Board 📋✨

A Trello-inspired collaborative Kanban board application built with a **React** frontend and a **Node.js/Express** backend 🚀. This app lets users manage tasks, create boards, and collaborate in real-time using Socket.IO for seamless updates. Features include user authentication, task prioritization, drag-and-drop functionality, and board sharing capabilities 🌟.

🔗 **Live Demo**: (Add your deployed app link here, e.g., https://collaborative-todo-board.herokuapp.com)  
🔗 **Repository**: [https://github.com/PujaRR/collaborative-todo-board](https://github.com/PujaRR/collaborative-todo-board) 🐙

---

## Table of Contents 📑

- [Features](#features) 🌈
- [Technologies Used](#technologies-used) 🛠️
- [Installation](#installation) 🔧
- [Usage](#usage) 🚀
- [Folder Structure](#folder-structure) 📂
- [API Endpoints](#api-endpoints) 🌐
- [Contributing](#contributing) 🤝
- [License](#license) 📜

---

## Features 🌈

- **User Authentication** 🔒: Register and log in securely with JWT-based authentication and password hashing using bcrypt.
- **Board Management** 📋: Create, delete, and share boards with other users.
- **Task Management** ✅: Add, edit, delete, and move tasks across lists with drag-and-drop functionality using `react-beautiful-dnd`.
- **Real-Time Collaboration** ⚡: Real-time updates for board and task changes via Socket.IO.
- **Task Details** 📝: Assign tasks to users, set due dates, priorities (Low, Medium, High), and descriptions.
- **Responsive Design** 📱: Mobile-friendly interface with Tailwind CSS and custom styles.
- **Theme Switching** 🌙: Toggle between light and dark modes.
- **Notifications** 🔔: Toast notifications for user actions using `react-toastify`.
- **State Management** 🧠: Managed with Redux Toolkit for efficient state handling.
- **Protected Routes** 🛡️: Secure access to boards with authentication checks.

---

## Technologies Used 🛠️

### Backend
- **Node.js** 🟢: JavaScript runtime for server-side logic.
- **Express.js** 🚂: Web framework for building RESTful APIs.
- **MongoDB** 🍃: NoSQL database for storing boards, lists, tasks, and user data.
- **Mongoose** 🦦: ODM for MongoDB to manage schemas and queries.
- **Socket.IO** ⚡: Enables real-time bidirectional communication.
- **JWT (jsonwebtoken)** 🔑: For secure user authentication.
- **bcryptjs** 🔒: For password hashing.
- **cors** 🌍: For handling cross-origin requests.
- **dotenv** ⚙️: For environment variable management.
- **sanitize-html** 🧼: For sanitizing user input.

### Frontend
- **React** ⚛️: JavaScript library for building the user interface.
- **Redux Toolkit** 📚: For state management.
- **react-beautiful-dnd** 🤹: For drag-and-drop functionality.
- **Socket.IO Client** ⚡: For real-time updates.
- **Axios** 📡: For making HTTP requests to the backend.
- **React Router** 🛤️: For client-side routing.
- **Tailwind CSS** 🎨: For styling and responsive design.
- **react-toastify** 🔔: For displaying notifications.
- **jwt-decode** 🔍: For decoding JWT tokens.

### Development Tools
- **react-app-rewired** & **customize-cra** 🛠️: For customizing Create React App configuration.
- **Jest** & **React Testing Library** 🧪: For unit testing.
- **ESLint** ✅: For code linting.
- **Web Vitals** 📊: For performance monitoring.

---

## Installation 🔧

### Prerequisites
- **Node.js** (v16 or higher) 🟢
- **MongoDB** (local or cloud instance like MongoDB Atlas) 🍃
- **Git** 🐙

### Steps

1. **Clone the Repository** 🐾
   ```bash
   git clone https://github.com/PujaRR/collaborative-todo-board.git
   cd collaborative-todo-board
   ```

2. **Backend Setup** ⚙️
   - Navigate to the backend directory (if separated, or root if combined).
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the root directory and add the following:
     ```env
     MONGODB_URI=mongodb://localhost:27017/trello_clone
     CORS_ORIGIN=http://localhost:3000
     JWT_SECRET=your_secure_jwt_secret_1234567890
     ```
     Replace `JWT_SECRET` with a secure key 🔑.
   - Start the backend server:
     ```bash
     npm start
     ```
     The server will run on `http://localhost:5000` 🌐.

3. **Frontend Setup** 🎨
   - Navigate to the frontend directory (if separated, or root if combined).
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm start
     ```
     The frontend will run on `http://localhost:3000` 🚀.

4. **MongoDB Setup** 🍃
   - Ensure MongoDB is running locally or update the `MONGODB_URI` in the `.env` file to point to your MongoDB instance (e.g., MongoDB Atlas).

5. **Access the Application** 🌟
   - Open `http://localhost:3000` in your browser 🖥️.
   - Register a new account or log in to start using the Kanban board 📋.

---

## Usage 🚀

1. **Register/Login** 🔐: Create an account at `/register` or log in at `/login`.
2. **Create a Board** 📋: Use the "Create New Board" form to add a board.
3. **Manage Lists and Tasks** ✅:
   - Add lists to a board with titles and statuses (To Do, In Progress, Done) 📝.
   - Add tasks to lists with titles, descriptions, due dates, priorities, and assignees 🗂️.
   - Drag and drop tasks within or between lists to update their status 🤹.
4. **Share Boards** 🤝: Share boards with other users by entering their email addresses.
5. **Real-Time Updates** ⚡: Collaborators see changes instantly via Socket.IO.
6. **Theme Toggle** 🌙: Switch between light and dark modes using the theme toggle button.
7. **Delete Boards/Tasks** 🗑️: Delete boards or tasks with confirmation prompts.

---

## Folder Structure 📂

```
collaborative-todo-board/
├── backend/
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware 🔒
│   ├── models/
│   │   ├── Board.js            # Mongoose schema for boards 📋
│   │   └── User.js             # Mongoose schema for users 👤
│   ├── routes/
│   │   ├── auth.js             # Authentication routes 🔐
│   │   └── boards.js           # Board and task management routes 📋
│   ├── socket.js               # Socket.IO configuration ⚡
│   ├── server.js               # Express server setup 🚂
│   ├── .env                    # Environment variables ⚙️
│   └── package.json            # Backend dependencies 📦
├── frontend/
│   ├── public/
│   │   ├── index.html          # HTML entry point 🌐
│   │   ├── favicon.ico         # Favicon 🖼️
│   │   ├── logo192.png         # Logo for PWA 🖼️
│   │   ├── logo512.png         # Logo for PWA 🖼️
│   │   └── manifest.json       # PWA manifest 📄
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateBoard.jsx  # Component to create boards 📋
│   │   │   ├── CreateList.jsx   # Component to create lists 📋
│   │   │   ├── CreateTask.jsx   # Component to create tasks ✅
│   │   │   ├── DeleteList.jsx   # Component to delete lists 🗑️
│   │   │   ├── Home.jsx         # Home page component 🏠
│   │   │   ├── List.jsx         # List component with drag-and-drop 🤹
│   │   │   ├── Login.jsx        # Login page component 🔐
│   │   │   ├── ProtectedRoute.jsx # Route protection component 🛡️
│   │   │   ├── Register.jsx     # Register page component 📝
│   │   │   ├── ShareBoard.jsx   # Component to share boards 🤝
│   │   │   └── TaskCard.jsx     # Task card component 🗂️
│   │   ├── store/
│   │   │   ├── authSlice.js     # Redux slice for authentication 🔒
│   │   │   ├── boardSlice.js    # Redux slice for board management 📋
│   │   │   └── store.js         # Redux store configuration 🧠
│   │   ├── api.js               # Axios configuration for API calls 📡
│   │   ├── App.jsx              # Main app component 🌟
│   │   ├── App.css              # Main app styles 🎨
│   │   ├── App.test.js          # Unit tests for App component 🧪
│   │   ├── index.js             # React app entry point ⚛️
│   │   ├── index.css            # Global CSS with Tailwind and custom styles 🎨
│   │   ├── reportWebVitals.js   # Performance monitoring 📊
│   │   └── setupTests.js        # Jest testing setup 🧪
│   ├── config-overrides.js      # Custom Create React App configuration ⚙️
│   └── package.json             # Frontend dependencies 📦
└── README.md                    # Project documentation 📜
```

---

## API Endpoints 🌐

### Authentication 🔐
- **POST /api/auth/register** 📝: Register a new user.
  - Body: `{ username, email, password }`
- **POST /api/auth/login** 🔑: Log in a user and return a JWT token.
  - Body: `{ email, password }`

### Boards 📋
- **GET /api/boards** 📚: Fetch all boards for the authenticated user (owned or shared).
- **GET /api/boards/:boardId** 🔍: Fetch a specific board by ID.
- **POST /api/boards** ➕: Create a new board.
  - Body: `{ title }`
- **DELETE /api/boards/:boardId** 🗑️: Delete a board (owner only).
- **POST /api/boards/:boardId/share** 🤝: Share a board with another user.
  - Body: `{ email }`
- **POST /api/boards/:boardId/lists** 📋: Create a new list in a board.
  - Body: `{ title, status }`
- **DELETE /api/boards/:boardId/lists/:listIndex** 🗑️: Delete a list from a board.
- **POST /api/boards/:boardId/lists/:listIndex/tasks** ✅: Add a task to a list.
  - Body: `{ title, description, dueDate, priority, assignee }`
- **PATCH /api/boards/:boardId/lists/:listIndex/tasks/:taskId** ✏️: Edit a task.
  - Body: `{ title, description, dueDate, priority, assignee }`
- **DELETE /api/boards/:boardId/lists/:listIndex/tasks/:taskId** 🗑️: Delete a task.
- **PATCH /api/boards/:boardId/move-task** 🚚: Move a task within or between lists.
  - Body: `{ taskId, sourceListIndex, destinationListIndex, sourceIndex, destinationIndex }`

---

## Contributing 🤝

Contributions are welcome! 🎉 Please follow these steps:

1. **Fork the Repository** 🍴: Click the "Fork" button on GitHub.
2. **Clone Your Fork** 🐙:
   ```bash
   git clone https://github.com/your-username/collaborative-todo-board.git
   ```
3. **Create a Branch** 🌿:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make Changes** ✏️: Implement your feature or bug fix.
5. **Test** 🧪: Run tests with `npm test` in the frontend directory.
6. **Commit Changes** ✅:
   ```bash
   git commit -m "Add your feature description"
   ```
7. **Push to Your Fork** 🚀:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request** 📬: Submit a PR to the `main` branch of the original repository.

Please ensure your code follows the project's coding style and includes tests where applicable.

---

**Developed by [PujaRR](https://github.com/PujaRR)** 🧑‍💻  
For any questions or issues, please open an issue on the [GitHub repository](https://github.com/PujaRR/collaborative-todo-board) 🐙.
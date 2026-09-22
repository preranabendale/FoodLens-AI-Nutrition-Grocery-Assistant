# FoodLens – AI Nutrition & Grocery Assistant

> Snap. Analyze. Eat Better. 🥗

FoodLens is an AI-powered nutrition and grocery assistant that helps users analyze food images, understand estimated nutritional values, manage fridge inventory, get recipe suggestions, and maintain a grocery list.

## 🚀 Features

- 📸 AI-powered food image analysis
- 🤖 Google Gemini AI integration
- 🥗 Estimated calories, protein, carbohydrates and fat
- 💚 AI-generated food health score
- 🧾 Ingredient identification
- 📊 Nutrition dashboard
- 🥕 Fridge inventory management
- 🍳 AI recipe suggestions based on available ingredients
- 🛒 Grocery list management
- 🔐 JWT authentication
- 🔒 Password hashing with bcrypt
- 📱 Responsive user interface
- ✨ Smooth animations with Framer Motion

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express.js
- REST APIs
- JWT
- bcrypt
- Multer

### Database
- MongoDB
- Mongoose

### AI
- Google Gemini API

## 🏗️ Project Architecture

```text
FoodLens
│
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── analyze/
│   │   ├── fridge/
│   │   └── grocery/
│   ├── components/
│   └── ...
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── .gitignore
└── README.md

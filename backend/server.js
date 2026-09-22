const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// IMPORTANT:
// dotenv.config() routes/config import karne se pehle hona chahiye.
dotenv.config();

// Database
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyzeRoutes = require("./routes/analyzeRoutes");
const fridgeRoutes = require("./routes/fridgeRoutes");
const groceryRoutes = require("./routes/groceryRoutes");

const app = express();

const PORT = process.env.PORT || 5000;



connectDB();



app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


app.use(
  express.json({
    limit: "10mb",
  })
);


app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);



app.use("/api/auth", authRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/analyze", analyzeRoutes);

app.use("/api/fridge", fridgeRoutes);

app.use("/api/grocery", groceryRoutes);



app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "FoodLens Backend API is running ",
  });
});



app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});



app.use((error, req, res, next) => {
  console.error("");
  console.error("======================================");
  console.error("BACKEND ERROR");
  console.error("======================================");
  console.error("Message:", error.message);
  console.error("Name:", error.name);
  console.error("======================================");
  console.error("");

  // JSON body parsing error
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  // Multer error
  if (error.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});



app.listen(PORT, () => {
  console.log("");
  console.log("======================================");
  console.log(" FOODLENS BACKEND");
  console.log("======================================");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(` Grocery API: http://localhost:${PORT}/api/grocery`);
  console.log(`Fridge API: http://localhost:${PORT}/api/fridge`);
  console.log(`Analyze API: http://localhost:${PORT}/api/analyze`);
  console.log("======================================");
  console.log("");
});
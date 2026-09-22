const express = require("express");
const FoodAnalysis = require("../models/FoodAnalysis");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET dashboard data
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.userId;

    const analyses = await FoodAnalysis.find({
      userId,
    }).sort({ createdAt: -1 });

    const totalAnalyses = analyses.length;

    const totalCalories = analyses.reduce(
      (total, item) => total + item.calories,
      0
    );

    const totalProtein = analyses.reduce(
      (total, item) => total + item.protein,
      0
    );

    const totalCarbs = analyses.reduce(
      (total, item) => total + item.carbs,
      0
    );

    const totalFat = analyses.reduce(
      (total, item) => total + item.fat,
      0
    );

    res.status(200).json({
      success: true,

      stats: {
        totalAnalyses,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      },

      recentAnalyses: analyses.slice(0, 5),
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
});

module.exports = router;
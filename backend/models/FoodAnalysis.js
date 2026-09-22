const mongoose = require("mongoose");

const foodAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    foodName: {
      type: String,
      required: true,
      trim: true,
    },

    calories: {
      type: Number,
      default: 0,
    },

    protein: {
      type: Number,
      default: 0,
    },

    carbs: {
      type: Number,
      default: 0,
    },

    fat: {
      type: Number,
      default: 0,
    },

    healthScore: {
      type: Number,
      default: 0,
    },

    ingredients: {
      type: [String],
      default: [],
    },

    analysis: {
      type: String,
      default: "",
    },

    
    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "FoodAnalysis",
  foodAnalysisSchema
);
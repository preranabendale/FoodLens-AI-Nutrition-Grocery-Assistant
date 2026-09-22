const mongoose = require("mongoose");

const groceryItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    unit: {
      type: String,
      default: "item",
      trim: true,
    },

    category: {
      type: String,
      default: "Other",
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    purchased: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "GroceryItem",
  groceryItemSchema
);
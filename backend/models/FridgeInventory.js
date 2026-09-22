const mongoose = require("mongoose");

const fridgeInventorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    imageName: {
      type: String,
      default: "",
    },

    ingredients: {
      type: [String],
      default: [],
    },

    aiSummary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "FridgeInventory",
  fridgeInventorySchema
);
const express = require("express");
const multer = require("multer");

const protect = require("../middleware/authMiddleware");
const GroceryItem = require("../models/GroceryItem");

const router = express.Router();

/* =========================================================
   MULTER
========================================================= */

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 2 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(
        new Error("Only image files are allowed")
      );
    }

    cb(null, true);
  },
});

/* =========================================================
   GET GROCERY ITEMS
========================================================= */

router.get("/", protect, async (req, res) => {
  try {
    const items = await GroceryItem.find({
      userId: req.user.userId,
    }).sort({
      purchased: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error(
      "Get grocery items error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch grocery items",
    });
  }
});

/* =========================================================
   UPLOAD IMAGE
   Image is stored as Base64 in MongoDB
========================================================= */

router.post(
  "/upload-image",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      }

      console.log("");
      console.log(
        "======================================"
      );
      console.log(
        "📸 IMAGE UPLOAD"
      );
      console.log(
        "======================================"
      );

      console.log(
        "File:",
        req.file.originalname
      );

      console.log(
        "Type:",
        req.file.mimetype
      );

      console.log(
        "Size:",
        `${(
          req.file.size / 1024
        ).toFixed(2)} KB`
      );

      /* -----------------------------------------
         Convert image to Base64
      ----------------------------------------- */

      const imageUrl =
        `data:${req.file.mimetype};base64,` +
        req.file.buffer.toString(
          "base64"
        );

      console.log(
        "Image converted to Base64 ✅"
      );

      return res.status(200).json({
        success: true,

        message:
          "Image processed successfully",

        imageUrl,
      });
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Image upload failed",
      });
    }
  }
);

/* =========================================================
   ADD GROCERY ITEM
========================================================= */

router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      quantity,
      unit,
      category,
      imageUrl,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Grocery item name is required",
      });
    }

    const item =
      await GroceryItem.create({
        userId: req.user.userId,

        name: name.trim(),

        quantity:
          Number(quantity) > 0
            ? Number(quantity)
            : 1,

        unit:
          unit?.trim() ||
          "item",

        category:
          category?.trim() ||
          "Other",

        imageUrl:
          imageUrl?.trim() ||
          "",

        purchased: false,
      });

    return res.status(201).json({
      success: true,

      message:
        "Grocery item added successfully",

      item,
    });
  } catch (error) {
    console.error(
      "Add grocery item error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to add grocery item",
    });
  }
});

/* =========================================================
   UPDATE GROCERY ITEM
========================================================= */

router.put(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const {
        name,
        quantity,
        unit,
        category,
        imageUrl,
        purchased,
      } = req.body;

      const item =
        await GroceryItem.findOne({
          _id: req.params.id,
          userId: req.user.userId,
        });

      if (!item) {
        return res.status(404).json({
          success: false,
          message:
            "Grocery item not found",
        });
      }

      if (name !== undefined) {
        item.name = name.trim();
      }

      if (quantity !== undefined) {
        item.quantity =
          Number(quantity) > 0
            ? Number(quantity)
            : 1;
      }

      if (unit !== undefined) {
        item.unit = unit.trim();
      }

      if (category !== undefined) {
        item.category =
          category.trim();
      }

      if (imageUrl !== undefined) {
        item.imageUrl =
          imageUrl.trim();
      }

      if (purchased !== undefined) {
        item.purchased =
          Boolean(purchased);
      }

      await item.save();

      return res.status(200).json({
        success: true,

        message:
          "Grocery item updated successfully",

        item,
      });
    } catch (error) {
      console.error(
        "Update grocery item error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update grocery item",
      });
    }
  }
);

/* =========================================================
   DELETE GROCERY ITEM
========================================================= */

router.delete(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const item =
        await GroceryItem.findOneAndDelete({
          _id: req.params.id,
          userId: req.user.userId,
        });

      if (!item) {
        return res.status(404).json({
          success: false,
          message:
            "Grocery item not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Grocery item deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete grocery item error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete grocery item",
      });
    }
  }
);

module.exports = router;
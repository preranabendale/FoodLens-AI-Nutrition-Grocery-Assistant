const express = require("express");
const multer = require("multer");

const protect = require("../middleware/authMiddleware");
const FridgeInventory = require("../models/FridgeInventory");
const GroceryItem = require("../models/GroceryItem");

const router = express.Router();

/* =========================================================
   MULTER
========================================================= */

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
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
   INGREDIENT NAME NORMALIZER
========================================================= */

const normalizeIngredientName = (ingredient) => {
  let name = String(ingredient || "")
    .toLowerCase()
    .trim();

  const aliases = {
    "olive oil": "olive_oil",
    "extra virgin olive oil": "olive_oil",
    "extra-virgin olive oil": "olive_oil",

    "cooking oil": "oil",
    "vegetable oil": "oil",
    "sunflower oil": "oil",
    "refined oil": "oil",

    tomato: "tomato",
    tomatoes: "tomato",

    onion: "onion",
    onions: "onion",

    potato: "potato",
    potatoes: "potato",

    carrot: "carrot",
    carrots: "carrot",

    cucumber: "cucumber",
    cucumbers: "cucumber",

    garlic: "garlic",
    ginger: "ginger",

    "green chili": "green_chilli",
    "green chilli": "green_chilli",

    "red chili": "red_chili",
    "red chilli": "red_chili",

    capsicum: "bell_pepper",
    "bell pepper": "bell_pepper",

    egg: "egg",
    eggs: "egg",

    milk: "milk",

    butter: "butter",

    cheese: "cheese",

    rice: "rice",

    flour: "flour",

    "wheat flour": "flour",

    "all purpose flour": "flour",

    "bread": "bread",

    chicken: "chicken",
    beef: "beef",
    pork: "pork",

    salt: "salt",

    sugar: "sugar",

    "black pepper": "black_pepper",
    pepper: "pepper",

    lemon: "lemon",
    lemons: "lemon",

    lime: "lime",

    apple: "apple",
    apples: "apple",

    banana: "banana",
    bananas: "banana",

    mango: "mango",
    mangoes: "mango",

    spinach: "spinach",

    cabbage: "cabbage",

    peas: "peas",

    corn: "corn",

    yogurt: "yogurt",
    yoghurt: "yogurt",

    cream: "cream",

    "coconut milk": "coconut_milk",

    "coconut oil": "coconut_oil",

    "soy sauce": "soy_sauce",

    "tomato paste": "tomato_paste",

    "tomato puree": "tomato_puree",
  };

  if (aliases[name]) {
    return aliases[name];
  }

  return name
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_");
};

/* =========================================================
   INGREDIENT IMAGE
========================================================= */

const getIngredientImage = (ingredient) => {
  const normalized =
    normalizeIngredientName(
      ingredient
    );

  if (!normalized) {
    return "";
  }

  return `https://www.themealdb.com/images/ingredients/${normalized}.png`;
};

/* =========================================================
   GEMINI HELPER
========================================================= */

const callGemini = async ({
  prompt,
  imageData = null,
  mimeType = null,
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is missing"
    );
  }

  const model = "gemini-3.6-flash";

  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log("");
      console.log(
        "======================================"
      );
      console.log("🤖 GEMINI REQUEST");
      console.log(
        "======================================"
      );
      console.log("Model:", model);
      console.log("Attempt:", attempt);

      const parts = [
        {
          text: prompt,
        },
      ];

      if (imageData && mimeType) {
        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: imageData,
          },
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            contents: [
              {
                parts,
              },
            ],

            generationConfig: {
              responseMimeType:
                "application/json",

              temperature: 0.4,
            },
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          "Gemini status:",
          response.status
        );

        console.error(
          "Gemini message:",
          data?.error?.message
        );

        lastError = new Error(
          data?.error?.message ||
            "Gemini request failed"
        );

        if (
          response.status === 503 ||
          response.status === 429 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 504
        ) {
          const delay =
            1500 *
            Math.pow(2, attempt - 1);

          console.log(
            `⏳ Retrying after ${delay}ms...`
          );

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                delay
              )
          );

          continue;
        }

        throw lastError;
      }

      const aiText =
        data?.candidates?.[0]
          ?.content?.parts?.[0]?.text;

      if (!aiText) {
        throw new Error(
          "Gemini returned empty response"
        );
      }

      console.log(
        "Gemini response received ✅"
      );

      try {
        return JSON.parse(aiText);
      } catch (jsonError) {
        const cleanedText =
          aiText
            .replace(
              /^```json\s*/i,
              ""
            )
            .replace(
              /^```\s*/i,
              ""
            )
            .replace(
              /\s*```$/i,
              ""
            )
            .trim();

        try {
          return JSON.parse(
            cleanedText
          );
        } catch (secondError) {
          console.error(
            "Raw Gemini response:",
            aiText
          );

          throw new Error(
            "Gemini returned invalid JSON"
          );
        }
      }
    } catch (error) {
      console.error(
        `Gemini attempt ${attempt} failed:`,
        error.message
      );

      lastError = error;

      if (attempt < 3) {
        const delay =
          1500 *
          Math.pow(2, attempt - 1);

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              delay
            )
        );
      }
    }
  }

  throw (
    lastError ||
    new Error(
      "Gemini request failed"
    )
  );
};

/* =========================================================
   ANALYZE FRIDGE
========================================================= */

router.post(
  "/analyze",
  protect,
  upload.single("image"),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Fridge image is required",
        });
      }

      const base64Image =
        req.file.buffer.toString(
          "base64"
        );

      const mimeType =
        req.file.mimetype;

      const prompt = `
You are a fridge ingredient recognition assistant.

Analyze the provided fridge image.

Identify only food ingredients that are clearly visible.

Return ONLY valid JSON.

Use exactly this structure:

{
  "ingredients": [],
  "summary": "short summary of the visible ingredients"
}

Rules:

- ingredients must be an array of strings
- use simple ingredient names
- do not invent ingredients
- do not include non-food objects
- remove duplicates
- keep summary short
`;

      const result =
        await callGemini({
          prompt,
          imageData: base64Image,
          mimeType,
        });

      const ingredients =
        Array.isArray(
          result.ingredients
        )
          ? [
              ...new Set(
                result.ingredients
                  .map((item) =>
                    String(item)
                      .trim()
                  )
                  .filter(Boolean)
              ),
            ]
          : [];

      if (ingredients.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "No food ingredients could be identified",
        });
      }

      const inventory =
        await FridgeInventory.create({
          userId:
            req.user.userId,

          imageName:
            req.file.originalname,

          ingredients,

          aiSummary:
            result.summary ||
            "Ingredients identified successfully.",
        });

      return res.status(201).json({
        success: true,

        message:
          "Fridge ingredients identified successfully",

        inventory,
      });
    } catch (error) {
      console.error(
        "Fridge analysis error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Fridge analysis failed",
      });
    }
  }
);

/* =========================================================
   GET LATEST FRIDGE
========================================================= */

router.get(
  "/",
  protect,

  async (req, res) => {
    try {
      const inventory =
        await FridgeInventory.findOne({
          userId:
            req.user.userId,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        inventory,
      });
    } catch (error) {
      console.error(
        "Get fridge inventory error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch fridge inventory",
      });
    }
  }
);

/* =========================================================
   GENERATE RECIPES
========================================================= */

router.post(
  "/recipes",
  protect,

  async (req, res) => {
    try {
      const ingredients =
        Array.isArray(
          req.body.ingredients
        )
          ? [
              ...new Set(
                req.body.ingredients
                  .map((item) =>
                    String(item)
                      .trim()
                  )
                  .filter(Boolean)
              ),
            ]
          : [];

      console.log("");
      console.log(
        "======================================"
      );
      console.log(
        "🍳 RECIPE GENERATION"
      );
      console.log(
        "======================================"
      );

      console.log(
        "Ingredients:",
        ingredients
      );

      if (ingredients.length === 0) {
        return res.status(400).json({
          success: false,

          message:
            "At least one ingredient is required",
        });
      }

      const prompt = `
You are an AI cooking assistant.

The user has these ingredients:

${ingredients.join(", ")}

Create exactly 4 practical recipes.

Return ONLY valid JSON.

Use exactly this structure:

{
  "recipes": [
    {
      "name": "Recipe name",
      "description": "Short description",
      "time": "20 min",
      "difficulty": "Easy",
      "availableIngredients": [],
      "missingIngredients": [],
      "steps": []
    }
  ]
}

Rules:

1. Return exactly 4 recipes.

2. Every recipe must use at least
   one available ingredient.

3. availableIngredients must contain
   only ingredients from:

${ingredients.join(", ")}

4. missingIngredients must contain
   only ingredients that are not available.

5. Keep missing ingredients minimal.

6. steps must contain 3 to 5 steps.

7. difficulty must be:
   Easy, Medium, or Hard.

8. time should be like:
   15 min, 20 min, 30 min.

9. Recipes must be different.

10. Prefer simple home-style recipes.

11. Do not return markdown.

12. Return JSON only.
`;

      const result =
        await callGemini({
          prompt,
        });

      if (
        !result ||
        !Array.isArray(
          result.recipes
        )
      ) {
        return res.status(500).json({
          success: false,

          message:
            "Gemini returned invalid recipe format",
        });
      }

      const recipes =
        result.recipes
          .filter(
            (recipe) =>
              recipe &&
              recipe.name &&
              Array.isArray(
                recipe.availableIngredients
              ) &&
              Array.isArray(
                recipe.missingIngredients
              ) &&
              Array.isArray(
                recipe.steps
              )
          )
          .slice(0, 4)
          .map((recipe) => ({
            name: String(
              recipe.name
            ),

            description:
              String(
                recipe.description ||
                  ""
              ),

            time:
              String(
                recipe.time ||
                  "20 min"
              ),

            difficulty:
              String(
                recipe.difficulty ||
                  "Easy"
              ),

            availableIngredients:
              recipe.availableIngredients.map(
                (item) =>
                  String(item)
              ),

            missingIngredients:
              recipe.missingIngredients.map(
                (item) =>
                  String(item)
              ),

            steps:
              recipe.steps
                .map((step) =>
                  String(step)
                )
                .slice(0, 5),
          }));

      if (recipes.length === 0) {
        return res.status(500).json({
          success: false,

          message:
            "No valid recipes could be generated",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Recipe suggestions generated successfully",

        recipes,
      });
    } catch (error) {
      console.error(
        "Recipe generation error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to generate recipes",
      });
    }
  }
);

/* =========================================================
   ADD MISSING INGREDIENTS TO GROCERY
========================================================= */

router.post(
  "/add-to-grocery",
  protect,

  async (req, res) => {
    try {
      const ingredients =
        Array.isArray(
          req.body.ingredients
        )
          ? [
              ...new Set(
                req.body.ingredients
                  .map((item) =>
                    String(item)
                      .trim()
                  )
                  .filter(Boolean)
              ),
            ]
          : [];

      if (ingredients.length === 0) {
        return res.status(400).json({
          success: false,

          message:
            "No grocery ingredients provided",
        });
      }

      const addedItems = [];
      const skippedItems = [];

      for (const ingredient of ingredients) {
        const escapedIngredient =
          ingredient.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

        const existingItem =
          await GroceryItem.findOne({
            userId:
              req.user.userId,

            name: {
              $regex:
                `^${escapedIngredient}$`,

              $options: "i",
            },

            purchased: false,
          });

        if (existingItem) {
          skippedItems.push(
            ingredient
          );

          continue;
        }

        const imageUrl =
          getIngredientImage(
            ingredient
          );

        const item =
          await GroceryItem.create({
            userId:
              req.user.userId,

            name: ingredient,

            quantity: 1,

            unit: "item",

            category:
              "Recipe Ingredients",

            imageUrl,

            purchased: false,
          });

        addedItems.push(item);
      }

      return res.status(201).json({
        success: true,

        message:
          "Missing ingredients added to grocery list",

        addedItems,

        skippedItems,
      });
    } catch (error) {
      console.error(
        "Add grocery ingredients error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to add ingredients to grocery list",
      });
    }
  }
);

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;
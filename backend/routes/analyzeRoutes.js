const express = require("express");
const multer = require("multer");

const protect = require("../middleware/authMiddleware");
const FoodAnalysis = require("../models/FoodAnalysis");

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
   GEMINI
========================================================= */

const analyzeWithGemini = async ({
  imageData,
  mimeType,
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is missing"
    );
  }

  const model = "gemini-3.6-flash";

  const prompt = `
You are FoodLens, an AI food and nutrition analyzer.

Analyze the provided food image.

Return ONLY valid JSON.

Use exactly this structure:

{
  "foodName": "name of the main food",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "healthScore": 0,
  "ingredients": [],
  "analysis": "short nutrition insight"
}

Rules:

1. Identify the main food visible in the image.

2. Estimate nutrition for one reasonable serving.

3. calories must be a number.

4. protein must be grams.

5. carbs must be grams.

6. fat must be grams.

7. healthScore must be between 0 and 100.

8. ingredients must be an array of strings.

9. Do not invent ingredients that are not reasonably visible.

10. Keep the analysis short and useful.

11. Return JSON only.
`;

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
            parts: [
              {
                text: prompt,
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageData,
                },
              },
            ],
          },
        ],

        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Gemini error:",
      data?.error?.message
    );

    throw new Error(
      data?.error?.message ||
        "Gemini analysis failed"
    );
  }

  const aiText =
    data?.candidates?.[0]
      ?.content?.parts?.[0]?.text;

  if (!aiText) {
    throw new Error(
      "Gemini returned empty response"
    );
  }

  try {
    return JSON.parse(aiText);
  } catch {
    const cleanedText = aiText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(cleanedText);
  }
};


router.post(
  "/",
  protect,
  upload.single("image"),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Food image is required",
        });
      }

      console.log("");
      console.log(
        "======================================"
      );
      console.log(" FOOD IMAGE ANALYSIS");
      console.log(
        "======================================"
      );

      console.log(
        "Image:",
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

      

      const imageUrl =
        `data:${req.file.mimetype};base64,` +
        req.file.buffer.toString("base64");

      console.log(
        "Original image converted to Base64 "
      );

      

      const result =
        await analyzeWithGemini({
          imageData:
            req.file.buffer.toString(
              "base64"
            ),

          mimeType:
            req.file.mimetype,
        });

      

      const foodName =
        String(
          result.foodName ||
            "Unknown Food"
        ).trim();

      const calories =
        Number(result.calories) || 0;

      const protein =
        Number(result.protein) || 0;

      const carbs =
        Number(result.carbs) || 0;

      const fat =
        Number(result.fat) || 0;

      const healthScore = Math.min(
        Math.max(
          Number(
            result.healthScore
          ) || 0,
          0
        ),
        100
      );

      const ingredients =
        Array.isArray(
          result.ingredients
        )
          ? [
              ...new Set(
                result.ingredients
                  .map((item) =>
                    String(item).trim()
                  )
                  .filter(Boolean)
              ),
            ]
          : [];

      const analysis =
        String(
          result.analysis || ""
        ).trim();

      

      const savedAnalysis =
        await FoodAnalysis.create({
          userId:
            req.user.userId,

          foodName,

          calories,

          protein,

          carbs,

          fat,

          healthScore,

          ingredients,

          analysis,

          imageUrl,
        });

      console.log(
        "Food analysis saved successfully "
      );

      console.log(
        "Original image saved successfully "
      );

      return res.status(201).json({
        success: true,

        message:
          "Food analyzed successfully",

        analysis: savedAnalysis,
      });
    } catch (error) {
      console.error(
        "Food analysis error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Food analysis failed",
      });
    }
  }
);

module.exports = router;
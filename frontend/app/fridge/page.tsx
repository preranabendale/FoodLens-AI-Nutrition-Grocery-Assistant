"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  ChefHat,
  Clock3,
  Loader2,
  Refrigerator,
  ShoppingCart,
  Sparkles,
  Upload,
  X,
  Plus,
} from "lucide-react";

interface Inventory {
  _id: string;
  imageName: string;
  ingredients: string[];
  aiSummary: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  inventory?: Inventory;
}

interface Recipe {
  name: string;
  description: string;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  availableIngredients: string[];
  missingIngredients: string[];
  steps: string[];
}

interface RecipeResponse {
  success: boolean;
  message: string;
  recipes?: Recipe[];
}

export default function FridgePage() {
  const router = useRouter();

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [groceryLoading, setGroceryLoading] = useState<number | null>(
    null
  );

  const [result, setResult] = useState<Inventory | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [error, setError] = useState("");
  const [recipeError, setRecipeError] = useState("");

  const [addedRecipes, setAddedRecipes] = useState<number[]>([]);

  /*
  |--------------------------------------------------------------------------
  | Image Selection
  |--------------------------------------------------------------------------
  */

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setRecipeError("");
    setResult(null);
    setRecipes([]);
    setAddedRecipes([]);

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Image
  |--------------------------------------------------------------------------
  */

  const removeImage = () => {
    setImage(null);
    setPreview("");
    setResult(null);
    setRecipes([]);
    setAddedRecipes([]);
    setError("");
    setRecipeError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Analyze Fridge
  |--------------------------------------------------------------------------
  */

  const analyzeFridge = async () => {
    if (!image) {
      setError("Please upload a fridge image first.");
      return;
    }

    const token = localStorage.getItem("foodlens_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");
    setRecipeError("");
    setResult(null);
    setRecipes([]);
    setAddedRecipes([]);

    try {
      const formData = new FormData();

      formData.append("image", image);

      const response = await fetch(
        "http://localhost:5000/api/fridge/analyze",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("foodlens_token");
        localStorage.removeItem("foodlens_user");

        router.replace("/login");
        return;
      }

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Fridge analysis failed."
        );
      }

      if (data.inventory) {
        setResult(data.inventory);
      }
    } catch (error) {
      console.error("Fridge analysis error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Generate Recipes
  |--------------------------------------------------------------------------
  */

  const generateRecipes = async () => {
    if (!result || result.ingredients.length === 0) {
      setRecipeError(
        "No ingredients are available for recipe suggestions."
      );
      return;
    }

    const token = localStorage.getItem("foodlens_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setRecipeLoading(true);
    setRecipeError("");
    setRecipes([]);
    setAddedRecipes([]);

    try {
      const response = await fetch(
        "http://localhost:5000/api/fridge/recipes",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            ingredients: result.ingredients,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("foodlens_token");
        localStorage.removeItem("foodlens_user");

        router.replace("/login");
        return;
      }

      const data: RecipeResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to generate recipes."
        );
      }

      setRecipes(data.recipes || []);
    } catch (error) {
      console.error(
        "Recipe generation error:",
        error
      );

      setRecipeError(
        error instanceof Error
          ? error.message
          : "Failed to generate recipes."
      );
    } finally {
      setRecipeLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Add Missing Ingredients To Grocery
  |--------------------------------------------------------------------------
  */

  const addMissingIngredients = async (
    recipe: Recipe,
    recipeIndex: number
  ) => {
    if (
      !recipe.missingIngredients ||
      recipe.missingIngredients.length === 0
    ) {
      return;
    }

    const token = localStorage.getItem("foodlens_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setGroceryLoading(recipeIndex);
    setRecipeError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/fridge/add-to-grocery",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            ingredients: recipe.missingIngredients,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("foodlens_token");
        localStorage.removeItem("foodlens_user");

        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to add ingredients."
        );
      }

      setAddedRecipes((previous) => [
        ...previous,
        recipeIndex,
      ]);
    } catch (error) {
      console.error(
        "Add grocery error:",
        error
      );

      setRecipeError(
        error instanceof Error
          ? error.message
          : "Failed to add ingredients to grocery list."
      );
    } finally {
      setGroceryLoading(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Difficulty Badge
  |--------------------------------------------------------------------------
  */

  const getDifficultyClass = (
    difficulty: string
  ) => {
    if (difficulty === "Easy") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (difficulty === "Medium") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-red-100 text-red-700";
  };

  return (
    <main className="min-h-screen bg-[#f7faf5] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-100 p-2">
              <Refrigerator
                size={22}
                className="text-emerald-700"
              />
            </div>

            <span className="text-lg font-bold text-slate-800">
              FoodLens
            </span>
          </div>
        </div>

        {/* Hero */}
        <section className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            <Sparkles size={16} />
            AI Fridge Assistant
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What's inside your fridge?
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Upload a photo of your fridge and FoodLens will
            identify ingredients, suggest recipes, and help
            build your grocery list.
          </p>
        </section>

        {/* Main Section */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* Upload Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Upload Fridge Image
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                JPG, PNG or WEBP · Maximum 10MB
              </p>
            </div>

            {!preview ? (
              <label className="flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50">

                <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
                  <Upload
                    size={34}
                    className="text-emerald-600"
                  />
                </div>

                <h3 className="text-lg font-semibold text-slate-800">
                  Upload a fridge photo
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Choose a clear photo showing your ingredients
                </p>

                <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
                  <Camera size={18} />
                  Choose Image
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-2xl bg-slate-100">

                <img
                  src={preview}
                  alt="Fridge preview"
                  className="h-[360px] w-full object-cover"
                />

                <button
                  onClick={removeImage}
                  type="button"
                  className="absolute right-4 top-4 rounded-full bg-white p-2.5 text-slate-700 shadow-lg transition hover:bg-red-50 hover:text-red-600"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {preview && !result && (
              <button
                onClick={analyzeFridge}
                type="button"
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                    AI is analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Analyze My Fridge
                  </>
                )}
              </button>
            )}

            {loading && (
              <p className="mt-4 text-center text-sm text-slate-500">
                Gemini AI is identifying your ingredients...
              </p>
            )}
          </div>

          {/* Ingredients Result */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            {!result ? (
              <div className="flex min-h-[440px] flex-col items-center justify-center text-center">

                <div className="mb-5 rounded-2xl bg-slate-100 p-5">
                  <Refrigerator
                    size={42}
                    className="text-slate-400"
                  />
                </div>

                <h2 className="text-xl font-bold text-slate-800">
                  Your ingredients will appear here
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Upload a clear fridge image and let
                  FoodLens identify the ingredients for you.
                </p>
              </div>
            ) : (
              <div>

                {/* Result Header */}
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2
                        size={21}
                        className="text-emerald-600"
                      />

                      <span className="text-sm font-semibold text-emerald-600">
                        Analysis Complete
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900">
                      Ingredients Found
                    </h2>
                  </div>

                  <div className="rounded-xl bg-emerald-100 p-3">
                    <Sparkles
                      size={22}
                      className="text-emerald-600"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-6 rounded-2xl bg-emerald-50 p-5">
                  <p className="text-sm leading-6 text-slate-700">
                    {result.aiSummary}
                  </p>
                </div>

                {/* Ingredients */}
                <div>
                  <h3 className="mb-4 font-bold text-slate-900">
                    Available Ingredients
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {result.ingredients.map(
                      (ingredient, index) => (
                        <div
                          key={`${ingredient}-${index}`}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                            <span className="text-lg">
                              🥗
                            </span>
                          </div>

                          <span className="font-medium capitalize text-slate-800">
                            {ingredient}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Recipe Button */}
                <button
                  onClick={generateRecipes}
                  disabled={recipeLoading}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {recipeLoading ? (
                    <>
                      <Loader2
                        size={20}
                        className="animate-spin"
                      />
                      Finding Recipes...
                    </>
                  ) : (
                    <>
                      <ChefHat size={20} />
                      Suggest Recipes
                    </>
                  )}
                </button>

                <button
                  onClick={removeImage}
                  type="button"
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Analyze Another Fridge
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Recipe Error */}
        {recipeError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {recipeError}
          </div>
        )}

        {/* Recipes */}
        {recipes.length > 0 && (
          <section className="mt-10">

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-emerald-600">
                  <ChefHat size={22} />
                  <span className="text-sm font-bold uppercase tracking-wide">
                    AI Kitchen
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  What can you cook?
                </h2>

                <p className="mt-2 text-slate-600">
                  Recipes created using the ingredients detected
                  in your fridge.
                </p>
              </div>

              <button
                onClick={generateRecipes}
                disabled={recipeLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {recipeLoading ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Sparkles size={17} />
                )}
                Regenerate
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {recipes.map((recipe, index) => (
                <article
                  key={`${recipe.name}-${index}`}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Recipe Header */}
                  <div className="bg-emerald-50 p-6">
                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                          <ChefHat
                            size={25}
                            className="text-emerald-600"
                          />
                        </div>

                        <h3 className="text-xl font-bold text-slate-900">
                          {recipe.name}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {recipe.description}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${getDifficultyClass(
                          recipe.difficulty
                        )}`}
                      >
                        {recipe.difficulty}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-600">
                      <Clock3 size={17} />
                      {recipe.time}
                    </div>
                  </div>

                  {/* Recipe Body */}
                  <div className="p-6">

                    {/* Available Ingredients */}
                    <div>
                      <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                        You Have
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {recipe.availableIngredients?.map(
                          (ingredient, ingredientIndex) => (
                            <span
                              key={`${ingredient}-${ingredientIndex}`}
                              className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                            >
                              <Check size={13} />
                              {ingredient}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Missing Ingredients */}
                    {recipe.missingIngredients &&
                      recipe.missingIngredients.length > 0 && (
                        <div className="mt-5">

                          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                            You Need
                          </h4>

                          <div className="flex flex-wrap gap-2">
                            {recipe.missingIngredients.map(
                              (
                                ingredient,
                                ingredientIndex
                              ) => (
                                <span
                                  key={`${ingredient}-${ingredientIndex}`}
                                  className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700"
                                >
                                  + {ingredient}
                                </span>
                              )
                            )}
                          </div>

                          <button
                            onClick={() =>
                              addMissingIngredients(
                                recipe,
                                index
                              )
                            }
                            disabled={
                              groceryLoading === index ||
                              addedRecipes.includes(index)
                            }
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {groceryLoading === index ? (
                              <>
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />
                                Adding...
                              </>
                            ) : addedRecipes.includes(
                                index
                              ) ? (
                              <>
                                <Check size={17} />
                                Added to Grocery List
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={17} />
                                Add Missing Ingredients
                              </>
                            )}
                          </button>
                        </div>
                      )}

                    {/* No Missing Ingredients */}
                    {(!recipe.missingIngredients ||
                      recipe.missingIngredients.length ===
                        0) && (
                      <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 size={18} />
                        You already have everything needed!
                      </div>
                    )}

                    {/* Steps */}
                    {recipe.steps &&
                      recipe.steps.length > 0 && (
                        <div className="mt-6">

                          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                            Cooking Steps
                          </h4>

                          <div className="space-y-3">
                            {recipe.steps.map(
                              (step, stepIndex) => (
                                <div
                                  key={stepIndex}
                                  className="flex gap-3"
                                >
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                                    {stepIndex + 1}
                                  </div>

                                  <p className="pt-1 text-sm leading-5 text-slate-600">
                                    {step}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Feature Cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-2xl">
              🤖
            </div>

            <h3 className="font-bold text-slate-800">
              AI Recognition
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Gemini identifies visible food ingredients from
              your fridge photo.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-2xl">
              🍳
            </div>

            <h3 className="font-bold text-slate-800">
              AI Recipe Suggestions
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Get practical recipes based on ingredients you
              already have.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-2xl">
              🛒
            </div>

            <h3 className="font-bold text-slate-800">
              Smart Grocery List
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Add missing recipe ingredients directly to your
              existing grocery list.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
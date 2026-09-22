"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Camera,
  CheckCircle,
  ImagePlus,
  Leaf,
  Loader2,
  Sparkles,
  Upload,
  X,
  Flame,
  Beef,
  Wheat,
  Droplets,
  HeartPulse,
  RotateCcw,
} from "lucide-react";

type AnalysisResult = {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  ingredients: string[];
  analysis: string;
};

export default function AnalyzePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication check
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // CHECK LOGIN
  useEffect(() => {
    const token = localStorage.getItem("foodlens_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("Image must be less than 10MB.");
      return;
    }

    setFile(selectedFile);
    setImage(URL.createObjectURL(selectedFile));
    setResult(null);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const removeImage = () => {
    setImage("");
    setFile(null);
    setResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeFood = async () => {
    if (!file) {
      alert("Please select a food image first.");
      return;
    }

    const token = localStorage.getItem("foodlens_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        "http://localhost:5000/api/analyze",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      // Token expired / invalid
      if (response.status === 401) {
        localStorage.removeItem("foodlens_token");
        localStorage.removeItem("foodlens_user");

        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Analysis failed"
        );
      }

      if (!data.analysis) {
        throw new Error(
          "No analysis result received."
        );
      }

      setResult(data.analysis);

      setTimeout(() => {
        document
          .getElementById("analysis-result")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const analyzeAnother = () => {
    setResult(null);
    setImage("");
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // AUTH CHECKING SCREEN
  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f7faf5]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-gray-600">
            Checking login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7faf5] text-[#12372a]">

      {/* HEADER */}
      <header className="border-b border-[#dce8df] bg-white px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">

          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#12372a] text-white">
              <Leaf size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold">
                FoodLens
              </h1>

              <p className="text-[9px] tracking-widest text-gray-500">
                SNAP • ANALYZE • EAT
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>

        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-5xl px-5 py-12">

        {/* TITLE */}
        <div className="mb-10 text-center">

          <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-[#e8f5ec] px-4 py-2 text-xs font-bold text-[#168354]">
            <Sparkles size={14} />
            AI FOOD ANALYZER
          </div>

          <h1 className="text-4xl font-bold sm:text-5xl">
            What&apos;s on your{" "}
            <span className="text-[#22a06b]">
              plate?
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Upload your food photo and FoodLens AI will
            analyze the food and nutrition information.
          </p>

        </div>

        {/* UPLOAD */}
        {!result && (
          <div className="grid overflow-hidden rounded-3xl border bg-white shadow-sm lg:grid-cols-2">

            {/* LEFT */}
            <div className="p-6 sm:p-10">

              <p className="text-xs font-bold tracking-widest text-[#22a06b]">
                STEP 01
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Add your food photo
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Upload a clear image of your meal.
              </p>

              {image ? (
                <div className="relative mt-6 overflow-hidden rounded-2xl">

                  <img
                    src={image}
                    alt="Food"
                    className="h-80 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                  >
                    <X size={18} />
                  </button>

                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold">
                    <CheckCircle
                      size={15}
                      className="text-green-500"
                    />
                    Image ready
                  </div>

                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="mt-6 flex h-80 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cfe0d4] bg-[#f8faf7] transition hover:border-[#22a06b] hover:bg-[#f1f8f3]"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#22a06b]">
                    <ImagePlus size={30} />
                  </div>

                  <h3 className="font-bold">
                    Upload food image
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    JPG, PNG or WEBP
                  </p>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />

              <div className="mt-5 grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition hover:bg-gray-50"
                >
                  <Upload size={18} />
                  Upload
                </button>

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition hover:bg-gray-50"
                >
                  <Camera size={18} />
                  Camera
                </button>

              </div>

            </div>

            {/* RIGHT */}
            <div className="bg-[#12372a] p-6 text-white sm:p-10">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22a06b]">
                <Sparkles size={26} />
              </div>

              <p className="mt-7 text-xs font-bold tracking-widest text-[#8fd694]">
                AI ANALYSIS
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Understand your food better.
              </h2>

              <p className="mt-4 leading-7 text-gray-300">
                FoodLens AI detects your food and estimates
                important nutrition information.
              </p>

              <div className="mt-8 space-y-5">

                <Feature
                  title="Food Detection"
                  text="Identify food from your image"
                />

                <Feature
                  title="Nutrition"
                  text="Calories, protein, carbs and fat"
                />

                <Feature
                  title="AI Insights"
                  text="Simple health insights about your meal"
                />

              </div>

              <button
                type="button"
                onClick={analyzeFood}
                disabled={!file || loading}
                className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-bold text-[#12372a] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                    Analyzing Food...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Analyze My Food
                  </>
                )}

              </button>

              {!file && (
                <p className="mt-3 text-center text-xs text-gray-400">
                  Upload an image first
                </p>
              )}

            </div>
          </div>
        )}

        {/* RESULT */}
        {result && (
          <section
            id="analysis-result"
            className="animate-in fade-in duration-500"
          >

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div>

                <div className="mb-3 flex w-fit items-center gap-2 rounded-full bg-[#e8f5ec] px-4 py-2 text-xs font-bold text-[#168354]">
                  <CheckCircle size={14} />
                  ANALYSIS COMPLETE
                </div>

                <h2 className="text-4xl font-bold">
                  Your food report
                </h2>

                <p className="mt-2 text-gray-500">
                  AI-generated nutrition analysis for your meal.
                </p>

              </div>

              <button
                type="button"
                onClick={analyzeAnother}
                className="flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-bold transition hover:bg-gray-50"
              >
                <RotateCcw size={17} />
                Analyze Another
              </button>

            </div>

            {/* FOOD CARD */}
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">

              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">

                <div className="relative min-h-[320px] bg-gray-100">

                  {image && (
                    <img
                      src={image}
                      alt={result.foodName}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}

                  <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-bold shadow-sm">
                    AI DETECTED
                  </div>

                </div>

                <div className="p-6 sm:p-10">

                  <p className="text-xs font-bold tracking-widest text-[#22a06b]">
                    FOOD IDENTIFIED
                  </p>

                  <h3 className="mt-2 text-4xl font-bold">
                    {result.foodName}
                  </h3>

                  <p className="mt-3 text-gray-500">
                    Estimated nutrition per analyzed serving.
                  </p>

                  <div className="mt-7 rounded-2xl bg-[#f0f8f2] p-5">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#22a06b]">
                          <HeartPulse size={23} />
                        </div>

                        <div>

                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Health Score
                          </p>

                          <p className="font-bold">
                            Nutrition quality
                          </p>

                        </div>

                      </div>

                      <div className="text-right">

                        <span className="text-3xl font-bold text-[#168354]">
                          {result.healthScore}
                        </span>

                        <span className="text-sm text-gray-500">
                          /100
                        </span>

                      </div>

                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">

                      <div
                        className="h-full rounded-full bg-[#22a06b] transition-all"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              result.healthScore,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* NUTRITION */}
            <div className="mt-6">

              <div className="mb-4">

                <p className="text-xs font-bold tracking-widest text-[#22a06b]">
                  NUTRITION
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  Nutrition breakdown
                </h3>

              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <NutritionCard
                  icon={<Flame size={21} />}
                  label="Calories"
                  value={result.calories}
                  unit="kcal"
                />

                <NutritionCard
                  icon={<Beef size={21} />}
                  label="Protein"
                  value={result.protein}
                  unit="g"
                />

                <NutritionCard
                  icon={<Wheat size={21} />}
                  label="Carbohydrates"
                  value={result.carbs}
                  unit="g"
                />

                <NutritionCard
                  icon={<Droplets size={21} />}
                  label="Fat"
                  value={result.fat}
                  unit="g"
                />

              </div>

            </div>

            {/* INSIGHTS */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">

              <div className="rounded-3xl bg-[#12372a] p-7 text-white">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22a06b]">
                    <Sparkles size={21} />
                  </div>

                  <div>

                    <p className="text-xs font-bold tracking-widest text-[#8fd694]">
                      AI INSIGHT
                    </p>

                    <h3 className="text-xl font-bold">
                      What FoodLens thinks
                    </h3>

                  </div>

                </div>

                <p className="mt-6 leading-7 text-gray-200">
                  {result.analysis}
                </p>

              </div>

              {/* INGREDIENTS */}
              <div className="rounded-3xl border bg-white p-7">

                <p className="text-xs font-bold tracking-widest text-[#22a06b]">
                  DETECTED INGREDIENTS
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  What&apos;s in your meal?
                </h3>

                {result.ingredients?.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">

                    {result.ingredients.map(
                      (ingredient, index) => (
                        <span
                          key={`${ingredient}-${index}`}
                          className="rounded-full bg-[#eef7f0] px-4 py-2 text-sm font-semibold text-[#168354]"
                        >
                          {ingredient}
                        </span>
                      )
                    )}

                  </div>
                ) : (
                  <p className="mt-5 text-sm text-gray-500">
                    No ingredients were detected.
                  </p>
                )}

              </div>

            </div>

            {/* DISCLAIMER */}
            <div className="mt-6 rounded-2xl border border-[#dce8df] bg-white p-5 text-center text-xs leading-5 text-gray-500">
              FoodLens provides AI-based nutrition estimates.
              Values may vary depending on portion size,
              ingredients and preparation method. This is not
              medical advice.
            </div>

          </section>
        )}

        {/* PROCESS */}
        {!result && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">

            <InfoCard
              number="01"
              title="Upload"
              text="Add a photo of your meal."
            />

            <InfoCard
              number="02"
              title="Analyze"
              text="AI identifies food and nutrition."
            />

            <InfoCard
              number="03"
              title="Improve"
              text="Get useful nutrition insights."
            />

          </div>
        )}

      </div>
    </main>
  );
}

/* FEATURE */

function Feature({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">

      <CheckCircle className="shrink-0 text-[#8fd694]" />

      <div>

        <p className="font-bold">
          {title}
        </p>

        <p className="text-sm text-gray-400">
          {text}
        </p>

      </div>

    </div>
  );
}

/* NUTRITION CARD */

function NutritionCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#22a06b]">
          {icon}
        </div>

        <span className="text-xs font-semibold text-gray-400">
          EST.
        </span>

      </div>

      <p className="mt-5 text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">

        {value}

        <span className="ml-1 text-sm font-medium text-gray-400">
          {unit}
        </span>

      </p>

    </div>
  );
}

/* INFO CARD */

function InfoCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5">

      <p className="text-xs font-bold tracking-widest text-[#22a06b]">
        {number}
      </p>

      <h3 className="mt-2 font-bold">
        {title}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {text}
      </p>

    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Apple,
  ArrowRight,
  BarChart3,
  Beef,
  Camera,
  Droplets,
  Flame,
  Leaf,
  LogOut,
  Package,
  Plus,
  Refrigerator,
  ShoppingCart,
  Sparkles,
  Wheat,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Analysis = {
  _id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  ingredients: string[];
  analysis: string;
  imageUrl?: string;
  createdAt: string;
};

type DashboardData = {
  totalAnalyses: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

type FridgeItem = {
  _id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  imageUrl?: string;
};

type GroceryItem = {
  _id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  imageUrl?: string;
  purchased?: boolean;
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },

  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut" as const,
    },
  },
};

/* ================================================= */
/* MAIN DASHBOARD */
/* ================================================= */

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardData>({
    totalAnalyses: 0,
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  });

  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);

  /* ================================================= */
  /* INITIAL LOAD */
  /* ================================================= */

  useEffect(() => {
    const token = localStorage.getItem("foodlens_token");
    const storedUser = localStorage.getItem("foodlens_user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || "User");
      } catch {
        setUserName("User");
      }
    }

    fetchAllDashboardData(token);
  }, [router]);

  /* ================================================= */
  /* FETCH ALL DATA */
  /* ================================================= */

  const fetchAllDashboardData = async (token: string) => {
    try {
      setLoading(true);

      await Promise.all([
        fetchDashboard(token),
        fetchFridge(token),
        fetchGrocery(token),
      ]);
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================================================= */
  /* FETCH DASHBOARD */
  /* ================================================= */

  const fetchDashboard = async (token: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load dashboard"
        );
      }

      setStats(
        data.stats || {
          totalAnalyses: 0,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
        }
      );

      setRecentAnalyses(data.recentAnalyses || []);
    } catch (error) {
      console.error("Dashboard API error:", error);
    }
  };

  /* ================================================= */
  /* FETCH FRIDGE */
  /* ================================================= */

  const fetchFridge = async (token: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/fridge",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        console.error(
          "Fridge API error:",
          data.message
        );
        return;
      }

      setFridgeItems(
        data.items ||
          data.inventory?.ingredients ||
          []
      );
    } catch (error) {
      console.error("Fridge fetch error:", error);
    }
  };

  /* ================================================= */
  /* FETCH GROCERY */
  /* ================================================= */

  const fetchGrocery = async (token: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/grocery",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        console.error(
          "Grocery API error:",
          data.message
        );
        return;
      }

      setGroceryItems(data.items || []);
    } catch (error) {
      console.error("Grocery fetch error:", error);
    }
  };

  /* ================================================= */
  /* UNAUTHORIZED */
  /* ================================================= */

  const handleUnauthorized = () => {
    localStorage.removeItem("foodlens_token");
    localStorage.removeItem("foodlens_user");
    router.push("/login");
  };

  /* ================================================= */
  /* LOGOUT */
  /* ================================================= */

  const logout = () => {
    localStorage.removeItem("foodlens_token");
    localStorage.removeItem("foodlens_user");
    router.push("/login");
  };

  /* ================================================= */
  /* HEALTH SCORE */
  /* ================================================= */

  const averageHealthScore =
    recentAnalyses.length > 0
      ? Math.round(
          recentAnalyses.reduce(
            (total, item) =>
              total + item.healthScore,
            0
          ) / recentAnalyses.length
        )
      : 0;

  /* ================================================= */
  /* PENDING GROCERY */
  /* ================================================= */

  const pendingGroceries = groceryItems.filter(
    (item) => !item.purchased
  ).length;

  /* ================================================= */
  /* RETURN */
  /* ================================================= */

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5faf6] text-[#12372a]">

      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
          className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-[#d8f3e3] opacity-60 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
          className="absolute right-[-100px] top-20 h-80 w-80 rounded-full bg-[#e5f3c9] opacity-60 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
          className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#dff4e7] opacity-40 blur-3xl"
        />

      </div>

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="sticky top-0 z-50 border-b border-[#dce8df]/80 bg-white/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <Link
            href="/dashboard"
            className="group flex items-center gap-3"
          >

            <motion.div
              whileHover={{
                rotate: -8,
                scale: 1.05,
              }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#12372a] text-white shadow-lg"
            >
              <Leaf size={23} />
            </motion.div>

            <div>
              <h1 className="text-lg font-bold">
                Food
                <span className="text-[#22a06b]">
                  Lens
                </span>
              </h1>

              <p className="text-[9px] tracking-[0.25em] text-gray-500">
                SNAP • ANALYZE • EAT
              </p>
            </div>

          </Link>

          {/* NAV */}

          <nav className="hidden items-center gap-1 lg:flex">

            <NavLink
              href="/dashboard"
              icon={<BarChart3 size={15} />}
              label="Dashboard"
              active
            />

            <NavLink
              href="/analyze"
              icon={<Camera size={15} />}
              label="Analyze Food"
            />

            <NavLink
              href="/fridge"
              icon={<Refrigerator size={15} />}
              label="My Fridge"
            />

            <NavLink
              href="/grocery"
              icon={<ShoppingCart size={15} />}
              label="Grocery"
            />

          </nav>

          {/* HEADER BUTTONS */}

          <div className="flex items-center gap-3">

            <Link
              href="/analyze"
              className="hidden items-center gap-2 rounded-xl bg-[#12372a] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#1b4b39] sm:flex"
            >
              <Plus size={17} />
              Analyze Food
            </Link>

            <motion.button
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
            >
              <LogOut size={16} />

              <span className="hidden sm:inline">
                Logout
              </span>
            </motion.button>

          </div>

        </div>

      </header>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:py-10">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >

          {/* ================================================= */}
          {/* HERO */}
          {/* ================================================= */}

          <motion.section
            variants={itemVariants}
            className="relative overflow-hidden rounded-[32px] bg-[#12372a] p-7 text-white shadow-2xl sm:p-9 lg:p-10"
          >

            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 8, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
              }}
              className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#22a06b]/20"
            />

            <motion.div
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
              }}
              className="absolute -bottom-32 right-32 h-64 w-64 rounded-full bg-[#8fd694]/10"
            />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

              <div>

                <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide text-[#a9e8bf] backdrop-blur">

                  <Sparkles size={14} />

                  YOUR NUTRITION DASHBOARD

                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Hello, {userName} 👋
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#d4e8dc] sm:text-base">
                  Track your meals, manage
                  your fridge, organize
                  groceries and understand
                  your nutrition with
                  AI-powered food insights.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">

                  <Link
                    href="/analyze"
                    className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 font-bold text-[#12372a] shadow-lg transition hover:-translate-y-1"
                  >

                    <Sparkles size={18} />

                    Analyze New Meal

                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />

                  </Link>

                  <Link
                    href="/fridge"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/15"
                  >

                    <Refrigerator size={18} />

                    My Fridge

                  </Link>

                </div>

              </div>

              <HealthCircle
                score={averageHealthScore}
              />

            </div>

          </motion.section>

          {/* ================================================= */}
          {/* MODULE CARDS */}
          {/* ================================================= */}

          <motion.section
            variants={itemVariants}
            className="mt-6"
          >

            <div className="mb-4">

              <p className="text-xs font-bold tracking-[0.2em] text-[#22a06b]">
                FOODLENS TOOLS
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Manage your food in one place
              </h2>

            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              <FeatureCard
                href="/analyze"
                icon={<Camera size={25} />}
                title="Food Analyzer"
                description="Upload a food image and get AI-powered nutrition insights."
                badge="AI POWERED"
              />

              <FeatureCard
                href="/fridge"
                icon={<Refrigerator size={25} />}
                title="My Fridge"
                description="Track the food items currently available in your fridge."
                badge={`${fridgeItems.length} ITEMS`}
              />

              <FeatureCard
                href="/grocery"
                icon={<ShoppingCart size={25} />}
                title="Grocery List"
                description="Manage your shopping list and track purchased items."
                badge={`${pendingGroceries} PENDING`}
              />

            </div>

          </motion.section>

          {/* ================================================= */}
          {/* LIVE STATS */}
          {/* ================================================= */}

          <motion.div
            variants={containerVariants}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >

            <motion.div variants={itemVariants}>
              <StatCard
                icon={<Apple size={21} />}
                title="Meals Tracked"
                value={stats.totalAnalyses}
                suffix=""
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <StatCard
                icon={<Flame size={21} />}
                title="Calories"
                value={Math.round(stats.totalCalories)}
                suffix="kcal"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <StatCard
                icon={<Beef size={21} />}
                title="Protein"
                value={
                  Math.round(
                    stats.totalProtein * 10
                  ) / 10
                }
                suffix="g"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <StatCard
                icon={<HeartIcon />}
                title="Avg. Health Score"
                value={averageHealthScore}
                suffix="/100"
              />
            </motion.div>

          </motion.div>

          {/* ================================================= */}
          {/* FRIDGE + GROCERY */}
          {/* ================================================= */}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            {/* FRIDGE */}

            <motion.section
              variants={itemVariants}
              className="rounded-[28px] border border-[#e1ebe4] bg-white p-6 shadow-sm sm:p-7"
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#22a06b]">
                    <Refrigerator size={20} />
                  </div>

                  <div>

                    <p className="text-xs font-bold tracking-[0.15em] text-[#22a06b]">
                      INVENTORY
                    </p>

                    <h2 className="text-xl font-black">
                      My Fridge
                    </h2>

                  </div>

                </div>

                <Link
                  href="/fridge"
                  className="flex items-center gap-1 text-sm font-bold text-[#22a06b]"
                >
                  View
                  <ArrowRight size={15} />
                </Link>

              </div>

              {loading ? (
                <LoadingGrid />
              ) : fridgeItems.length === 0 ? (
                <EmptyModule
                  icon={<Refrigerator size={25} />}
                  title="Your fridge is empty"
                  text="Add food items to start managing your inventory."
                  href="/fridge"
                  button="Add Food"
                />
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-3">

                  {fridgeItems
                    .slice(0, 4)
                    .map((item) => (
                      <FoodMiniCard
                        key={item._id}
                        item={item}
                      />
                    ))}

                </div>
              )}

            </motion.section>

            {/* GROCERY */}

            <motion.section
              variants={itemVariants}
              className="rounded-[28px] border border-[#e1ebe4] bg-white p-6 shadow-sm sm:p-7"
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4df] text-[#d58a18]">
                    <ShoppingCart size={20} />
                  </div>

                  <div>

                    <p className="text-xs font-bold tracking-[0.15em] text-[#d58a18]">
                      SHOPPING
                    </p>

                    <h2 className="text-xl font-black">
                      Grocery List
                    </h2>

                  </div>

                </div>

                <Link
                  href="/grocery"
                  className="flex items-center gap-1 text-sm font-bold text-[#22a06b]"
                >
                  View
                  <ArrowRight size={15} />
                </Link>

              </div>

              {loading ? (
                <LoadingGrid />
              ) : groceryItems.length === 0 ? (
                <EmptyModule
                  icon={<ShoppingCart size={25} />}
                  title="No grocery items"
                  text="Create your shopping list and keep everything organized."
                  href="/grocery"
                  button="Add Grocery"
                />
              ) : (
                <div className="mt-6 space-y-3">

                  {groceryItems
                    .filter(
                      (item) => !item.purchased
                    )
                    .slice(0, 4)
                    .map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between rounded-2xl border border-[#e7eee9] bg-[#f9fcfa] p-3"
                      >

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e8f5ec] text-[#22a06b]">

                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={18} />
                            )}

                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold">
                              {item.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {item.quantity || 1}{" "}
                              {item.unit || "item"}
                            </p>

                          </div>

                        </div>

                        <span className="rounded-full bg-[#fff4df] px-2.5 py-1 text-[10px] font-bold text-[#c47c11]">
                          TO BUY
                        </span>

                      </div>
                    ))}

                </div>
              )}

            </motion.section>

          </div>

          {/* ================================================= */}
          {/* FOOD HISTORY + NUTRITION */}
          {/* ================================================= */}

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">

            {/* RECENT ANALYSES */}

            <motion.section
              variants={itemVariants}
              className="rounded-[28px] border border-[#e1ebe4] bg-white p-6 shadow-sm sm:p-7"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold tracking-[0.2em] text-[#22a06b]">
                    FOOD HISTORY
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Recent analyses
                  </h2>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#22a06b]">
                  <BarChart3 size={22} />
                </div>

              </div>

              {loading ? (
                <div className="mt-8 space-y-4">

                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-20 animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}

                </div>
              ) : recentAnalyses.length === 0 ? (
                <div className="mt-8 rounded-3xl border-2 border-dashed border-[#dce8df] p-10 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#22a06b]">
                    <Apple size={29} />
                  </div>

                  <h3 className="mt-5 font-bold">
                    No meals analyzed yet
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Upload your first food image to start tracking.
                  </p>

                  <Link
                    href="/analyze"
                    className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-xl bg-[#12372a] px-5 py-3 text-sm font-bold text-white"
                  >
                    Analyze Food
                    <ArrowRight size={16} />
                  </Link>

                </div>
              ) : (
                <div className="mt-6 space-y-3">

                  {recentAnalyses.map(
                    (item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{
                          opacity: 0,
                          x: -20,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: index * 0.08,
                        }}
                      >
                        <AnalysisItem
                          analysis={item}
                        />
                      </motion.div>
                    )
                  )}

                </div>
              )}

            </motion.section>

            {/* NUTRITION */}

            <motion.section
              variants={itemVariants}
              className="relative overflow-hidden rounded-[28px] bg-[#12372a] p-6 text-white shadow-xl sm:p-7"
            >

              <div className="relative">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22a06b] shadow-lg">
                  <Leaf size={23} />
                </div>

                <p className="mt-6 text-xs font-bold tracking-[0.2em] text-[#8fd694]">
                  NUTRITION SUMMARY
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Your tracked nutrition
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-300">
                  Nutrition totals from all meals analyzed with FoodLens.
                </p>

                <div className="mt-7 space-y-5">

                  <NutritionRow
                    icon={<Flame size={18} />}
                    label="Calories"
                    value={`${Math.round(
                      stats.totalCalories
                    )} kcal`}
                  />

                  <NutritionRow
                    icon={<Beef size={18} />}
                    label="Protein"
                    value={`${Math.round(
                      stats.totalProtein * 10
                    ) / 10} g`}
                  />

                  <NutritionRow
                    icon={<Wheat size={18} />}
                    label="Carbohydrates"
                    value={`${Math.round(
                      stats.totalCarbs * 10
                    ) / 10} g`}
                  />

                  <NutritionRow
                    icon={<Droplets size={18} />}
                    label="Fat"
                    value={`${Math.round(
                      stats.totalFat * 10
                    ) / 10} g`}
                  />

                </div>

                <Link
                  href="/analyze"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-bold text-[#12372a] transition hover:-translate-y-1 hover:bg-gray-100"
                >
                  <Sparkles size={18} />
                  Analyze Another Meal
                </Link>

              </div>

            </motion.section>

          </div>

          {/* ================================================= */}
          {/* RECENT FOOD IMAGES */}
          {/* ================================================= */}

          <motion.section
            variants={itemVariants}
            className="mt-6 rounded-[28px] border border-[#e1ebe4] bg-white p-6 shadow-sm sm:p-7"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold tracking-[0.2em] text-[#22a06b]">
                  FOOD IMAGES
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Your analyzed food
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Images from your recent AI food analyses.
                </p>

              </div>

              <Link
                href="/analyze"
                className="hidden items-center gap-2 rounded-xl bg-[#12372a] px-4 py-2.5 text-sm font-bold text-white sm:flex"
              >
                <Plus size={16} />
                Analyze
              </Link>

            </div>

            {recentAnalyses.length === 0 ? (
              <div className="mt-6 rounded-3xl border-2 border-dashed border-[#dce8df] p-8 text-center">

                <Camera
                  size={30}
                  className="mx-auto text-[#22a06b]"
                />

                <p className="mt-3 font-bold">
                  No food images yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Analyze your first meal to see it here.
                </p>

              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">

                {recentAnalyses
                  .slice(0, 5)
                  .map((item) => (
                    <FoodImageCard
                      key={item._id}
                      analysis={item}
                    />
                  ))}

              </div>
            )}

          </motion.section>

          {/* ================================================= */}
          {/* QUICK ACTIONS */}
          {/* ================================================= */}

          <motion.section
            variants={itemVariants}
            className="mt-6"
          >

            <div className="mb-4">

              <p className="text-xs font-bold tracking-[0.2em] text-[#22a06b]">
                QUICK ACTIONS
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Keep improving your food choices
              </h2>

            </div>

            <div className="grid gap-4 md:grid-cols-3">

              <QuickCard
                icon={<Camera size={22} />}
                title="Analyze Food"
                text="Use AI to understand your next meal."
                href="/analyze"
              />

              <QuickCard
                icon={<Refrigerator size={22} />}
                title="Manage Fridge"
                text="Track the food available in your fridge."
                href="/fridge"
              />

              <QuickCard
                icon={<ShoppingCart size={22} />}
                title="Manage Grocery"
                text="Create and organize your shopping list."
                href="/grocery"
              />

            </div>

          </motion.section>

        </motion.div>

        {/* MOBILE BUTTON */}

        <Link
          href="/analyze"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#22a06b] text-white shadow-xl shadow-[#22a06b]/30 sm:hidden"
        >
          <Plus size={25} />
        </Link>

      </div>

    </main>
  );
}

/* ================================================= */
/* NAV LINK */
/* ================================================= */

function NavLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
        active
          ? "bg-[#e8f5ec] text-[#22a06b]"
          : "text-gray-600 hover:bg-[#f3f8f4] hover:text-[#12372a]"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

/* ================================================= */
/* FEATURE CARD */
/* ================================================= */

function FeatureCard({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{
          y: -6,
        }}
        whileTap={{
          scale: 0.98,
        }}
        className="group relative overflow-hidden rounded-[24px] border border-[#e1ebe4] bg-white p-5 shadow-sm transition hover:shadow-xl hover:shadow-[#12372a]/5"
      >

        <div className="flex items-start justify-between">

          <motion.div
            whileHover={{
              rotate: 8,
              scale: 1.08,
            }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#22a06b]"
          >
            {icon}
          </motion.div>

          <span className="rounded-full bg-[#f1f7f3] px-2.5 py-1 text-[9px] font-bold tracking-wide text-[#22a06b]">
            {badge}
          </span>

        </div>

        <h3 className="mt-5 text-lg font-black">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {description}
        </p>

        <div className="mt-4 flex items-center gap-1 text-sm font-bold text-[#22a06b]">
          Open
          <ArrowRight
            size={15}
            className="transition group-hover:translate-x-1"
          />
        </div>

      </motion.div>
    </Link>
  );
}

/* ================================================= */
/* LOADING GRID */
/* ================================================= */

function LoadingGrid() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">

      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-20 animate-pulse rounded-2xl bg-gray-100"
        />
      ))}

    </div>
  );
}

/* ================================================= */
/* EMPTY MODULE */
/* ================================================= */

function EmptyModule({
  icon,
  title,
  text,
  href,
  button,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
  button: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border-2 border-dashed border-[#dce8df] p-6 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#22a06b]">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-bold">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-500">
        {text}
      </p>

      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#12372a] px-4 py-2.5 text-xs font-bold text-white"
      >
        <Plus size={14} />
        {button}
      </Link>

    </div>
  );
}

/* ================================================= */
/* FOOD MINI CARD */
/* ================================================= */

function FoodMiniCard({
  item,
}: {
  item: FridgeItem;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e7eee9] bg-[#f9fcfa] p-3">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e8f5ec] text-[#22a06b]">

        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Apple size={19} />
        )}

      </div>

      <div className="min-w-0">

        <p className="truncate text-sm font-bold">
          {item.name}
        </p>

        <p className="text-xs text-gray-500">
          {item.quantity || 1}{" "}
          {item.unit || "item"}
        </p>

      </div>

    </div>
  );
}

/* ================================================= */
/* FOOD IMAGE CARD */
/* ================================================= */

function FoodImageCard({
  analysis,
}: {
  analysis: Analysis;
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
      }}
      className="group overflow-hidden rounded-2xl border border-[#e1ebe4] bg-[#f9fcfa] shadow-sm"
    >

      <div className="relative h-36 overflow-hidden bg-[#e8f5ec]">

        {analysis.imageUrl ? (
          <img
            src={analysis.imageUrl}
            alt={analysis.foodName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#22a06b]">
            <Apple size={36} />
          </div>
        )}

        <div className="absolute left-2 top-2 rounded-full bg-[#12372a]/85 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur">
          AI ANALYZED
        </div>

      </div>

      <div className="p-3">

        <p className="truncate text-sm font-bold">
          {analysis.foodName}
        </p>

        <div className="mt-2 flex items-center justify-between">

          <span className="text-xs text-gray-500">
            {Math.round(analysis.calories)} kcal
          </span>

          <span className="rounded-full bg-[#e8f5ec] px-2 py-1 text-[10px] font-bold text-[#22a06b]">
            {analysis.healthScore}/100
          </span>

        </div>

      </div>

    </motion.div>
  );
}

/* ================================================= */
/* HEALTH CIRCLE */
/* ================================================= */

function HealthCircle({
  score,
}: {
  score: number;
}) {
  const radius = 52;

  const circumference =
    2 * Math.PI * radius;

  const progress =
    circumference -
    (score / 100) * circumference;

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.7,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        delay: 0.4,
        duration: 0.6,
      }}
      className="mx-auto flex h-48 w-48 items-center justify-center lg:mr-4"
    >

      <div className="relative">

        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="-rotate-90"
        >

          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="12"
          />

          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="#62d995"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{
              strokeDashoffset: circumference,
            }}
            animate={{
              strokeDashoffset: progress,
            }}
            transition={{
              duration: 1.5,
              delay: 0.5,
              ease: "easeOut" as const,
            }}
          />

        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">

          <span className="text-4xl font-black">
            {score}
          </span>

          <span className="text-xs font-medium text-[#b8d8c4]">
            HEALTH SCORE
          </span>

        </div>

      </div>

    </motion.div>
  );
}

/* ================================================= */
/* STAT CARD */
/* ================================================= */

function StatCard({
  icon,
  title,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  suffix: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.015,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className="group rounded-[24px] border border-[#e1ebe4] bg-white p-5 shadow-sm transition-shadow hover:shadow-xl hover:shadow-[#12372a]/5"
    >

      <div className="flex items-center justify-between">

        <motion.div
          whileHover={{
            rotate: 8,
            scale: 1.08,
          }}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#22a06b]"
        >
          {icon}
        </motion.div>

        <span className="rounded-full bg-[#f1f7f3] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#22a06b]">
          LIVE
        </span>

      </div>

      <p className="mt-5 text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-black">

        {value}

        <span className="ml-1 text-sm font-medium text-gray-400">
          {suffix}
        </span>

      </p>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#edf4ef]">

        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: "72%",
          }}
          transition={{
            duration: 1,
            delay: 0.4,
          }}
          className="h-full rounded-full bg-[#22a06b]"
        />

      </div>

    </motion.div>
  );
}

/* ================================================= */
/* ANALYSIS ITEM */
/* ================================================= */

function AnalysisItem({
  analysis,
}: {
  analysis: Analysis;
}) {
  const date = new Date(
    analysis.createdAt
  );

  return (
    <motion.div
      whileHover={{
        x: 5,
        scale: 1.01,
      }}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-[#e5eee7] bg-white p-4 transition hover:border-[#cce4d4] hover:bg-[#f8fbf8] hover:shadow-md"
    >

      <div className="flex min-w-0 items-center gap-4">

        <motion.div
          whileHover={{
            rotate: -8,
            scale: 1.08,
          }}
          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#e8f5ec] text-[#22a06b]"
        >

          {analysis.imageUrl ? (
            <img
              src={analysis.imageUrl}
              alt={analysis.foodName}
              className="h-full w-full object-cover"
            />
          ) : (
            <Apple size={22} />
          )}

        </motion.div>

        <div className="min-w-0">

          <h3 className="truncate font-bold">
            {analysis.foodName}
          </h3>

          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">

            <span>
              {Math.round(
                analysis.calories
              )}{" "}
              kcal
            </span>

            <span>
              {analysis.protein}g protein
            </span>

            <span className="font-semibold text-[#22a06b]">
              Score {analysis.healthScore}
            </span>

          </div>

        </div>

      </div>

      <div className="hidden text-right sm:block">

        <p className="text-xs font-semibold text-gray-400">
          {date.toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
            }
          )}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          {date.toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </p>

      </div>

    </motion.div>
  );
}

/* ================================================= */
/* NUTRITION ROW */
/* ================================================= */

function NutritionRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{
        x: 5,
      }}
      className="flex items-center justify-between border-b border-white/10 pb-4"
    >

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          {icon}
        </div>

        <span className="text-sm text-gray-300">
          {label}
        </span>

      </div>

      <span className="font-bold">
        {value}
      </span>

    </motion.div>
  );
}

/* ================================================= */
/* QUICK CARD */
/* ================================================= */

function QuickCard({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link href={href}>

      <motion.div
        whileHover={{
          y: -7,
        }}
        whileTap={{
          scale: 0.98,
        }}
        className="group rounded-[24px] border border-[#e1ebe4] bg-white p-5 shadow-sm transition hover:shadow-xl hover:shadow-[#12372a]/5"
      >

        <motion.div
          whileHover={{
            rotate: 8,
            scale: 1.1,
          }}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#22a06b]"
        >
          {icon}
        </motion.div>

        <h3 className="mt-4 font-bold">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          {text}
        </p>

        <div className="mt-4 flex items-center gap-1 text-sm font-bold text-[#22a06b]">
          Open
          <ArrowRight
            size={15}
            className="transition group-hover:translate-x-1"
          />
        </div>

      </motion.div>

    </Link>
  );
}

/* ================================================= */
/* HEART ICON */
/* ================================================= */

function HeartIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}
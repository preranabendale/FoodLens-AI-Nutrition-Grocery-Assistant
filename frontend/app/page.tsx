"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import {
  ArrowRight,
  Camera,
  Sparkles,
  Leaf,
  ShoppingBasket,
  ChartNoAxesCombined,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI Food Detection",
    description:
      "Upload a food image and let AI identify what's on your plate.",
    href: "/analyze",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Nutrition Insights",
    description:
      "Get easy-to-understand calories, protein, carbs and nutrition insights.",
    href: "/analyze",
  },
  {
    icon: ShoppingBasket,
    title: "Smart Grocery",
    description:
      "Turn your ingredients into a personalized grocery checklist.",
    href: "/grocery",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7faf5] text-[#12372a]">
      {/* Navbar */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#12372a] text-white">
            <Leaf size={21} />
          </div>

          <span className="text-xl font-bold tracking-tight">
            Food<span className="text-[#22a06b]">Lens</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a
            href="#features"
            className="transition hover:text-[#22a06b]"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="transition hover:text-[#22a06b]"
          >
            How It Works
          </a>

          <a
            href="#about"
            className="transition hover:text-[#22a06b]"
          >
            About
          </a>
        </div>

        <Link
          href="/register"
          className="rounded-full bg-[#12372a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1c503d]"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-10 lg:pb-28 lg:pt-20">
        {/* Background decorations */}
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#d8f3e3] blur-3xl" />

        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#e8f4c8] blur-3xl" />

        <div className="relative grid items-center gap-14 lg:grid-cols-2">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfe7d8] bg-white/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
              <Sparkles size={16} className="text-[#22a06b]" />
              AI-powered nutrition assistant
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Snap your food.
              <br />
              <span className="text-[#22a06b]">Eat smarter.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
              Turn a simple food photo into nutrition insights, recipe ideas,
              and a smart grocery plan — powered by AI.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              {/* Analyze My Food */}
              <Link
                href="/analyze"
                className="group flex items-center gap-3 rounded-full bg-[#12372a] px-7 py-4 font-semibold text-white shadow-lg shadow-[#12372a]/15 transition hover:-translate-y-1 hover:bg-[#1c503d]"
              >
                Analyze My Food

                <ArrowRight
                  size={19}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              {/* Explore Features */}
              <a
                href="#features"
                className="rounded-full border border-[#cfe0d6] bg-white px-7 py-4 font-semibold transition hover:-translate-y-1 hover:shadow-md"
              >
                Explore Features
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#22a06b]" />
                Food recognition
              </span>

              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#22a06b]" />
                Nutrition insights
              </span>

              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#22a06b]" />
                Grocery planning
              </span>
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative mx-auto w-full max-w-xl"
          >
            {/* Floating card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -left-3 top-12 z-10 rounded-2xl border border-white bg-white/90 p-4 shadow-xl backdrop-blur sm:-left-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e4f7eb] text-xl">
                  🍅
                </div>

                <div>
                  <p className="text-xs text-slate-500">Detected</p>
                  <p className="font-bold">Tomato</p>
                  <p className="text-xs text-[#22a06b]">
                    94% confidence
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Main visual */}
            <div className="relative min-h-[480px] overflow-hidden rounded-[40px] bg-[#dcefe1] p-6 shadow-2xl shadow-[#12372a]/10">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#bfe4c9]" />

              <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#cbe8a9]" />

              <div className="relative flex h-full min-h-[430px] items-center justify-center">
                {/* Food plate */}
                <motion.div
                  animate={{ rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="relative flex h-72 w-72 items-center justify-center rounded-full border-[18px] border-white bg-[#f8f4e8] shadow-2xl sm:h-80 sm:w-80"
                >
                  <div className="absolute left-16 top-16 text-6xl">
                    🥑
                  </div>

                  <div className="absolute right-14 top-12 text-5xl">
                    🍅
                  </div>

                  <div className="absolute bottom-14 left-16 text-5xl">
                    🥕
                  </div>

                  <div className="absolute bottom-12 right-16 text-5xl">
                    🥬
                  </div>

                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f0c86b] text-4xl shadow-inner">
                    🥗
                  </div>
                </motion.div>

                {/* Scan line */}
                <motion.div
                  animate={{ y: [-130, 130, -130] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute left-[12%] right-[12%] h-0.5 bg-[#22a06b] shadow-[0_0_15px_rgba(34,160,107,0.7)]"
                />

                {/* AI badge */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#12372a] px-5 py-3 text-sm font-semibold text-white shadow-xl">
                  <Sparkles size={16} />
                  AI analyzing your plate
                </div>
              </div>
            </div>

            {/* Nutrition floating card */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: 1,
              }}
              className="absolute -bottom-5 -right-3 z-10 rounded-2xl border border-white bg-white p-5 shadow-xl sm:-right-7"
            >
              <p className="text-xs font-medium text-slate-500">
                Estimated nutrition
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-black">320</span>
                <span className="pb-1 text-sm text-slate-500">
                  kcal
                </span>
              </div>

              <div className="mt-2 h-1.5 w-32 rounded-full bg-[#dcefe1]">
                <div className="h-full w-3/4 rounded-full bg-[#22a06b]" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-[#e3eee7] bg-white px-6 py-20 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-semibold text-[#22a06b]">
              POWERFUL FEATURES
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Your food, understood.
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Everything you need to understand your food and plan better
              meals in one place.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                  whileHover={{ y: -8 }}
                  className="group rounded-3xl border border-[#e3eee7] bg-[#f8fbf8] p-7 transition hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dff4e7] text-[#178456] transition group-hover:scale-110">
                    <Icon size={25} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {feature.description}
                  </p>

                  {/* Learn More now works */}
                  <Link
                    href={feature.href}
                    className="mt-6 flex w-fit items-center gap-2 text-sm font-semibold text-[#178456] transition hover:gap-3"
                  >
                    Learn more
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="bg-[#f7faf5] px-6 py-20 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-semibold text-[#22a06b]">
                HOW IT WORKS
              </p>

              <h2 className="mt-3 text-4xl font-black sm:text-5xl">
                From photo to food insights in seconds.
              </h2>

              <p className="mt-5 max-w-xl leading-8 text-slate-600">
                FoodLens combines image understanding, nutrition data
                and AI recommendations to make everyday food decisions
                simpler.
              </p>
            </div>

            <div className="space-y-4">
              {[
                [
                  "01",
                  "Snap or upload",
                  "Take a photo of your food or upload one.",
                ],
                [
                  "02",
                  "AI analyzes",
                  "Our AI identifies the visible ingredients.",
                ],
                [
                  "03",
                  "Understand",
                  "See nutrition insights and useful suggestions.",
                ],
                [
                  "04",
                  "Plan",
                  "Create recipes and a smart grocery list.",
                ],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="flex gap-5 rounded-3xl border border-[#e1ebe4] bg-white p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#12372a] text-sm font-bold text-white">
                    {number}
                  </div>

                  <div>
                    <h3 className="font-bold">{title}</h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-[#12372a] px-7 py-16 text-center text-white sm:px-12">
          <div className="mx-auto max-w-2xl">
            <p className="font-medium text-[#8ee0b0]">
              YOUR SMART FOOD COMPANION
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl">
              Ready to see what's on your plate?
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-[#d5e8dc]">
              Upload your first food image and discover a smarter way to
              understand nutrition.
            </p>

            {/* Start Analyzing now works */}
            <Link
              href="/analyze"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 font-bold text-[#12372a] transition hover:-translate-y-1 hover:shadow-xl"
            >
              Start Analyzing
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e3eee7] bg-white px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-[#12372a]"
          >
            <Leaf size={17} />
            FoodLens
          </Link>

          <p>AI Visual Nutrition & Grocery Assistant</p>

          <p>© 2026 FoodLens</p>
        </div>
      </footer>
    </main>
  );
}
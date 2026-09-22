"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      // Save authentication data
      localStorage.setItem("foodlens_token", data.token);
      localStorage.setItem(
        "foodlens_user",
        JSON.stringify(data.user)
      );

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (error) {
      console.error("Login error:", error);
      setError(
        "Unable to connect to server. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7faf5] text-[#12372a]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}
        <section className="relative hidden overflow-hidden bg-[#12372a] lg:flex">
          <div className="absolute inset-0">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#22a06b]/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#8fd694]/20 blur-3xl" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            
            <Link
              href="/"
              className="flex w-fit items-center gap-2 text-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22a06b]">
                <Leaf size={21} />
              </div>

              <span className="text-xl font-bold">
                FoodLens
              </span>
            </Link>

            <div className="max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#8fd694]">
                  Welcome Back
                </p>

                <h1 className="text-5xl font-bold leading-tight text-white xl:text-6xl">
                  Eat smarter.
                  <br />
                  Live better.
                </h1>

                <p className="mt-6 max-w-md text-lg leading-8 text-white/65">
                  Continue your personalized nutrition journey
                  with FoodLens AI.
                </p>
              </motion.div>
            </div>

            <p className="text-sm text-white/40">
              © 2026 FoodLens. Your food, understood.
            </p>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >

            {/* Mobile logo */}
            <Link
              href="/"
              className="mb-10 flex items-center gap-2 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#12372a] text-white">
                <Leaf size={21} />
              </div>

              <span className="text-xl font-bold">
                FoodLens
              </span>
            </Link>

            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#12372a]/60 transition hover:text-[#22a06b]"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <div className="mb-8">
              <h2 className="text-4xl font-bold tracking-tight">
                Welcome back
              </h2>

              <p className="mt-3 text-[#12372a]/60">
                Sign in to continue to your FoodLens dashboard.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 size={17} />
                {success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#12372a]/40"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#12372a]/10 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-[#22a06b] focus:ring-4 focus:ring-[#22a06b]/10"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#12372a]/40"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#12372a]/10 bg-white py-3.5 pl-11 pr-12 outline-none transition focus:border-[#22a06b] focus:ring-4 focus:ring-[#22a06b]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#12372a]/40 transition hover:text-[#22a06b]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#12372a] px-5 py-3.5 font-semibold text-white transition hover:bg-[#1c4d3a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#12372a]/60">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#22a06b] hover:underline"
              >
                Create account
              </Link>
            </p>

          </motion.div>
        </section>
      </div>
    </main>
  );
}
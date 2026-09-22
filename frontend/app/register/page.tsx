"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Leaf,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setSuccess("Account created successfully! Redirecting...");

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Register error:", error);

      setError(
        "Unable to connect to server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7faf5]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT SIDE */}
        <section className="relative hidden overflow-hidden bg-[#12372a] lg:flex">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#22a06b]/20 blur-3xl" />

          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#22a06b]/15 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 text-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22a06b]">
                <Leaf size={22} />
              </div>

              <span className="text-xl font-bold">FoodLens</span>
            </Link>

            <div className="max-w-xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#7ee2ae]">
                YOUR FOOD • YOUR DATA • YOUR INSIGHTS
              </p>

              <h1 className="text-5xl font-bold leading-tight text-white xl:text-6xl">
                Your plate.
                <br />
                <span className="text-[#62d997]">Your insights.</span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-[#b7d0c1]">
                Create your FoodLens account and start understanding what is
                really on your plate.
              </p>

              <div className="mt-10 flex items-center gap-4 text-6xl">
                <motion.span
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                  }}
                >
                  🥑
                </motion.span>

                <motion.span
                  animate={{ y: [0, 8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  🍅
                </motion.span>

                <motion.span
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                  }}
                >
                  🥗
                </motion.span>

                <motion.span
                  animate={{ y: [0, 7, 0] }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                  }}
                >
                  🥕
                </motion.span>
              </div>
            </div>

            <p className="text-xs text-[#7fa995]">
              AI-powered nutrition & grocery assistant
            </p>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Back */}
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#71857a] transition hover:text-[#12372a]"
            >
              <ArrowLeft size={17} />
              Back to home
            </Link>

            {/* Heading */}
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3f3e8] text-[#22a06b] lg:hidden">
                <Leaf size={23} />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-[#12372a]">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#71857a]">
                Start your smarter nutrition journey with FoodLens.
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
              >
                {error}
              </motion.div>
            )}

            {/* Success */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
              >
                <CheckCircle2 size={18} />
                {success}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#29483b]">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ca096]"
                  />

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-[#dce8df] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#a2afa8] focus:border-[#22a06b] focus:ring-4 focus:ring-[#22a06b]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#29483b]">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ca096]"
                  />

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-[#dce8df] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#a2afa8] focus:border-[#22a06b] focus:ring-4 focus:ring-[#22a06b]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#29483b]">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ca096]"
                  />

                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-[#dce8df] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#a2afa8] focus:border-[#22a06b] focus:ring-4 focus:ring-[#22a06b]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#12372a] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#12372a]/10 transition hover:-translate-y-0.5 hover:bg-[#194b39] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Login */}
            <p className="mt-7 text-center text-sm text-[#71857a]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#22a06b] hover:underline"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-8 text-center text-[11px] leading-5 text-[#9aaa9f]">
              By creating an account, you agree to use FoodLens responsibly
              for nutrition information.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
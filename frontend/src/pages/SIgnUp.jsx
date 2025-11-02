import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) setError(error.message);
    else setMessage("🎉 Check your email to confirm your account!");
  };

  const handleGoogleSignup = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });

    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0A0B1A] overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-100px] left-[-100px] h-[350px] w-[350px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-100px] h-[350px] w-[350px] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-10 shadow-xl backdrop-blur-lg transition-transform duration-300 hover:scale-[1.02]">
        <h2 className="mb-2 text-center text-3xl font-semibold text-white">
          Create Account
        </h2>
        <p className="mb-8 text-center text-gray-400 text-sm">
          Join and explore your new dashboard
        </p>

        <form onSubmit={handleSignup} className="flex flex-col space-y-5">
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#14162D]/70 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#14162D]/70 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Confirm Password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#14162D]/70 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 p-2 rounded-md">{error}</p>
          )}
          {message && (
            <p className="text-sm text-green-400 bg-green-900/20 p-2 rounded-md">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 py-3 font-medium text-white shadow-md hover:from-blue-500 hover:to-indigo-400 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center">
          <div className="h-px w-full bg-gray-700"></div>
          <span className="mx-2 text-gray-400 text-sm">OR</span>
          <div className="h-px w-full bg-gray-700"></div>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="mt-4 w-full flex items-center justify-center rounded-lg border border-gray-600 bg-[#14162D] py-3 font-medium text-white hover:bg-[#1F2344] disabled:opacity-50 transition"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="h-5 w-5 mr-2"
          />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
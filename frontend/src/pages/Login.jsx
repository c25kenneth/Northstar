import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) setError(error.message);
    else if (data.user) setMessage("✅ Successfully logged in!");
  };

  const handleGoogleLogin = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });

    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0A0B1A] overflow-hidden">
      {/* gradient lights */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-100px] left-[-100px] h-[350px] w-[350px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-100px] h-[350px] w-[350px] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      {/* login card */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-10 shadow-xl backdrop-blur-lg transition-transform duration-300 hover:scale-[1.02]">
        <h2 className="mb-2 text-center text-3xl font-semibold text-white">
          Welcome Back
        </h2>
        <p className="mb-8 text-center text-gray-400 text-sm">
          Sign in to continue to your dashboard
        </p>

        <form onSubmit={handleLogin} className="flex flex-col space-y-5">
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
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        {/* divider */}
        <div className="my-6 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gray-700"></div>
          <span className="text-gray-400 text-sm">OR</span>
          <div className="h-px flex-1 bg-gray-700"></div>
        </div>

        {/* Google sign in */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#14162D]/70 py-3 font-medium text-white hover:bg-[#1F2344] transition disabled:opacity-50"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="h-5 w-5"
          />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import darkWordmark from "../assets/Dark Mode Wordmark.png";
import exampleVideo from "../assets/example.mp4";


export default function Landing() {
  const faqs = [
    {
      question: "What is Northstar?",
      answer:
        "Northstar is an AI teammate that continuously analyzes your codebase and product performance, then recommends code changes that improve your key metrics — like conversion rate, retention, or revenue.",
    },
    {
      question: "How does it connect to my codebase?",
      answer:
        "You connect your GitHub repository securely. Northstar reads your code (without making changes) to understand product flows, and can optionally open pull requests for you to review and merge.",
    },
    {
      question: "Which metrics can Northstar optimize?",
      answer:
        "You choose your north star metric — such as sign-ups, engagement, or churn rate. Northstar focuses its analysis and recommendations on improving that metric over time.",
    },
    {
      question: "Is my code data private?",
      answer:
        "Yes. Your code never leaves your private workspace. Northstar runs in a secure environment and only stores metadata needed for recommendations.",
    },
    {
      question: "When will early access launch?",
      answer:
        "We’re onboarding early access teams on a rolling basis this quarter. Join the waitlist to reserve your spot.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-hidden bg-[#0f172a] text-white">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0f172a] opacity-90" />

      <main className="relative z-10 flex flex-col items-center gap-20 px-6 py-24 max-w-6xl w-full">
        {/* Logo */}
        <div className="h-auto w-full max-w-md">
          <img src={darkWordmark} alt="Logo" className="h-auto w-full" />
        </div>

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-6">
          <h1
            className="text-4xl md:text-5xl font-light leading-snug text-gray-100"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            What if your product could <span className="text-white font-normal">improve itself?</span>
          </h1>
          <p className="max-w-2xl text-lg text-gray-400 font-light">
            Northstar monitors your metrics and recommends AI-driven code changes
            that directly improve performance — conversion rate, retention, or revenue.
          </p>
          <a
            href="https://tally.so/r/worWMX"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-white px-10 py-4 text-lg font-medium text-black hover:bg-gray-100 transition mt-4"
          >
            Join Early Access →
          </a>
        </section>

        {/* Demo Video */}
        <section className="w-full max-w-4xl">
          <div
            className="aspect-video w-full overflow-hidden border border-gray-800 bg-gray-900"
            style={{
              borderRadius: "24px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            <video
              className="h-full w-full object-cover"
              controls
              src={exampleVideo}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </section>

        {/* What It Does */}
        <section className="max-w-3xl text-center text-gray-300 text-lg leading-relaxed font-light">
          Northstar helps teams continuously improve their key metrics — conversion
          rate, retention, and revenue — by analyzing your codebase and generating
          targeted improvement suggestions.  
          Think of it as your AI growth engineer, always on.
        </section>

        {/* How It Works */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center w-full max-w-5xl mt-6">
          <div className="flex flex-col items-center gap-3 px-4">
            <div className="text-2xl font-medium text-white">1. Connect Your Repo</div>
            <div className="text-gray-400 text-base leading-relaxed">
              Northstar syncs with your codebase and tracks the metric you care about most.
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 px-4">
            <div className="text-2xl font-medium text-white">2. Analyze Performance</div>
            <div className="text-gray-400 text-base leading-relaxed">
              It maps which parts of your product drive your key results — and which hold you back.
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 px-4">
            <div className="text-2xl font-medium text-white">3. Suggest Code Changes</div>
            <div className="text-gray-400 text-base leading-relaxed">
              Northstar generates pull requests with data-backed improvements you can merge directly.
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="flex flex-col items-center gap-10 mt-10">
          <h2 className="text-3xl font-medium text-white">Why Teams Love Northstar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl">
            <div className="flex flex-col items-center gap-2">
              <div className="text-lg font-semibold text-white">Metric-Aware AI</div>
              <p className="text-gray-400 text-sm">
                Every recommendation is grounded in improving your chosen north star metric.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-lg font-semibold text-white">Code-Level Insights</div>
              <p className="text-gray-400 text-sm">
                Understand how each code change impacts user behavior and business outcomes.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-lg font-semibold text-white">Automatic PRs</div>
              <p className="text-gray-400 text-sm">
                Northstar opens ready-to-merge pull requests with concrete improvements.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full max-w-3xl mt-20">
          <h2 className="text-3xl font-medium text-center mb-8">FAQs</h2>
          <div className="divide-y divide-gray-800">
            {faqs.map((faq, index) => (
              <div key={index} className="py-4">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <span className="text-lg text-gray-200 font-medium">
                    {faq.question}
                  </span>
                  <span className="text-gray-400 text-xl">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="mt-3 text-gray-400 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="flex flex-col items-center text-center mt-12">
          <h3 className="text-2xl font-light text-gray-100">
            Your product’s next growth engineer is AI.
          </h3>
          <a
            href="https://tally.so/r/worWMX"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-white px-10 py-4 text-lg font-medium text-black hover:bg-gray-100 transition mt-6"
          >
            Join Early Access →
          </a>
        </section>
      </main>

    </div>
  );
}

import darkWordmark from "../assets/Dark Mode Wordmark.png";

export default function Landing() {

  return (
    <div className="h-screen bg-gradient-to-r from-[#4C6FFF] via-[#A5B4FC] to-[#4C6FFF] text-white snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
      {/* Hero Section - Full Screen */}
      <div className="h-[calc(100vh-1rem)] flex items-center justify-center px-6 snap-start snap-always bg-[#0f172a] rounded-b-[2rem] mb-4">
        <div className="max-w-3xl w-full text-center">
          {/* Logo */}
          <div className="mb-12">
            <img src={darkWordmark} alt="Northstar" className="h-12 mx-auto" />
          </div>

          {/* Hero */}
          <div>
            <h1 className="text-5xl font-semibold mb-6">
            The AI teammate that proposes and ships A/B tests automatically.
            </h1>
            <p className="text-xl text-gray-400 mb-10">
            Northstar monitors your metrics, finds high-impact opportunities, and opens GitHub PRs with real experiment code that’s ready to run and measure.
            </p>

            <div className="flex gap-4 justify-center">
              <a
                href="https://tally.so/r/worWMX"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-white text-black rounded-md hover:bg-gray-100"
              >
                Join Early Access
              </a>
              <a
                href="https://cal.com/your-cal-link"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 border border-gray-600 rounded-md hover:border-gray-500"
              >
                See It in Action
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-[#E5E7EB] text-gray-900 snap-start min-h-screen flex items-center">
        <main className="max-w-3xl mx-auto px-6 py-16 w-full">

          {/* How It Works */}
          <div className="mb-20">
            <h2 className="text-2xl font-semibold mb-10">How it works</h2>
            <div className="space-y-6">
              <div>
                <div className="font-semibold mb-1">Connect PostHog + GitHub</div>
                <p className="text-gray-600">
                  Northstar reads your analytics and codebase to understand what matters.
                </p>
              </div>
              <div>
                <div className="font-semibold mb-1">Get experiment proposals in Slack</div>
                <p className="text-gray-600">
                  Ask "How can we improve signup?" and get A/B test proposals with hypothesis and estimated impact.
                </p>
              </div>
              <div>
                <div className="font-semibold mb-1">Approve, ship, and track</div>
                <p className="text-gray-600">
                  Approve in Slack. Northstar opens a PR with the experiment code and tracking. Results come back automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="mb-20">
            <h2 className="text-2xl font-semibold mb-8">Questions</h2>
            <div className="space-y-6">
              <div>
                <div className="font-semibold mb-1">How does it integrate?</div>
                <p className="text-gray-600 text-sm">
                  PostHog for analytics, GitHub for code, Slack for communication. Works with your existing setup.
                </p>
              </div>
              <div>
                <div className="font-semibold mb-1">Is my data private?</div>
                <p className="text-gray-600 text-sm">
                  Yes. Your code and analytics stay in your workspace. We only see metadata needed for recommendations.
                </p>
              </div>
              <div>
                <div className="font-semibold mb-1">When can I try it?</div>
                <p className="text-gray-600 text-sm">
                  We're onboarding early access teams now. Join the waitlist above.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            Questions?{" "}
            <a
              href="mailto:bordo@wharton.upenn.edu?subject=Northstar"
              className="underline hover:text-gray-700"
            >
              Email us
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}

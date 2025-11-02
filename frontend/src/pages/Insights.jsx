import { motion } from 'framer-motion';

const Insights = () => {
  const insights = [
    {
      id: 1,
      title: 'Accessibility Improvements',
      message: 'Accessibility improvements deprioritized after user feedback indicated no significant impact on conversion.',
      date: '2 days ago',
      category: 'learned',
    },
    {
      id: 2,
      title: 'Dark Mode Impact',
      message: 'Dark mode increased retention among Gen Z users by 15% during evening hours.',
      date: '5 days ago',
      category: 'discovery',
    },
    {
      id: 3,
      title: 'Checkout Load Time',
      message: 'Checkout load time strongly correlates with conversion - each 100ms improvement leads to +0.1% conversion.',
      date: '1 week ago',
      category: 'correlation',
    },
    {
      id: 4,
      title: 'Form Field Reduction',
      message: 'Reducing checkout form fields below 5 fields shows diminishing returns - optimal is 4-5 fields.',
      date: '2 weeks ago',
      category: 'optimization',
    },
    {
      id: 5,
      title: 'Trust Badges Placement',
      message: 'Trust badges placed above checkout button perform 30% better than below the button.',
      date: '3 weeks ago',
      category: 'placement',
    },
    {
      id: 6,
      title: 'Mobile vs Desktop',
      message: 'Mobile users show 2x sensitivity to checkout complexity compared to desktop users.',
      date: '1 month ago',
      category: 'segment',
    },
  ];

  const categoryColors = {
    learned: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
    discovery: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
    correlation: 'bg-green-400/10 text-green-400 border-green-400/30',
    optimization: 'bg-purple-400/10 text-purple-400 border-purple-400/30',
    placement: 'bg-pink-400/10 text-pink-400 border-pink-400/30',
    segment: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30',
  };

  return (
    <div className="min-h-screen bg-[#0A0B1A]">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-100px] left-[-100px] h-[350px] w-[350px] rounded-full bg-[#5AB9EA]/10 blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-100px] h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Insights</h1>
          <p className="mt-2 text-gray-400">What Northstar has learned over time</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-white/10 bg-[#1A1D3A]/60 p-6 backdrop-blur-sm transition-all hover:border-[#5AB9EA]/50 hover:shadow-lg hover:shadow-[#5AB9EA]/10"
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`rounded-full border px-2 py-1 text-xs font-medium ${categoryColors[insight.category] || categoryColors.learned}`}
                >
                  {insight.category}
                </span>
                <span className="text-xs text-gray-500">{insight.date}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{insight.title}</h3>
              <p className="text-sm leading-relaxed text-gray-300">{insight.message}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Insights;


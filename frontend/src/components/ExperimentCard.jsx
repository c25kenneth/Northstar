import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ExperimentCard = ({ id, title, status, result, description }) => {
  const statusConfig = {
    completed: { icon: '✅', color: 'text-green-400', bg: 'bg-green-400/10' },
    running: { icon: '⏳', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    rejected: { icon: '❌', color: 'text-red-400', bg: 'bg-red-400/10' },
  };

  const config = statusConfig[status] || statusConfig.running;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/10 bg-[#1A1D3A]/60 p-6 backdrop-blur-sm transition-all hover:border-[#5AB9EA]/50 hover:shadow-lg hover:shadow-[#5AB9EA]/10"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${config.color} ${config.bg}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Result</span>
          <p className="text-sm font-medium text-green-400">{result}</p>
        </div>
      </div>

      <Link
        to={`/experiments/${id}`}
        className="block w-full rounded-xl bg-[#5AB9EA]/10 px-4 py-2 text-center text-sm font-medium text-[#5AB9EA] transition-colors hover:bg-[#5AB9EA]/20"
      >
        View Details
      </Link>
    </motion.div>
  );
};

export default ExperimentCard;


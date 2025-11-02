import { motion } from 'framer-motion';

const LogFeed = ({ logs }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/10 bg-[#1A1D3A]/60 p-6 backdrop-blur-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-white">Activity Log</h2>
      
      <div className="space-y-4">
        {logs.map((log, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex items-start gap-3 border-l-2 border-[#5AB9EA]/30 pl-4"
          >
            <div className="mt-1 h-2 w-2 rounded-full bg-[#5AB9EA]"></div>
            <div className="flex-1">
              <p className="text-sm text-white">{log.message}</p>
              <p className="mt-1 text-xs text-gray-400">{log.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default LogFeed;


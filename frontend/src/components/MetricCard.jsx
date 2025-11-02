import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const MetricCard = ({ title, value, change, trend, goal, running }) => {
  const mockData = [
    { day: 'Mon', value: 2.1 },
    { day: 'Tue', value: 2.15 },
    { day: 'Wed', value: 2.2 },
    { day: 'Thu', value: 2.25 },
    { day: 'Fri', value: 2.3 },
    { day: 'Sat', value: 2.35 },
    { day: 'Sun', value: 2.4 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/10 bg-[#1A1D3A]/60 p-6 backdrop-blur-sm"
    >
      <h2 className="mb-4 text-sm font-medium text-gray-400">{title}</h2>
      
      <div className="mb-4 flex items-baseline gap-2">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-4xl font-bold text-white"
        >
          {value}
        </motion.div>
        <span className={`text-lg font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      </div>

      <div className="mb-4 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <XAxis dataKey="day" stroke="#6B7280" fontSize={10} />
            <YAxis stroke="#6B7280" fontSize={10} domain={[2.0, 2.5]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1A1D3A', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#5AB9EA" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          Goal: <span className="text-white font-medium">{goal}</span>
        </span>
        <span className="text-gray-400">
          {running} {running === 1 ? 'experiment' : 'experiments'} running
        </span>
      </div>
    </motion.div>
  );
};

export default MetricCard;


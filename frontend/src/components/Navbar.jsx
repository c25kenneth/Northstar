import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/insights', label: 'Insights' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="border-b border-white/10 bg-[#1A1D3A]/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5AB9EA] to-blue-600">
              <span className="text-xl font-bold text-white">★</span>
            </div>
            <span className="text-xl font-semibold text-white">Northstar</span>
          </Link>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-white"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-[#5AB9EA]/20"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


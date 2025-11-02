import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import ExperimentCard from '../components/ExperimentCard';
import LogFeed from '../components/LogFeed';
import { proposalsAPI, experimentsAPI, activityLogsAPI, repositoriesAPI } from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [rawExperiments, setRawExperiments] = useState([]); // Store raw experiment data
  const [experiments, setExperiments] = useState([]); // Displayed experiments
  const [activityLogs, setActivityLogs] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null); // null = all repos
  const [loading, setLoading] = useState(true);
  const [experimentsByRepo, setExperimentsByRepo] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // When repositories, proposals, or selected repo changes, reorganize by repo
    organizeByRepository();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposals, rawExperiments, repositories, selectedRepo]);

  const organizeByRepository = () => {
    // Group proposals/experiments by repository
    const grouped = {};
    const repoMap = {};
    
    // Create a map of repo_id to repo info
    repositories.forEach(repo => {
      repoMap[repo.id] = repo;
      if (!grouped[repo.id]) {
        grouped[repo.id] = {
          repo: repo,
          proposals: [],
          experiments: []
        };
      }
    });
    
    // Add "unassigned" group for proposals without repo_id
    grouped['unassigned'] = {
      repo: { repo_fullname: 'Unassigned', owner: '', repo_name: 'Unassigned' },
      proposals: [],
      experiments: []
    };
    
    // Group proposals by repo_id
    proposals.forEach(p => {
      const repoId = p.repo_id || 'unassigned';
      if (!grouped[repoId]) {
        grouped[repoId] = {
          repo: repoMap[repoId] || { repo_fullname: 'Unknown', owner: '', repo_name: 'Unknown' },
          proposals: [],
          experiments: []
        };
      }
      grouped[repoId].proposals.push({
        id: p.proposal_id,
        title: p.idea_summary,
        status: p.status,
        result: p.status === 'completed' 
          ? `${(p.expected_impact?.delta_pct || 0) * 100}% improvement`
          : p.status === 'rejected' 
          ? 'Rejected'
          : p.status === 'approved'
          ? 'Approved'
          : 'Pending',
        description: p.rationale || '',
        proposal_id: p.proposal_id,
      });
    });
    
    // Group experiments by proposal's repo_id
    rawExperiments.forEach(e => {
      // Find the proposal for this experiment
      const proposal = proposals.find(p => p.proposal_id === e.proposal_id);
      const repoId = proposal?.repo_id || 'unassigned';
      if (!grouped[repoId]) {
        grouped[repoId] = {
          repo: { repo_fullname: 'Unknown', owner: '', repo_name: 'Unknown' },
          proposals: [],
          experiments: []
        };
      }
      grouped[repoId].experiments.push({
        id: e.id || e.proposal_id,
        title: e.instruction || 'Experiment',
        status: e.status === 'running' ? 'running' : e.status === 'completed' ? 'completed' : 'running',
        result: e.pr_url 
          ? `PR: ${e.pr_url.split('/').pop()}`
          : 'In progress...',
        description: e.instruction || '',
        proposal_id: e.proposal_id,
      });
    });
    
    setExperimentsByRepo(grouped);
    
    // Update experiments list based on selected repo
    if (selectedRepo === null) {
      // Show all experiments
      setExperiments(Object.values(grouped).flatMap(group => [...group.proposals, ...group.experiments]));
    } else {
      // Show only selected repo's experiments
      const selectedGroup = grouped[selectedRepo] || { proposals: [], experiments: [] };
      setExperiments([...selectedGroup.proposals, ...selectedGroup.experiments]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load repositories first
      const reposResult = await repositoriesAPI.list();
      setRepositories(reposResult.repositories || []);
      
      // Load proposals and experiments
      const [proposalsResult, experimentsResult, logsResult] = await Promise.all([
        proposalsAPI.list(),
        experimentsAPI.list(),
        activityLogsAPI.list(10),
      ]);

      // Store raw proposals for organization
      setProposals(proposalsResult.proposals);
      
      // Store raw experiments - will be organized by organizeByRepository useEffect
      setRawExperiments(experimentsResult.experiments);
      
      // Format activity logs
      const formattedLogs = logsResult.logs.map(log => {
        const date = new Date(log.created_at);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        let timestamp;
        if (diffMins < 1) timestamp = 'Just now';
        else if (diffMins < 60) timestamp = `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        else if (diffHours < 24) timestamp = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        else timestamp = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;

        return {
          message: log.message,
          timestamp,
        };
      });

      setActivityLogs(formattedLogs);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Keep empty arrays on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B1A]">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-100px] left-[-100px] h-[350px] w-[350px] rounded-full bg-[#5AB9EA]/10 blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-100px] h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-gray-400">Monitor your north star metric and active experiments</p>
        </motion.div>

        {/* Hero Metric Panel */}
        <div className="mb-8">
          <MetricCard
            title="Checkout Conversion"
            value="2.4%"
            change={0.3}
            goal="3.0%"
            running={2}
          />
        </div>

        {/* Repository Filter */}
        {repositories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-white/10 bg-[#1A1D3A]/60 p-4 backdrop-blur-sm"
          >
            <label className="mb-2 block text-sm font-medium text-gray-300">Filter by Repository</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRepo(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedRepo === null
                    ? 'bg-[#5AB9EA] text-white'
                    : 'bg-[#0A0B1A] text-gray-300 border border-white/10 hover:border-[#5AB9EA]'
                }`}
              >
                All Repositories
              </button>
              {repositories.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedRepo === repo.id
                      ? 'bg-[#5AB9EA] text-white'
                      : 'bg-[#0A0B1A] text-gray-300 border border-white/10 hover:border-[#5AB9EA]'
                  }`}
                >
                  {repo.repo_fullname}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Experiments Feed */}
          <div className="lg:col-span-2">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 text-xl font-semibold text-white"
            >
              {selectedRepo ? `Experiments - ${repositories.find(r => r.id === selectedRepo)?.repo_fullname || 'Unknown'}` : 'Recent Experiments'}
            </motion.h2>
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading...</div>
            ) : experiments.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                {selectedRepo 
                  ? `No experiments for this repository. Trigger one from Settings!`
                  : 'No experiments yet. Trigger one from Settings!'}
              </div>
            ) : (
              <>
                {/* Group by repository if showing all */}
                {selectedRepo === null && Object.keys(experimentsByRepo).length > 0 ? (
                  Object.entries(experimentsByRepo).map(([repoId, group]) => {
                    if (group.proposals.length === 0 && group.experiments.length === 0) return null;
                    return (
                      <div key={repoId} className="mb-6">
                        <motion.h3
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mb-3 text-lg font-semibold text-white flex items-center gap-2"
                        >
                          <span className="text-[#5AB9EA]">📁</span>
                          {group.repo.repo_fullname || 'Unassigned'}
                        </motion.h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {[...group.proposals, ...group.experiments].map((experiment, index) => (
                            <motion.div
                              key={experiment.id || index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.05 * index }}
                              onClick={() => {
                                if (experiment.proposal_id) {
                                  navigate(`/experiments/${experiment.proposal_id}`);
                                }
                              }}
                              className="cursor-pointer"
                            >
                              <ExperimentCard {...experiment} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {experiments.map((experiment, index) => (
                      <motion.div
                        key={experiment.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => {
                          if (experiment.proposal_id) {
                            navigate(`/experiments/${experiment.proposal_id}`);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <ExperimentCard {...experiment} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Activity Log */}
          <div className="lg:col-span-1">
            <LogFeed logs={activityLogs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


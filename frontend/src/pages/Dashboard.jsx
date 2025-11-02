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
  const [loading, setLoading] = useState(false);

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
      // Handle both string UUIDs and object repo_id references
      const repoId = p.repo_id ? (typeof p.repo_id === 'string' ? p.repo_id : p.repo_id) : 'unassigned';
      if (!grouped[repoId]) {
        // Try to get repo info from the proposal if it includes repository data from join
        const repoInfo = p.repositories || (repoMap[repoId] ? { repo_fullname: repoMap[repoId].repo_fullname, owner: repoMap[repoId].owner, repo_name: repoMap[repoId].repo_name } : null);
        grouped[repoId] = {
          repo: repoInfo || repoMap[repoId] || { repo_fullname: 'Unassigned', owner: '', repo_name: 'Unassigned' },
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
          : p.status === 'executing'
          ? 'Executing'
          : 'Pending',
        description: p.rationale || '',
        proposal_id: p.proposal_id,
      });
    });
    
    // Group experiments by proposal's repo_id
    rawExperiments.forEach(e => {
      // Find the proposal for this experiment
      const proposal = proposals.find(p => p.proposal_id === e.proposal_id);
      const repoId = proposal?.repo_id ? (typeof proposal.repo_id === 'string' ? proposal.repo_id : proposal.repo_id) : 'unassigned';
      if (!grouped[repoId]) {
        const repoInfo = proposal?.repositories || repoMap[repoId];
        grouped[repoId] = {
          repo: repoInfo || { repo_fullname: 'Unassigned', owner: '', repo_name: 'Unassigned' },
          proposals: [],
          experiments: []
        };
      }
      
      // Format result text based on status
      let resultText = 'In progress...';
      if (e.status === 'completed') {
        if (e.metric_delta !== null && e.metric_delta !== undefined) {
          resultText = `${e.metric_delta > 0 ? '+' : ''}${(e.metric_delta * 100).toFixed(2)}%`;
        } else if (e.result_summary) {
          resultText = e.result_summary;
        } else {
          resultText = 'Completed';
        }
      } else if (e.status === 'failed') {
        resultText = 'Failed';
      } else if (e.status === 'cancelled') {
        resultText = 'Cancelled';
      } else if (e.pr_url) {
        resultText = `PR: ${e.pr_url.split('/').pop()}`;
      }
      
      grouped[repoId].experiments.push({
        id: e.id || e.proposal_id,
        title: e.instruction || 'Experiment',
        status: e.status || 'running',
        result: resultText,
        description: e.instruction || '',
        proposal_id: e.proposal_id,
      });
    });

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

      // Store raw proposals for organization (handle both array and object response formats)
      const proposalsList = Array.isArray(proposalsResult.proposals) 
        ? proposalsResult.proposals 
        : proposalsResult.proposals || [];
      setProposals(proposalsList);
      
      // Store raw experiments - will be organized by organizeByRepository useEffect
      const experimentsList = Array.isArray(experimentsResult.experiments)
        ? experimentsResult.experiments
        : experimentsResult.experiments || [];
      setRawExperiments(experimentsList);
      
      // Format activity logs
      let formattedLogs = [];
      const logsList = Array.isArray(logsResult.logs) ? logsResult.logs : (logsResult.logs || []);

      if (logsList.length > 0) {
        formattedLogs = logsList.map(log => {
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
      }

      setActivityLogs(formattedLogs);
    } catch (error) {
      console.error('Failed to load data:', error);
      // On error, keep empty arrays (no demo data)
      setProposals([]);
      setRawExperiments([]);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
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
          <div className="mb-6 rounded border border-gray-800 bg-gray-900 p-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">Filter by Repository</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRepo(null)}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  selectedRepo === null
                    ? 'bg-white text-black hover:bg-gray-100'
                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600'
                }`}
              >
                All Repositories
              </button>
              {repositories.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo.id)}
                  className={`px-4 py-2 rounded text-sm font-medium transition ${
                    selectedRepo === repo.id
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {repo.repo_fullname}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Experiments Feed */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading...</div>
            ) : experiments.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                {selectedRepo 
                  ? `No experiments for this repository. Trigger one from Settings!`
                  : 'No experiments yet. Trigger one from Settings!'}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {experiments.map((experiment, index) => (
                  <div
                    key={experiment.id || index}
                    onClick={() => {
                      if (experiment.proposal_id) {
                        navigate(`/experiments/${experiment.proposal_id}`);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <ExperimentCard {...experiment} />
                  </div>
                ))}
              </div>
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


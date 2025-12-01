import React, { useEffect, useState } from 'react';
import pytron from 'pytron-client';
import { Cpu, HardDrive, Activity, Zap } from 'lucide-react';
import StatCard from './StatCard';
import ProcessList from './ProcessList';

const Dashboard = () => {
  const [stats, setStats] = useState({
    cpu: 0,
    memory: { percent: 0, used: 0, total: 0 },
    disk: { percent: 0 },
    gpu: { percent: 0, name: 'N/A' }
  });
  const [processes, setProcesses] = useState([]);
  const [sortBy, setSortBy] = useState('cpu');
  
  // History for graphs
  const [cpuHistory, setCpuHistory] = useState(Array(20).fill({ value: 0 }));
  const [memHistory, setMemHistory] = useState(Array(20).fill({ value: 0 }));
  const [diskHistory, setDiskHistory] = useState(Array(20).fill({ value: 0 }));
  const [gpuHistory, setGpuHistory] = useState(Array(20).fill({ value: 0 }));

  const fetchData = async () => {
    try {
      // Fetch system stats
      const sysStats = await pytron.get_system_stats();
      setStats(sysStats);

      // Update history
      setCpuHistory(prev => [...prev.slice(1), { value: sysStats.cpu }]);
      setMemHistory(prev => [...prev.slice(1), { value: sysStats.memory.percent }]);
      setDiskHistory(prev => [...prev.slice(1), { value: sysStats.disk.percent }]);
      setGpuHistory(prev => [...prev.slice(1), { value: sysStats.gpu?.percent || 0 }]);

      // Fetch processes with sort
      const procs = await pytron.get_processes(sortBy);
      setProcesses(procs);

    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [sortBy]); // Re-fetch when sort changes

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6" style={{ padding: '24px', height: 'calc(100vh - 32px)', overflow: 'hidden' }}>
      
      {/* Top Row: Stats */}
      <div className="flex gap-4 w-full">
        <StatCard 
          title="CPU Usage" 
          value={`${stats.cpu}%`} 
          subtext="System Load" 
          color="var(--accent-blue)" 
          data={cpuHistory}
          icon={Cpu}
          onClick={() => setSortBy('cpu')}
          isActive={sortBy === 'cpu'}
        />
        <StatCard 
          title="Memory" 
          value={`${stats.memory.percent}%`} 
          subtext={`Used: ${formatBytes(stats.memory.used)} / ${formatBytes(stats.memory.total)}`} 
          color="var(--accent-green)" 
          data={memHistory}
          icon={Zap}
          onClick={() => setSortBy('memory')}
          isActive={sortBy === 'memory'}
        />
        <StatCard 
          title="Disk I/O" 
          value={`${stats.disk.percent}%`} 
          subtext="Primary Drive" 
          color="var(--accent-orange)" 
          data={diskHistory}
          icon={HardDrive}
          onClick={() => setSortBy('disk')}
          isActive={sortBy === 'disk'}
        />
        <StatCard 
          title="GPU Usage" 
          value={`${stats.gpu?.percent || 0}%`} 
          subtext={stats.gpu?.name || "Not Available"} 
          color="var(--accent-purple)" 
          data={gpuHistory}
          icon={Activity}
          onClick={() => setSortBy('gpu')}
          isActive={sortBy === 'gpu'}
        />
      </div>

      {/* Bottom Row: Processes */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ProcessList processes={processes} onRefresh={fetchData} />
      </div>

    </div>
  );
};

export default Dashboard;

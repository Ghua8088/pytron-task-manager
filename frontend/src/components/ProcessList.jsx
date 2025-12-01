import React from 'react';
import pytron from 'pytron-client';

const ProcessList = ({ processes, onRefresh }) => {
  const handleTerminate = async (pid) => {
    try {
      const result = await pytron.terminate_process(pid);
      if (result.success) {
        onRefresh(); // Refresh list immediately
      } else {
        console.error("Failed to terminate:", result.message);
        // Ideally show a toast notification here
      }
    } catch (err) {
      console.error("Error calling backend:", err);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <h2 className="font-bold text-lg">Active Processes</h2>
        <button className="btn" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'white' }} onClick={onRefresh}>
          Refresh
        </button>
      </div>
      
      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 1fr 100px', padding: '12px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
          <div>PID</div>
          <div>Name</div>
          <div style={{ textAlign: 'right' }}>CPU</div>
          <div style={{ textAlign: 'right' }}>Mem</div>
          <div style={{ textAlign: 'right' }}>Disk (I/O)</div>
          <div style={{ textAlign: 'right' }}>GPU Mem</div>
          <div style={{ textAlign: 'center' }}>Actions</div>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {processes.map((proc) => (
            <div key={proc.pid} style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 1fr 100px', padding: '10px 20px', borderBottom: '1px solid var(--border-color)', alignItems: 'center', fontSize: '0.9rem' }} className="process-row">
              <div className="text-secondary">{proc.pid}</div>
              <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={proc.name}>{proc.name}</div>
              <div style={{ textAlign: 'right', color: 'var(--accent-blue)' }}>{proc.cpu_percent?.toFixed(1)}%</div>
              <div style={{ textAlign: 'right', color: 'var(--accent-green)' }}>{proc.memory_percent?.toFixed(1)}%</div>
              <div style={{ textAlign: 'right', color: 'var(--accent-orange)' }}>{formatBytes(proc.disk_io)}/s</div>
              <div style={{ textAlign: 'right', color: 'var(--accent-purple)' }}>{proc.gpu_memory ? proc.gpu_memory.toFixed(0) + ' MB' : '-'}</div>
              <div style={{ textAlign: 'center' }}>
                <button 
                  className="btn-danger text-xs" 
                  style={{ padding: '4px 8px' }}
                  onClick={() => handleTerminate(proc.pid)}
                >
                  Terminate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .process-row:hover {
          background-color: rgba(255, 255, 255, 0.03);
        }
      `}</style>
    </div>
  );
};

export default ProcessList;

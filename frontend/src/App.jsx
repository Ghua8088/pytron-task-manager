import React from 'react';
import TitleBar from './components/TitleBar';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-primary text-primary">
      <TitleBar />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Dashboard />
      </div>
    </div>
  );
}

export default App;

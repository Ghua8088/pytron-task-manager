import React from 'react';
import pytron from 'pytron-client';
import { Minus, Square, X } from 'lucide-react';

const TitleBar = () => {
  return (
    <div style={{
      height: '32px',
      background: 'var(--bg-primary)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      userSelect: 'none',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div 
        className="drag-region" 
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '16px',
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          WebkitAppRegion: 'drag' // This makes the window draggable
        }}
      >
        PYTRON SYSTEM MONITOR
      </div>
      <div style={{ display: 'flex', height: '100%' }}>
        <button 
          onClick={() => pytron.minimize()}
          style={btnStyle}
        >
          <Minus size={14} />
        </button>
        <button 
          onClick={() => pytron.toggle_fullscreen()} // Or maximize/restore logic
          style={btnStyle}
        >
          <Square size={12} />
        </button>
        <button 
          onClick={() => pytron.destroy()}
          style={{...btnStyle, ':hover': { backgroundColor: 'red' }}}
          className="close-btn"
        >
          <X size={14} />
        </button>
      </div>
      <style>{`
        .close-btn:hover {
          background-color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
};

const btnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  width: '46px',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

export default TitleBar;

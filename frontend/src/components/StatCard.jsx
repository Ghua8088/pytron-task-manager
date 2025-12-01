import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, subtext, color, data, icon: Icon, onClick, isActive }) => {
  return (
    <div 
      className="card" 
      onClick={onClick}
      style={{ 
        flex: 1, 
        minWidth: '200px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        height: '160px', 
        position: 'relative', 
        overflow: 'hidden',
        cursor: 'pointer',
        border: isActive ? `1px solid ${color}` : '1px solid var(--border-color)',
        transition: 'border-color 0.2s'
      }}
    >
      <div className="flex justify-between items-start" style={{ zIndex: 2 }}>
        <div>
          <h3 className="text-secondary text-sm font-bold" style={{ margin: 0, marginBottom: '8px' }}>{title}</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: 1 }}>{value}</div>
          <div className="text-secondary text-xs" style={{ marginTop: '4px' }}>{subtext}</div>
        </div>
        {Icon && <Icon size={20} color={isActive ? color : "var(--text-secondary)"} />}
      </div>
      
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', zIndex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#color${title})`} 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatCard;

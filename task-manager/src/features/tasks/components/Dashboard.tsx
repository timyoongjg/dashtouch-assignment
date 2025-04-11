import React from 'react';
import { useAppSelector, useAppDispatch } from '../../../hooks';
import { 
  selectTaskStatistics, 
  categoryColors, 
  priorityIndicators,
  TaskCategory,
  TaskPriority,
  resetToSampleData
} from '../tasksSlice';

interface StatItemProps {
  label: string;
  value: number | string;
  color?: string;
  icon?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, color, icon }) => (
  <div style={statItemStyle}>
    <div style={statValueStyle}>
      {icon && <span style={{ marginRight: '5px' }}>{icon}</span>}
      <span style={{ color: color || 'inherit' }}>{value}</span>
    </div>
    <div style={statLabelStyle}>{label}</div>
  </div>
);

const Dashboard: React.FC = () => {
  const stats = useAppSelector(selectTaskStatistics);
  const dispatch = useAppDispatch();
  
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to sample data? This will delete all your tasks.')) {
      dispatch(resetToSampleData());
    }
  };
  
  return (
    <div style={dashboardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Dashboard</h2>
        <button 
          onClick={handleReset}
          style={{ 
            padding: '8px 12px',
            backgroundColor: 'var(--danger-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset to Sample Data
        </button>
      </div>
      
      {/* Task overview */}
      <div style={sectionStyle}>
        <h3>Task Overview</h3>
        <div style={statGridStyle}>
          <StatItem 
            label="Total Tasks" 
            value={stats.totalTasks}
            color="#3498db"
          />
          <StatItem 
            label="Pending" 
            value={stats.pendingTasks}
            color="orange"
          />
          <StatItem 
            label="Completed" 
            value={stats.completedTasks}
            color="green"
          />
          <StatItem 
            label="Completion Rate" 
            value={`${stats.completionRate}%`}
            color={stats.completionRate > 50 ? 'green' : 'orange'}
          />
        </div>
      </div>
      
      {/* Task status */}
      <div style={sectionStyle}>
        <h3>Task Status</h3>
        <div style={chartContainerStyle}>
          <div style={progressBarContainerStyle}>
            <div 
              style={{
                ...progressBarStyle,
                width: `${stats.completionRate}%`,
                backgroundColor: 'green'
              }}
            ></div>
            <div 
              style={{
                ...progressBarStyle,
                width: `${100 - stats.completionRate}%`,
                backgroundColor: 'orange'
              }}
            ></div>
          </div>
          <div style={chartLegendStyle}>
            <div style={legendItemStyle}>
              <div style={{ ...legendColorStyle, backgroundColor: 'green' }}></div>
              <span>Completed ({stats.completedTasks})</span>
            </div>
            <div style={legendItemStyle}>
              <div style={{ ...legendColorStyle, backgroundColor: 'orange' }}></div>
              <span>Pending ({stats.pendingTasks})</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Deadlines */}
      <div style={sectionStyle}>
        <h3>Deadlines</h3>
        <div style={statGridStyle}>
          <StatItem 
            label="Overdue Tasks" 
            value={stats.overdueCount}
            color="red"
            icon="⚠️"
          />
          <StatItem 
            label="Due This Week" 
            value={stats.upcomingCount}
            color="orange"
            icon="📅"
          />
        </div>
      </div>
      
      {/* Categories breakdown */}
      <div style={sectionStyle}>
        <h3>Categories</h3>
        <div style={categoryContainerStyle}>
          {Object.entries(stats.categoryCounts).map(([category, count]) => (
            <div key={category} style={categoryItemStyle}>
              <div style={categoryLabelStyle}>
                <div 
                  style={{ 
                    ...categoryColorIndicatorStyle, 
                    backgroundColor: categoryColors[category as TaskCategory] 
                  }}
                ></div>
                <span>{category}</span>
              </div>
              <div style={categoryCountStyle}>{count}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Priority breakdown */}
      <div style={sectionStyle}>
        <h3>Priorities</h3>
        <div style={priorityContainerStyle}>
          {Object.entries(stats.priorityCounts).map(([priority, count]) => (
            <div key={priority} style={priorityItemStyle}>
              <div style={priorityLabelStyle}>
                <span style={{ marginRight: '5px' }}>
                  {priorityIndicators[priority as TaskPriority]}
                </span>
                <span>{priority}</span>
              </div>
              <div style={priorityCountStyle}>{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Styles
const dashboardStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  marginBottom: '30px'
};

const sectionStyle = {
  marginBottom: '25px'
};

const statGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: '15px'
};

const statItemStyle = {
  padding: '15px',
  backgroundColor: '#f9f9f9',
  borderRadius: '6px',
  textAlign: 'center' as const,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
};

const statValueStyle = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  marginBottom: '5px'
};

const statLabelStyle = {
  fontSize: '14px',
  color: '#666'
};

const chartContainerStyle = {
  marginTop: '15px'
};

const progressBarContainerStyle = {
  display: 'flex',
  height: '20px',
  borderRadius: '10px',
  overflow: 'hidden',
  marginBottom: '10px'
};

const progressBarStyle = {
  height: '100%',
  transition: 'width 0.3s ease-in-out'
};

const chartLegendStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px'
};

const legendItemStyle = {
  display: 'flex',
  alignItems: 'center'
};

const legendColorStyle = {
  width: '12px',
  height: '12px',
  borderRadius: '3px',
  marginRight: '6px'
};

const categoryContainerStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '10px',
  marginTop: '10px'
};

const categoryItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  backgroundColor: '#f9f9f9',
  borderRadius: '4px'
};

const categoryLabelStyle = {
  display: 'flex',
  alignItems: 'center'
};

const categoryColorIndicatorStyle = {
  width: '12px',
  height: '12px',
  borderRadius: '3px',
  marginRight: '8px'
};

const categoryCountStyle = {
  fontWeight: 'bold' as const
};

const priorityContainerStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '10px',
  marginTop: '10px'
};

const priorityItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  backgroundColor: '#f9f9f9',
  borderRadius: '4px'
};

const priorityLabelStyle = {
  display: 'flex',
  alignItems: 'center'
};

const priorityCountStyle = {
  fontWeight: 'bold' as const
};

export default Dashboard; 
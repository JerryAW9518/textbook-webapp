import React from 'react';
import SubjectCard from '../components/Cards/SubjectCard';
import './Home.css';

const Home = ({ onSelectSubject }) => {
  return (
    <div className="home-page">
      {/* 歡迎區域 */}
      <div className="welcome-section">
        <h1 className="page-title">習作小幫手</h1>
        <p className="page-subtitle">國小習題解答助手</p>
        <div className="divider"></div>
      </div>

      {/* 科目選擇卡片 */}
      <div className="subject-grid">
        <SubjectCard
          subject="國文"
          icon="📖"
          color="var(--subject-mandarin)"
          onClick={() => onSelectSubject('mandarin')}
        />
        <SubjectCard
          subject="數學"
          icon="🔢"
          color="var(--subject-math)"
          onClick={() => onSelectSubject('math')}
        />
      </div>

      {/* 功能說明 */}
      <div className="features-section">
        <div className="feature-item">
          <span className="feature-icon">📚</span>
          <div className="feature-content">
            <h3>涵蓋年級</h3>
            <p>1-6年級上下學期</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🏫</span>
          <div className="feature-content">
            <h3>支援版本</h3>
            <p>翰林、康軒、南一</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">✨</span>
          <div className="feature-content">
            <h3>即時查詢</h3>
            <p>快速找到解答</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

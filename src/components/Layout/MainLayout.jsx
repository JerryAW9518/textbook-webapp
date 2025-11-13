import React from 'react';
import './MainLayout.css';

const MainLayout = ({ children, showBack, onBack, title }) => {
  return (
    <div className="main-layout">
      {/* 頂部導航 */}
      <header className="main-header">
        <div className="header-content">
          {showBack && (
            <button className="back-btn" onClick={onBack}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>返回</span>
            </button>
          )}
          <h1 className="header-title">{title || '習作小幫手'}</h1>
          <div className="header-spacer"></div>
        </div>
      </header>

      {/* 主要內容區 */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* 底部資訊 */}
      <footer className="main-footer">
        <p>支援翰林、康軒、南一版本 | 1-6年級全涵蓋</p>
      </footer>
    </div>
  );
};

export default MainLayout;

import React from 'react';
import './SubjectCard.css';

const SubjectCard = ({ subject, icon, color, onClick }) => {
  return (
    <div
      className="subject-card"
      style={{ '--card-color': color }}
      onClick={onClick}
    >
      <div className="card-icon">{icon}</div>
      <h2 className="card-title">{subject}</h2>
      <div className="card-arrow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default SubjectCard;

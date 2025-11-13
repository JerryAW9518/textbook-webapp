import React from 'react';
import './SelectPage.css';

const publishers = [
  { id: 'hanlin', name: '翰林', nameEn: 'Hanlin' },
  { id: 'kangxuan', name: '康軒', nameEn: 'Kangxuan' },
  { id: 'nanone', name: '南一', nameEn: 'Nanone' }
];

const PublisherSelect = ({ subject, onSelect }) => {
  const subjectColor = subject === 'mandarin' ? 'var(--subject-mandarin)' : 'var(--subject-math)';

  return (
    <div className="select-page">
      <div className="select-grid">
        {publishers.map((publisher) => (
          <div
            key={publisher.id}
            className="select-card"
            onClick={() => onSelect(publisher.id)}
            style={{ '--accent-color': subjectColor }}
          >
            <div className="card-content">
              <h3 className="select-title">{publisher.name}</h3>
              <p className="select-subtitle">{publisher.nameEn}</p>
            </div>
            <div className="select-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublisherSelect;

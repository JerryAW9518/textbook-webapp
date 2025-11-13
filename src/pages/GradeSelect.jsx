import React from 'react';
import './SelectPage.css';

const grades = [
  { id: '1', name: '一年級', semesters: ['11', '12'] },
  { id: '2', name: '二年級', semesters: ['21', '22'] },
  { id: '3', name: '三年級', semesters: ['31', '32'] },
  { id: '4', name: '四年級', semesters: ['41', '42'] },
  { id: '5', name: '五年級', semesters: ['51', '52'] },
  { id: '6', name: '六年級', semesters: ['61', '62'] }
];

const GradeSelect = ({ subject, onSelect }) => {
  const subjectColor = subject === 'mandarin' ? 'var(--subject-mandarin)' : 'var(--subject-math)';

  const handleSemesterClick = (grade, semesterIndex) => {
    // 轉換格式：將 "1" 轉為 "一年級\n114上學期"
    const gradeNames = ['', '一年級', '二年級', '三年級', '四年級', '五年級', '六年級'];
    const gradeName = gradeNames[parseInt(grade.id)];
    const academicYear = semesterIndex === 0 ? '114' : '113';
    const semesterName = semesterIndex === 0 ? '上學期' : '下學期';
    const fullGrade = `${gradeName}\n${academicYear}${semesterName}`;
    console.log('GradeSelect - 傳遞年級:', fullGrade);
    onSelect(fullGrade);
  };

  return (
    <div className="select-page">
      <div className="grade-grid">
        {grades.map((grade) => (
          <div key={grade.id} className="grade-card" style={{ '--accent-color': subjectColor }}>
            <h3 className="grade-title">{grade.name}</h3>
            <div className="semester-buttons">
              <button
                className="semester-btn"
                onClick={() => handleSemesterClick(grade, 0)}
              >
                上學期
              </button>
              <button
                className="semester-btn"
                onClick={() => handleSemesterClick(grade, 1)}
              >
                下學期
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradeSelect;

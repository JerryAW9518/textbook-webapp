import React, { useState, useEffect } from 'react';
import './LessonList.css';

function LessonList({ subject, publisher, grade, onSelectLesson }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true);
        setError(null);

        // 載入對應的 mapping 檔案
        const subjectPath = subject === 'mandarin' ? 'mandarin' : 'math';
        const mappingPath = `${process.env.PUBLIC_URL}/data/${subjectPath}/${publisher}.json`;

        console.log('載入課次列表:', { subject, publisher, grade, mappingPath });

        const response = await fetch(mappingPath);
        if (!response.ok) {
          throw new Error('無法載入資料');
        }

        const mappingData = await response.json();
        console.log('Mapping 資料的 keys:', Object.keys(mappingData));
        console.log('接收到的 grade:', grade);

        // 解析年級和學期（例如：一年級\n114上學期）
        // grade 格式: "一年級\n114上學期" 或 "一年級\n114下學期"
        const gradeKey = Object.keys(mappingData).find(key => {
          // 移除換行符進行比對
          const cleanKey = key.replace(/\n/g, '');
          const cleanGrade = grade.replace(/\n/g, '');
          console.log('比對:', { cleanKey, cleanGrade, match: cleanKey === cleanGrade });
          return cleanKey === cleanGrade;
        });

        console.log('找到的 gradeKey:', gradeKey);

        if (!gradeKey) {
          throw new Error(`找不到 ${grade} 的資料。可用的選項: ${Object.keys(mappingData).join(', ')}`);
        }

        // 取得課次列表
        const lessonData = mappingData[gradeKey];
        const lessonList = Object.entries(lessonData).map(([lessonName, lessonInfo]) => ({
          name: lessonName,
          path: lessonInfo.workbook || lessonInfo.sentence,
          words: lessonInfo.words,
          extraWords: lessonInfo.extraWords
        }));

        setLessons(lessonList);
      } catch (err) {
        console.error('載入課次失敗:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, [subject, publisher, grade]);

  if (loading) {
    return (
      <div className="lesson-list-container">
        <div className="loading">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-list-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="lesson-list-container">
      <div className="lesson-grid">
        {lessons.map((lesson, index) => (
          <div
            key={index}
            className="lesson-card"
            onClick={() => onSelectLesson(lesson)}
          >
            <div className="lesson-number">{index + 1}</div>
            <div className="lesson-name">{lesson.name}</div>
            {lesson.words && (
              <div className="lesson-preview">
                {lesson.words.substring(0, 10)}...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LessonList;

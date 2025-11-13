import React, { useState } from 'react';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import PublisherSelect from './pages/PublisherSelect';
import GradeSelect from './pages/GradeSelect';
import LessonList from './pages/LessonList';
import AnswerDisplay from './pages/AnswerDisplay';
import './styles/morandiColors.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [navigationState, setNavigationState] = useState({
    subject: null,
    publisher: null,
    grade: null,
    lesson: null
  });

  // 處理科目選擇
  const handleSelectSubject = (subject) => {
    setNavigationState({ ...navigationState, subject });
    setCurrentPage('publisher');
  };

  // 處理出版社選擇
  const handleSelectPublisher = (publisher) => {
    setNavigationState({ ...navigationState, publisher });
    setCurrentPage('grade');
  };

  // 處理年級選擇
  const handleSelectGrade = (grade) => {
    setNavigationState({ ...navigationState, grade });
    setCurrentPage('lesson');
  };

  // 處理課次選擇
  const handleSelectLesson = (lesson) => {
    setNavigationState({ ...navigationState, lesson });
    setCurrentPage('answer');
  };

  // 返回上一頁
  const handleBack = () => {
    if (currentPage === 'publisher') {
      setCurrentPage('home');
      setNavigationState({ subject: null, publisher: null, grade: null, lesson: null });
    } else if (currentPage === 'grade') {
      setCurrentPage('publisher');
      setNavigationState({ ...navigationState, publisher: null, grade: null, lesson: null });
    } else if (currentPage === 'lesson') {
      setCurrentPage('grade');
      setNavigationState({ ...navigationState, grade: null, lesson: null });
    } else if (currentPage === 'answer') {
      setCurrentPage('lesson');
      setNavigationState({ ...navigationState, lesson: null });
    }
  };

  // 根據當前頁面決定標題
  const getTitle = () => {
    if (currentPage === 'home') return '習作小幫手';
    const subjectName = navigationState.subject === 'mandarin' ? '國文' : '數學';
    if (currentPage === 'publisher') return `${subjectName} - 選擇出版社`;
    const publisherName = navigationState.publisher === 'hanlin' ? '翰林'
      : navigationState.publisher === 'kangxuan' ? '康軒' : '南一';
    if (currentPage === 'grade') {
      return `${subjectName} - ${publisherName} - 選擇年級`;
    }
    if (currentPage === 'lesson') {
      // grade 格式：一年級114上學期
      const gradeText = navigationState.grade || '';
      return `${subjectName} - ${publisherName} - ${gradeText}`;
    }
    if (currentPage === 'answer') {
      return navigationState.lesson ? navigationState.lesson.name : '答案顯示';
    }
    return '習作小幫手';
  };

  // 渲染當前頁面
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onSelectSubject={handleSelectSubject} />;
      case 'publisher':
        return (
          <PublisherSelect
            subject={navigationState.subject}
            onSelect={handleSelectPublisher}
          />
        );
      case 'grade':
        return (
          <GradeSelect
            subject={navigationState.subject}
            publisher={navigationState.publisher}
            onSelect={handleSelectGrade}
          />
        );
      case 'lesson':
        return (
          <LessonList
            subject={navigationState.subject}
            publisher={navigationState.publisher}
            grade={navigationState.grade}
            onSelectLesson={handleSelectLesson}
          />
        );
      case 'answer':
        return (
          <AnswerDisplay
            lesson={navigationState.lesson}
            subject={navigationState.subject}
          />
        );
      default:
        return <Home onSelectSubject={handleSelectSubject} />;
    }
  };

  return (
    <MainLayout
      showBack={currentPage !== 'home'}
      onBack={handleBack}
      title={getTitle()}
    >
      {renderPage()}
    </MainLayout>
  );
}

export default App;

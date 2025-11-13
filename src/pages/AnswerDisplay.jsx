import React, { useState, useEffect } from 'react';
import './AnswerDisplay.css';

// LaTeX 轉文字函數
function convertLatexToText(latex) {
  if (!latex || typeof latex !== 'string') {
    return latex;
  }

  // 轉換 \frac{分子}{分母} 為 分子/分母
  let result = latex.replace(/\\frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, (match, numerator, denominator) => {
    return `${numerator.trim()}/${denominator.trim()}`;
  });

  // 移除其他常見的 LaTeX 命令
  result = result.replace(/\\text\{([^}]*)\}/g, '$1');
  result = result.replace(/\\times/g, '×');
  result = result.replace(/\\div/g, '÷');
  result = result.replace(/\\pm/g, '±');

  return result;
}

// 處理文字裝飾（overline, underline等）
function DecoratedText({ text, decoration }) {
  if (!decoration || decoration === 'none') {
    return <span>{text}</span>;
  }

  if (decoration === 'overline') {
    return <span className="overline-text">{text}</span>;
  }

  if (decoration === 'underline') {
    return <span className="underline-text">{text}</span>;
  }

  return <span>{text}</span>;
}

// 數學答案組件（新格式：有 section 層級）
function MathAnswer({ answer }) {
  if (!answer || !answer.extras) {
    return null;
  }

  const { category, extras } = answer;

  // text 類型
  if (category === 'text') {
    const { decoration = 'none', texts = [] } = extras;
    return (
      <div className="math-answer">
        {texts.map((textGroup, groupIndex) => (
          <div key={groupIndex} className="text-group">
            {textGroup.map((text, textIndex) => (
              <DecoratedText
                key={textIndex}
                text={text}
                decoration={decoration}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // equation 類型 - 數學算式
  if (category === 'equation') {
    const { items = [] } = extras;
    return (
      <div className="math-answer equation-answer">
        {items.map((equation, idx) => (
          <div key={idx} className="equation-item">{equation}</div>
        ))}
      </div>
    );
  }

  // tablesOptional 類型 - 表格
  if (category === 'tablesOptional') {
    const { row = [] } = extras;
    return (
      <div className="math-answer">
        <div className="answer-table">
          {row.map((rowData, rowIdx) => (
            <div key={rowIdx} className="table-row">
              {rowData.map((cell, cellIdx) => (
                <div key={cellIdx} className="table-cell">{cell}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // checkbox 類型 - 勾選框
  if (category === 'checkbox') {
    const { items = [] } = extras;
    return (
      <div className="math-answer checkbox-answer">
        {items.map((itemGroup, groupIdx) => (
          <div key={groupIdx} className="checkbox-group">
            {itemGroup.map((item, itemIdx) => (
              <div key={itemIdx} className="checkbox-item">
                <span className={`checkbox ${item.checked === 'checked' ? 'checked' : ''}`}>
                  {item.checked === 'checked' ? '✓' : '○'}
                </span>
                {item.value && <span className="checkbox-label">{item.value}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // matching 類型 - 數學配對題
  if (category === 'matching') {
    const { multiConnections = [], layerWidgets = [] } = extras;
    return (
      <div className="math-answer matching-answer">
        {layerWidgets.length > 0 && (
          <div className="matching-layers">
            {layerWidgets.map((layer, layerIdx) => (
              <div key={layerIdx} className="matching-layer">
                {layer.map((item, itemIdx) => (
                  <div key={itemIdx} className="matching-cell">{item}</div>
                ))}
              </div>
            ))}
          </div>
        )}
        {multiConnections.length > 0 && (
          <div className="connections-hint">
            <small>配對關係：請參考原習作題目</small>
          </div>
        )}
      </div>
    );
  }

  // circleMatching 類型 - 圈選配對
  if (category === 'circleMatching') {
    const { multiConnections = [] } = extras;
    return (
      <div className="math-answer">
        <div className="connections-hint">
          配對題型 - 請參考原習作題目
        </div>
      </div>
    );
  }

  // 數學運算相關類型 (multiply, division, factorization, regrouping, short_division 等)
  if (['multiply', 'division', 'factorization', 'regrouping', 'short_division', 'short_division_gcf'].includes(category)) {
    // 這些通常包含複雜的數學運算格式，顯示為文字說明
    return (
      <div className="math-answer operation-answer">
        <div className="operation-hint">
          {category === 'multiply' && '乘法運算 - 請參考原習作題目'}
          {category === 'division' && '除法運算 - 請參考原習作題目'}
          {category === 'factorization' && '因數分解 - 請參考原習作題目'}
          {category === 'regrouping' && '進位/退位運算 - 請參考原習作題目'}
          {category === 'short_division' && '短除法 - 請參考原習作題目'}
          {category === 'short_division_gcf' && '短除法求最大公因數 - 請參考原習作題目'}
        </div>
        {extras.items && (
          <div className="operation-items">
            {extras.items.map((item, idx) => (
              <div key={idx} className="operation-item">{item}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // tex 類型 - LaTeX 數學表達式 (主要是分數)
  if (category === 'tex') {
    const { tex = [] } = extras;
    return (
      <div className="math-answer tex-answer">
        {tex.map((texGroup, groupIdx) => (
          <div key={groupIdx} className="tex-group">
            {texGroup.map((texExpr, texIdx) => {
              // 簡單的 LaTeX 轉換：將 \frac{a}{b} 轉換為 a/b 或使用分數符號
              const convertedText = convertLatexToText(texExpr);
              return (
                <span key={texIdx} className="tex-item">{convertedText}</span>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // 度量相關類型 (length, weight, capacity, time, money, blocks)
  if (['length', 'weight', 'capacity', 'time', 'money', 'blocks'].includes(category)) {
    const { texts = [], items = [] } = extras;
    return (
      <div className="math-answer measurement-answer">
        {texts.length > 0 && texts.map((textGroup, groupIdx) => (
          <div key={groupIdx} className="text-group">
            {textGroup.map((text, textIdx) => (
              <span key={textIdx} className="measurement-text">{text}</span>
            ))}
          </div>
        ))}
        {items.length > 0 && items.map((item, idx) => (
          <div key={idx} className="measurement-item">{item}</div>
        ))}
      </div>
    );
  }

  // image 類型
  if (category === 'image') {
    return (
      <div className="math-answer image-answer">
        <div className="image-hint">圖形題 - 請參考原習作題目</div>
      </div>
    );
  }

  // 空的或未知類型
  if (category === '' || !category) {
    return null;
  }

  // 其他未處理的 category 用 JSON 顯示
  return (
    <div className="math-answer">
      <div className="unknown-type-hint">未知題型: {category}</div>
      <pre className="debug-json">{JSON.stringify(answer, null, 2)}</pre>
    </div>
  );
}

// 數學問題組件（有 answers 陣列）
function MathQuestion({ question, questionIndex }) {
  return (
    <div className="question-item math-question">
      <span className="question-number">{question.title || questionIndex + 1}.</span>
      <div className="answer-content">
        {question.answers && question.answers.map((answer, answerIndex) => (
          <MathAnswer key={answerIndex} answer={answer} />
        ))}
      </div>
    </div>
  );
}

// 數學 section 組件
function MathSection({ section, sectionIndex }) {
  return (
    <div className="math-section">
      <h3 className="section-subtitle">{section.title}</h3>
      {section.subtitle && <p className="section-note">{section.subtitle}</p>}
      <div className="section-questions">
        {section.question && section.question.map((q, qIndex) => (
          <MathQuestion key={qIndex} question={q} questionIndex={qIndex} />
        ))}
      </div>
    </div>
  );
}

// === 國文題型組件（保留原有的）===

// 詞彙題組件
function VocabularyQuestion({ question, index }) {
  return (
    <div className="question-item">
      <span className="question-number">{question.title || index + 1}.</span>
      <div className="answer-content">
        {question.answers.map((answer, i) => (
          <span key={i} className="answer-word">{answer}</span>
        ))}
      </div>
    </div>
  );
}

// 詞彙注音題組件
function VocabularyZhuyinQuestion({ question, index }) {
  return (
    <div className="question-item zhuyin-item">
      <span className="question-number">{question.title || index + 1}.</span>
      <div className="answer-content">
        {question.answers.map((answer, i) => (
          <div key={i} className="zhuyin-pair">
            {question.zhuyin && question.zhuyin[i] && (
              <div className="zhuyin">{question.zhuyin[i].join('')}</div>
            )}
            <div className="word">{answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 配對題組件
function MatchingQuestion({ question }) {
  const { extras } = question;
  if (!extras || !extras.layerWidgets || !extras.multiConnections) {
    return null;
  }

  return (
    <div className="question-item matching-item">
      <div className="matching-layers">
        {extras.layerWidgets.map((layer, layerIndex) => (
          <div key={layerIndex} className="matching-layer">
            {layer.map((item, itemIndex) => (
              <div key={itemIndex} className="matching-cell">
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
      {extras.multiConnections && extras.multiConnections.length > 0 && (
        <div className="connections-hint">
          <small>配對關係：請參考原習作題目</small>
        </div>
      )}
    </div>
  );
}

// Checkbox 問題組件 (國文)
function CheckboxQuestion({ question, index }) {
  const { extras } = question;
  if (!extras || !extras.items) {
    return null;
  }

  return (
    <div className="question-item checkbox-item">
      <span className="question-number">{question.title || index + 1}.</span>
      <div className="answer-content">
        <div className="checkbox-answer">
          {extras.items.map((itemGroup, groupIdx) => (
            <div key={groupIdx} className="checkbox-group">
              {itemGroup.map((item, itemIdx) => (
                <div key={itemIdx} className="checkbox-item">
                  <span className={`checkbox ${item.checked === 'checked' ? 'checked' : ''}`}>
                    {item.checked === 'checked' ? '✓' : '○'}
                  </span>
                  {item.value && <span className="checkbox-label">{item.value}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 國文題型渲染器
function MandarinQuestion({ question, index }) {
  switch (question.category) {
    case 'vocabulary':
      return <VocabularyQuestion question={question} index={index} />;
    case 'vocabularyZhuyin':
    case 'wordZhuyin': // wordZhuyin 和 vocabularyZhuyin 使用相同渲染器
      return <VocabularyZhuyinQuestion question={question} index={index} />;
    case 'matching':
      return <MatchingQuestion question={question} />;
    case 'checkbox':
      return <CheckboxQuestion question={question} index={index} />;
    default:
      // 其他類型暫時用 JSON 顯示
      return (
        <div className="question-item">
          <div className="unknown-type-hint">未知題型: {question.category}</div>
          <pre className="debug-json">{JSON.stringify(question, null, 2)}</pre>
        </div>
      );
  }
}

// 主題區塊組件（根據科目類型決定渲染方式）
function Section({ section, index, isMath }) {
  // 數學格式：有 section 層級
  if (isMath) {
    return (
      <div className="answer-section">
        <div className="section-header">
          <h2 className="section-title">{section.title}</h2>
          {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
        </div>
        <div className="section-content">
          {section.section && section.section.map((s, sIndex) => (
            <MathSection key={sIndex} section={s} sectionIndex={sIndex} />
          ))}
        </div>
      </div>
    );
  }

  // 國文格式：直接有 question
  return (
    <div className="answer-section">
      <div className="section-header">
        <h2 className="section-title">{section.title}</h2>
        {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
      </div>
      <div className="section-content">
        {section.question && section.question.map((q, qIndex) => (
          <MandarinQuestion key={qIndex} question={q} index={qIndex} />
        ))}
      </div>
    </div>
  );
}

// 主要答案顯示組件
function AnswerDisplay({ lesson, subject }) {
  const [answerData, setAnswerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnswers = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!lesson || !lesson.path) {
          throw new Error('無效的課次資料');
        }

        // 載入答案 JSON
        const subjectPath = subject === 'mandarin' ? 'mandarin' : 'math';
        const answerPath = `/data/${subjectPath}/${lesson.path}`;

        console.log('載入答案:', answerPath);

        const response = await fetch(answerPath);
        if (!response.ok) {
          throw new Error('無法載入答案資料');
        }

        const data = await response.json();
        console.log('答案資料:', data);
        setAnswerData(data);
      } catch (err) {
        console.error('載入答案失敗:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnswers();
  }, [lesson, subject]);

  if (loading) {
    return (
      <div className="answer-display-container">
        <div className="loading">載入答案中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="answer-display-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!answerData || answerData.length === 0) {
    return (
      <div className="answer-display-container">
        <div className="no-data">暫無答案資料</div>
      </div>
    );
  }

  const isMath = subject === 'math';

  return (
    <div className="answer-display-container">
      <div className="lesson-header">
        <h1 className="lesson-title">{lesson.name}</h1>
      </div>
      <div className="sections-list">
        {answerData.map((section, index) => (
          <Section key={index} section={section} index={index} isMath={isMath} />
        ))}
      </div>
    </div>
  );
}

export default AnswerDisplay;

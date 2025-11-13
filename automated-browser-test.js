#!/usr/bin/env node
/**
 * 全自動瀏覽器測試 - 使用 Playwright
 * 測試流程: 首頁 → 數學 → 翰林 → 一年級下學期 → 單元2
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 測試結果
const results = {
  steps: [],
  screenshots: [],
  success: true,
  errors: []
};

async function runTest() {
  console.log('🚀 啟動全自動瀏覽器測試...\n');

  const browser = await chromium.launch({
    headless: false, // 顯示瀏覽器以便觀察
    slowMo: 500 // 放慢操作以便觀察
  });

  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 }
  });

  const page = await context.newPage();

  try {
    // === 步驟 1: 導航到首頁 ===
    console.log('📍 步驟 1: 導航到首頁...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 驗證首頁元素
    const mathCard = await page.locator('text=數學').first();
    const mandarinCard = await page.locator('text=國文').first();

    if (!(await mathCard.isVisible()) || !(await mandarinCard.isVisible())) {
      throw new Error('首頁未正確顯示科目卡片');
    }

    await page.screenshot({
      path: 'test-screenshots/step1-home.png',
      fullPage: true
    });
    console.log('✅ 首頁顯示正常');
    console.log('📸 截圖: test-screenshots/step1-home.png\n');

    results.steps.push({ step: 1, name: '首頁', status: 'passed' });
    results.screenshots.push('step1-home.png');

    // === 步驟 2: 點擊「數學」卡片 ===
    console.log('📍 步驟 2: 點擊「數學」卡片...');
    await page.locator('.subject-card').filter({ hasText: '數學' }).click();
    await page.waitForTimeout(1000);

    // 驗證出版社選擇頁
    const hanlinCard = await page.locator('text=翰林').first();
    const kangxuanCard = await page.locator('text=康軒').first();
    const nanoneCard = await page.locator('text=南一').first();

    if (!(await hanlinCard.isVisible()) || !(await kangxuanCard.isVisible()) || !(await nanoneCard.isVisible())) {
      throw new Error('出版社選擇頁未正確顯示');
    }

    await page.screenshot({
      path: 'test-screenshots/step2-publishers.png',
      fullPage: true
    });
    console.log('✅ 出版社選擇頁顯示正常');
    console.log('📸 截圖: test-screenshots/step2-publishers.png\n');

    results.steps.push({ step: 2, name: '出版社選擇', status: 'passed' });
    results.screenshots.push('step2-publishers.png');

    // === 步驟 3: 點擊「翰林」===
    console.log('📍 步驟 3: 點擊「翰林」出版社...');
    await page.locator('.select-card').filter({ hasText: '翰林' }).click();
    await page.waitForTimeout(1000);

    // 驗證年級選擇頁
    const gradeTitle = await page.locator('text=一年級').first();

    if (!(await gradeTitle.isVisible())) {
      throw new Error('年級選擇頁未正確顯示');
    }

    await page.screenshot({
      path: 'test-screenshots/step3-grades.png',
      fullPage: true
    });
    console.log('✅ 年級選擇頁顯示正常');
    console.log('📸 截圖: test-screenshots/step3-grades.png\n');

    results.steps.push({ step: 3, name: '年級選擇', status: 'passed' });
    results.screenshots.push('step3-grades.png');

    // === 步驟 4: 點擊「一年級下學期」===
    console.log('📍 步驟 4: 點擊「一年級下學期」...');
    // 使用 JavaScript 直接點擊按鈕
    await page.evaluate(() => {
      const gradeCards = Array.from(document.querySelectorAll('.grade-card'));
      const gradeOneCard = gradeCards.find(card => card.textContent.includes('一年級'));
      if (gradeOneCard) {
        const semesterBtns = gradeOneCard.querySelectorAll('.semester-btn');
        const semester2Btn = Array.from(semesterBtns).find(btn => btn.textContent.includes('下學期'));
        if (semester2Btn) {
          semester2Btn.click();
        }
      }
    });
    await page.waitForTimeout(2000);

    // 驗證課次列表頁 - 等待頁面導航
    await page.waitForTimeout(1000);
    const lessonCards = await page.locator('.lesson-card').count();

    if (lessonCards === 0) {
      throw new Error('課次列表頁未正確顯示');
    }

    await page.screenshot({
      path: 'test-screenshots/step4-lessons.png',
      fullPage: true
    });
    console.log('✅ 課次列表頁顯示正常');
    console.log('📸 截圖: test-screenshots/step4-lessons.png\n');

    results.steps.push({ step: 4, name: '課次列表', status: 'passed' });
    results.screenshots.push('step4-lessons.png');

    // === 步驟 5: 點擊「單元2」===
    console.log('📍 步驟 5: 點擊「單元2」...');
    // 直接用 JavaScript 點擊第2個課次卡片 (單元2)
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.lesson-card');
      if (cards[1]) cards[1].click(); // 索引1 = 單元2
    });
    await page.waitForTimeout(3000); // 等待答案加載

    // 驗證答案顯示頁
    const answerContainer = await page.locator('.answer-display-container, .answers-list, .answer-card').first();

    if (!(await answerContainer.isVisible())) {
      throw new Error('答案顯示頁未正確顯示');
    }

    // 檢查答案內容是否已渲染
    const answerContent = await page.textContent('body');
    if (!answerContent || answerContent.length < 100) {
      throw new Error('答案內容未正確渲染');
    }

    await page.screenshot({
      path: 'test-screenshots/step5-answers.png',
      fullPage: true
    });
    console.log('✅ 答案顯示頁渲染正常');
    console.log('📸 截圖: test-screenshots/step5-answers.png\n');

    results.steps.push({ step: 5, name: '答案顯示', status: 'passed' });
    results.screenshots.push('step5-answers.png');

    // === 額外驗證: 檢查問題類型渲染 ===
    console.log('📍 額外驗證: 檢查問題類型渲染...');

    // 檢查是否有各種問題類型的 CSS 類名
    const pageHTML = await page.content();
    const foundTypes = [];

    const typeClasses = [
      'text-answer', 'equation-answer', 'checkbox-answer',
      'matching-answer', 'operation-answer', 'measurement-answer',
      'tex-answer', 'image-answer'
    ];

    for (const typeClass of typeClasses) {
      if (pageHTML.includes(typeClass)) {
        foundTypes.push(typeClass.replace('-answer', ''));
      }
    }

    console.log(`✅ 找到 ${foundTypes.length} 種問題類型: ${foundTypes.join(', ')}\n`);
    results.foundQuestionTypes = foundTypes;

    // === 測試完成 ===
    console.log('=' .repeat(80));
    console.log('🎉 所有測試步驟完成！');
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('\n❌ 測試失敗:', error.message);
    results.success = false;
    results.errors.push(error.message);

    // 失敗時截圖
    await page.screenshot({
      path: 'test-screenshots/error.png',
      fullPage: true
    });
    console.log('📸 錯誤截圖: test-screenshots/error.png');
  } finally {
    // 等待一下讓用戶看到最終狀態
    await page.waitForTimeout(2000);

    await browser.close();

    // 輸出測試報告
    printReport();
  }
}

function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 測試報告');
  console.log('='.repeat(80));

  console.log(`\n整體結果: ${results.success ? '✅ 通過' : '❌ 失敗'}`);

  console.log('\n步驟詳情:');
  results.steps.forEach(step => {
    const icon = step.status === 'passed' ? '✅' : '❌';
    console.log(`  ${icon} 步驟 ${step.step}: ${step.name}`);
  });

  if (results.foundQuestionTypes && results.foundQuestionTypes.length > 0) {
    console.log(`\n問題類型: 找到 ${results.foundQuestionTypes.length} 種`);
    console.log(`  ${results.foundQuestionTypes.join(', ')}`);
  }

  console.log(`\n截圖保存於: test-screenshots/`);
  results.screenshots.forEach(screenshot => {
    console.log(`  📸 ${screenshot}`);
  });

  if (results.errors.length > 0) {
    console.log('\n錯誤詳情:');
    results.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }

  console.log('\n' + '='.repeat(80));

  // 保存 JSON 報告
  const reportPath = 'test-screenshots/report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 詳細報告已保存: ${reportPath}`);

  process.exit(results.success ? 0 : 1);
}

// 創建截圖目錄
const screenshotDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// 執行測試
runTest().catch(err => {
  console.error('測試執行失敗:', err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * 翰林版完整自動化瀏覽器測試
 * 測試範圍：
 * - 數學：1-6年級上下學期所有單元
 * - 國文：1-6年級上下學期所有課次
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 測試配置
const grades = [
  { id: 1, name: '一年級', semesters: [{ index: 0, name: '上學期', code: '11' }, { index: 1, name: '下學期', code: '12' }] },
  { id: 2, name: '二年級', semesters: [{ index: 0, name: '上學期', code: '21' }, { index: 1, name: '下學期', code: '22' }] },
  { id: 3, name: '三年級', semesters: [{ index: 0, name: '上學期', code: '31' }, { index: 1, name: '下學期', code: '32' }] },
  { id: 4, name: '四年級', semesters: [{ index: 0, name: '上學期', code: '41' }, { index: 1, name: '下學期', code: '42' }] },
  { id: 5, name: '五年級', semesters: [{ index: 0, name: '上學期', code: '51' }, { index: 1, name: '下學期', code: '52' }] },
  { id: 6, name: '六年級', semesters: [{ index: 0, name: '上學期', code: '61' }, { index: 1, name: '下學期', code: '62' }] }
];

// 測試結果
const results = {
  math: { total: 0, passed: 0, failed: 0, errors: [] },
  mandarin: { total: 0, passed: 0, failed: 0, errors: [] },
  screenshots: []
};

// 創建截圖目錄
const screenshotDir = path.join(__dirname, 'hanlin-test-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// 導航到科目頁面
async function navigateToSubject(page, subject) {
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const subjectText = subject === 'math' ? '數學' : '國文';
  await page.locator('.subject-card').filter({ hasText: subjectText }).click();
  await page.waitForTimeout(500);
}

// 選擇翰林出版社
async function selectHanlin(page) {
  await page.locator('.select-card').filter({ hasText: '翰林' }).click();
  await page.waitForTimeout(500);
}

// 選擇年級和學期
async function selectGradeAndSemester(page, grade, semester) {
  await page.evaluate(({ gradeName, semesterIndex }) => {
    const gradeCards = Array.from(document.querySelectorAll('.grade-card'));
    const gradeCard = gradeCards.find(card => card.textContent.includes(gradeName));
    if (gradeCard) {
      const semesterBtns = gradeCard.querySelectorAll('.semester-btn');
      if (semesterBtns[semesterIndex]) {
        semesterBtns[semesterIndex].click();
      }
    }
  }, { gradeName: grade.name, semesterIndex: semester.index });
  await page.waitForTimeout(1000);
}

// 測試單個課次/單元
async function testLesson(page, subject, grade, semester, lessonIndex, lessonTotal) {
  try {
    // 點擊課次卡片
    await page.evaluate((index) => {
      const cards = document.querySelectorAll('.lesson-card');
      if (cards[index]) cards[index].click();
    }, lessonIndex);
    await page.waitForTimeout(2000);

    // 滾動到頁面底部，確保所有內容都已渲染
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    // 再滾回頂部
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);

    // 檢查頁面中的錯誤訊息
    const errors = await page.evaluate(() => {
      const issues = [];

      // 檢查是否有未渲染的 LaTeX (包含 \frac, \times 等)
      const bodyText = document.body.innerText;
      if (bodyText.includes('\\frac') || bodyText.includes('\\times') || bodyText.includes('\\div')) {
        issues.push('發現未轉換的 LaTeX 語法');
      }

      // 檢查是否有圖片載入失敗
      const images = Array.from(document.querySelectorAll('img'));
      const brokenImages = images.filter(img => !img.complete || img.naturalHeight === 0);
      if (brokenImages.length > 0) {
        issues.push(`${brokenImages.length} 張圖片載入失敗`);
      }

      // 檢查是否有 React 錯誤訊息
      if (bodyText.includes('Error') && bodyText.includes('React')) {
        issues.push('發現 React 錯誤');
      }

      return issues;
    });

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    // 驗證答案是否渲染
    const pageHTML = await page.content();
    const hasAnswers = pageHTML.length > 5000;

    if (!hasAnswers) {
      throw new Error('答案內容未正確渲染');
    }

    const lessonNum = lessonIndex + 1;
    const subjectCN = subject === 'math' ? '數學' : '國文';
    const lessonType = subject === 'math' ? '單元' : '課';
    console.log(`    ✅ ${subjectCN} - ${grade.name}${semester.name} - ${lessonType}${lessonNum} (${lessonIndex + 1}/${lessonTotal})`);

    // 點擊返回按鈕而不是用 goBack
    await page.locator('text=返回').first().click();
    await page.waitForTimeout(1000);

    return true;
  } catch (error) {
    const lessonNum = lessonIndex + 1;
    const subjectCN = subject === 'math' ? '數學' : '國文';
    const lessonType = subject === 'math' ? '單元' : '課';
    console.log(`    ❌ ${subjectCN} - ${grade.name}${semester.name} - ${lessonType}${lessonNum}: ${error.message}`);

    // 嘗試返回
    try {
      await page.locator('text=返回').first().click();
      await page.waitForTimeout(1000);
    } catch (e) {
      // 如果返回失敗，重新導航
      await navigateToSubject(page, subject);
      await selectHanlin(page);
      await selectGradeAndSemester(page, grade, semester);
    }

    return false;
  }
}

// 測試單個科目的所有年級學期
async function testSubject(page, subject) {
  const subjectCN = subject === 'math' ? '數學' : '國文';
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📚 開始測試翰林${subjectCN}`);
  console.log('='.repeat(80));

  for (const grade of grades) {
    for (const semester of grade.semesters) {
      console.log(`\n  📖 ${grade.name} ${semester.name} (hanlin${semester.code})`);

      // 導航到課次列表
      await navigateToSubject(page, subject);
      await selectHanlin(page);
      await selectGradeAndSemester(page, grade, semester);

      // 獲取課次卡片數量
      const lessonCount = await page.locator('.lesson-card').count();

      if (lessonCount === 0) {
        console.log(`    ⚠️  沒有找到課次資料`);
        continue;
      }

      console.log(`    找到 ${lessonCount} 個${subject === 'math' ? '單元' : '課次'}`);

      // 測試每個課次
      for (let i = 0; i < lessonCount; i++) {
        const passed = await testLesson(page, subject, grade, semester, i, lessonCount);

        results[subject].total++;
        if (passed) {
          results[subject].passed++;
        } else {
          results[subject].failed++;
          results[subject].errors.push({
            grade: grade.name,
            semester: semester.name,
            lesson: i + 1
          });
        }
      }
    }
  }
}

// 打印測試報告
function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 翰林版完整測試報告');
  console.log('='.repeat(80));

  // 數學統計
  const mathRate = results.math.total > 0
    ? Math.round((results.math.passed / results.math.total) * 100)
    : 0;
  console.log('\n📐 數學測試結果:');
  console.log(`   總測試數: ${results.math.total}`);
  console.log(`   ✅ 通過: ${results.math.passed}`);
  console.log(`   ❌ 失敗: ${results.math.failed}`);
  console.log(`   📈 通過率: ${mathRate}%`);

  // 國文統計
  const mandarinRate = results.mandarin.total > 0
    ? Math.round((results.mandarin.passed / results.mandarin.total) * 100)
    : 0;
  console.log('\n📖 國文測試結果:');
  console.log(`   總測試數: ${results.mandarin.total}`);
  console.log(`   ✅ 通過: ${results.mandarin.passed}`);
  console.log(`   ❌ 失敗: ${results.mandarin.failed}`);
  console.log(`   📈 通過率: ${mandarinRate}%`);

  // 整體統計
  const totalTests = results.math.total + results.mandarin.total;
  const totalPassed = results.math.passed + results.mandarin.passed;
  const totalFailed = results.math.failed + results.mandarin.failed;
  const totalRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

  console.log('\n' + '='.repeat(80));
  console.log('🎯 整體統計:');
  console.log(`   總測試數: ${totalTests}`);
  console.log(`   ✅ 通過: ${totalPassed}`);
  console.log(`   ❌ 失敗: ${totalFailed}`);
  console.log(`   📈 通過率: ${totalRate}%`);
  console.log('='.repeat(80));

  // 顯示錯誤詳情
  const allErrors = [
    ...results.math.errors.map(e => ({ subject: '數學', ...e })),
    ...results.mandarin.errors.map(e => ({ subject: '國文', ...e }))
  ];

  if (allErrors.length > 0) {
    console.log('\n❌ 失敗項目詳情:');
    allErrors.forEach((err, i) => {
      const lessonType = err.subject === '數學' ? '單元' : '課';
      console.log(`   ${i + 1}. ${err.subject} - ${err.grade}${err.semester} - ${lessonType}${err.lesson}`);
    });
  } else {
    console.log('\n✨ 完美！所有測試都通過了！');
  }

  console.log('');

  // 保存 JSON 報告
  const reportPath = path.join(screenshotDir, 'hanlin-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      rate: totalRate
    }
  }, null, 2));
  console.log(`📄 詳細報告已保存: ${reportPath}\n`);

  return totalFailed === 0;
}

// 主程序
async function main() {
  console.log('🚀 開始翰林版完整自動化測試...\n');

  const browser = await chromium.launch({
    headless: false, // 顯示瀏覽器以便確認
    slowMo: 100 // 稍微放慢以便觀察
  });

  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 }
  });

  const page = await context.newPage();

  try {
    // 測試數學
    await testSubject(page, 'math');

    // 測試國文
    await testSubject(page, 'mandarin');

    // 打印報告
    const allPassed = printReport();

    await browser.close();
    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ 測試執行失敗:', error);
    await browser.close();
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

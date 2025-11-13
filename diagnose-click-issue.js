#!/usr/bin/env node
/**
 * 診斷年級選擇點擊問題
 */

const { chromium } = require('playwright');

async function diagnose() {
  console.log('🔍 開始診斷年級選擇點擊問題...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 }
  });

  const page = await context.newPage();

  // 監聽所有 console 訊息
  page.on('console', msg => {
    console.log(`[瀏覽器 Console] ${msg.type()}: ${msg.text()}`);
  });

  // 監聽錯誤
  page.on('pageerror', error => {
    console.log(`[頁面錯誤] ${error.message}`);
  });

  try {
    // 導航到首頁
    console.log('1. 導航到首頁...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 點擊數學
    console.log('2. 點擊數學...');
    await page.locator('.subject-card').filter({ hasText: '數學' }).click();
    await page.waitForTimeout(1000);

    // 點擊翰林
    console.log('3. 點擊翰林...');
    await page.locator('.select-card').filter({ hasText: '翰林' }).click();
    await page.waitForTimeout(1000);

    // 檢查年級選擇頁面
    console.log('\n📊 年級選擇頁面診斷:');

    // 檢查所有按鈕
    const buttons = await page.locator('.semester-btn').all();
    console.log(`   找到 ${buttons.length} 個學期按鈕`);

    // 檢查第一個按鈕的詳細資訊
    if (buttons.length > 0) {
      const firstBtn = buttons[0];
      const isVisible = await firstBtn.isVisible();
      const isEnabled = await firstBtn.isEnabled();
      const text = await firstBtn.textContent();
      const boundingBox = await firstBtn.boundingBox();

      console.log(`\n   第一個按鈕詳情:`);
      console.log(`   - 文字: ${text}`);
      console.log(`   - 可見: ${isVisible}`);
      console.log(`   - 啟用: ${isEnabled}`);
      console.log(`   - 位置: x=${boundingBox?.x}, y=${boundingBox?.y}`);
      console.log(`   - 大小: width=${boundingBox?.width}, height=${boundingBox?.height}`);
    }

    // 檢查 CSS 樣式
    const btnStyles = await page.evaluate(() => {
      const btn = document.querySelector('.semester-btn');
      if (!btn) return null;

      const styles = window.getComputedStyle(btn);
      return {
        pointerEvents: styles.pointerEvents,
        cursor: styles.cursor,
        opacity: styles.opacity,
        display: styles.display,
        zIndex: styles.zIndex
      };
    });

    console.log(`\n   按鈕 CSS 樣式:`);
    console.log(`   - pointer-events: ${btnStyles?.pointerEvents}`);
    console.log(`   - cursor: ${btnStyles?.cursor}`);
    console.log(`   - opacity: ${btnStyles?.opacity}`);
    console.log(`   - display: ${btnStyles?.display}`);
    console.log(`   - z-index: ${btnStyles?.zIndex}`);

    // 嘗試點擊第一個按鈕
    console.log('\n🖱️  嘗試點擊「一年級上學期」按鈕...');
    await page.evaluate(() => {
      const gradeCards = Array.from(document.querySelectorAll('.grade-card'));
      const gradeOneCard = gradeCards.find(card => card.textContent.includes('一年級'));
      if (gradeOneCard) {
        const semesterBtns = gradeOneCard.querySelectorAll('.semester-btn');
        console.log('找到一年級卡片，學期按鈕數量:', semesterBtns.length);
        if (semesterBtns[0]) {
          console.log('點擊上學期按鈕...');
          semesterBtns[0].click();
        }
      }
    });

    await page.waitForTimeout(2000);

    // 檢查是否成功導航
    const currentUrl = page.url();
    console.log(`\n   當前 URL: ${currentUrl}`);

    const lessonCards = await page.locator('.lesson-card').count();
    console.log(`   課次卡片數量: ${lessonCards}`);

    if (lessonCards > 0) {
      console.log('\n✅ 點擊成功！成功導航到課次列表頁面');
    } else {
      console.log('\n❌ 點擊似乎沒有效果，未導航到課次列表');
    }

    // 截圖
    await page.screenshot({ path: 'diagnose-screenshot.png', fullPage: true });
    console.log('\n📸 已保存截圖: diagnose-screenshot.png');

    // 保持瀏覽器打開 30 秒讓用戶查看
    console.log('\n⏰ 瀏覽器將保持打開 30 秒供您檢查...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ 診斷過程發生錯誤:', error.message);
  } finally {
    await browser.close();
  }
}

diagnose().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

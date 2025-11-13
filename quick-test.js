#!/usr/bin/env node
/**
 * 快速 API 測試腳本 - 測試所有 JSON 文件是否可以正常載入
 */

const http = require('http');

const tests = [];
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// 測試函數
function testURL(url, description) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    http.get(url, (res) => {
      const time = Date.now() - startTime;
      let data = '';

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            JSON.parse(data);
            console.log(`✅ [${time}ms] ${description}`);
            results.passed++;
            resolve(true);
          } catch (e) {
            console.log(`❌ [${time}ms] ${description} - JSON 解析失敗`);
            results.failed++;
            results.errors.push({ url, description, error: 'JSON parse error' });
            resolve(false);
          }
        } else {
          console.log(`❌ [${time}ms] ${description} - HTTP ${res.statusCode}`);
          results.failed++;
          results.errors.push({ url, description, error: `HTTP ${res.statusCode}` });
          resolve(false);
        }
      });
    }).on('error', (e) => {
      console.log(`❌ ${description} - ${e.message}`);
      results.failed++;
      results.errors.push({ url, description, error: e.message });
      resolve(false);
    });
  });
}

// 主測試函數
async function runTests() {
  console.log('🚀 開始測試 Web 應用...\n');
  console.log('=' .repeat(60));

  // 測試 1: 首頁
  console.log('\n📱 測試首頁載入');
  await testURL('http://localhost:3000', '首頁 HTML');

  // 測試 2: 映射文件
  console.log('\n📚 測試映射文件');
  await testURL('http://localhost:3000/data/mandarin/hanlin.json', '國文-翰林映射');
  await testURL('http://localhost:3000/data/mandarin/kangxuan.json', '國文-康軒映射');
  await testURL('http://localhost:3000/data/mandarin/nanone.json', '國文-南一映射');
  await testURL('http://localhost:3000/data/math/hanlin.json', '數學-翰林映射');
  await testURL('http://localhost:3000/data/math/kangxuan.json', '數學-康軒映射');
  await testURL('http://localhost:3000/data/math/nanone.json', '數學-南一映射');

  // 測試 3: 國文答案文件
  console.log('\n📖 測試國文答案文件');
  await testURL('http://localhost:3000/data/mandarin/hanlin/hanlin11/hanlin11_1.json', '翰林1上-第1課');
  await testURL('http://localhost:3000/data/mandarin/hanlin/hanlin12/hanlin12_1.json', '翰林1下-第1課');
  await testURL('http://localhost:3000/data/mandarin/hanlin/hanlin12/hanlin12_4.json', '翰林1下-第4課 (修復的文件)');
  await testURL('http://localhost:3000/data/mandarin/kangxuan/kangxuan31/kangxuan31_1.json', '康軒3上-第1課');
  await testURL('http://localhost:3000/data/mandarin/nanone/nanone52/nanone52_5.json', '南一5下-第5課');

  // 測試 4: 數學答案文件
  console.log('\n🔢 測試數學答案文件');
  await testURL('http://localhost:3000/data/math/hanlin/hanlin11/hanlin11_1.json', '翰林1上-單元1');
  await testURL('http://localhost:3000/data/math/hanlin/hanlin11/hanlin11_6.json', '翰林1上-單元6 (equation)');
  await testURL('http://localhost:3000/data/math/hanlin/hanlin12/hanlin12_2.json', '翰林1下-單元2 (checkbox)');
  await testURL('http://localhost:3000/data/math/hanlin/hanlin41/hanlin41_4.json', '翰林4上-單元4 (tex/LaTeX)');
  await testURL('http://localhost:3000/data/math/kangxuan/kangxuan32/kangxuan32_3.json', '康軒3下-單元3');
  await testURL('http://localhost:3000/data/math/nanone/nanone61/nanone61_9.json', '南一6上-單元9');

  // 測試 5: 隨機抽樣
  console.log('\n🎲 隨機抽樣測試');
  const randomFiles = [
    ['http://localhost:3000/data/mandarin/hanlin/hanlin21/hanlin21_5.json', '翰林2上-第5課'],
    ['http://localhost:3000/data/mandarin/kangxuan/kangxuan42/kangxuan42_7.json', '康軒4下-第7課'],
    ['http://localhost:3000/data/mandarin/nanone/nanone61/nanone61_3.json', '南一6上-第3課'],
    ['http://localhost:3000/data/math/hanlin/hanlin22/hanlin22_4.json', '翰林2下-單元4'],
    ['http://localhost:3000/data/math/kangxuan/kangxuan51/kangxuan51_6.json', '康軒5上-單元6'],
    ['http://localhost:3000/data/math/nanone/nanone42/nanone42_8.json', '南一4下-單元8'],
  ];

  for (const [url, desc] of randomFiles) {
    await testURL(url, desc);
  }

  // 測試總結
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 測試總結:');
  console.log(`   總測試數: ${results.passed + results.failed}`);
  console.log(`   ✅ 通過: ${results.passed}`);
  console.log(`   ❌ 失敗: ${results.failed}`);
  console.log(`   📈 通過率: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

  if (results.errors.length > 0) {
    console.log('\n❌ 錯誤詳情:');
    results.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.description}`);
      console.log(`      錯誤: ${err.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(results.failed === 0 ? '\n✨ 所有測試通過！' : '\n⚠️  有測試失敗，請檢查上述錯誤');
  console.log('');

  process.exit(results.failed === 0 ? 0 : 1);
}

// 執行測試
runTests().catch(err => {
  console.error('測試執行失敗:', err);
  process.exit(1);
});

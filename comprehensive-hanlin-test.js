#!/usr/bin/env node
/**
 * 翰林版完整測試 + 南一/康軒抽樣測試
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const results = {
  hanlin: { mandarin: { passed: 0, failed: 0, errors: [] }, math: { passed: 0, failed: 0, errors: [] } },
  kangxuan: { mandarin: { passed: 0, failed: 0, errors: [] }, math: { passed: 0, failed: 0, errors: [] } },
  nanone: { mandarin: { passed: 0, failed: 0, errors: [] }, math: { passed: 0, failed: 0, errors: [] } }
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
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log(`✅ [${time}ms] ${description}`);
              resolve({ success: true, time });
            } else {
              console.log(`⚠️  [${time}ms] ${description} - 空數組`);
              resolve({ success: false, time, error: 'Empty array' });
            }
          } catch (e) {
            console.log(`❌ [${time}ms] ${description} - JSON 解析失敗`);
            resolve({ success: false, time, error: 'JSON parse error' });
          }
        } else {
          console.log(`❌ [${time}ms] ${description} - HTTP ${res.statusCode}`);
          resolve({ success: false, time, error: `HTTP ${res.statusCode}` });
        }
      });
    }).on('error', (e) => {
      console.log(`❌ ${description} - ${e.message}`);
      resolve({ success: false, error: e.message });
    });
  });
}

// 獲取目錄中的所有 JSON 文件
function getJsonFiles(dirPath) {
  try {
    const fullPath = path.join(__dirname, 'public', 'data', dirPath);
    if (!fs.existsSync(fullPath)) return [];

    const files = fs.readdirSync(fullPath);
    return files.filter(f => f.endsWith('.json')).sort();
  } catch (e) {
    console.error(`無法讀取目錄 ${dirPath}:`, e.message);
    return [];
  }
}

// 測試翰林版完整目錄
async function testHanlinComplete() {
  console.log('\n' + '='.repeat(80));
  console.log('📚 翰林版完整測試');
  console.log('='.repeat(80));

  // 翰林國文
  console.log('\n📖 翰林國文 - 完整測試');
  const hanlinMandarinGrades = ['hanlin11', 'hanlin12', 'hanlin21', 'hanlin22', 'hanlin31', 'hanlin32',
                                 'hanlin41', 'hanlin42', 'hanlin51', 'hanlin52', 'hanlin61', 'hanlin62'];

  for (const grade of hanlinMandarinGrades) {
    const dirPath = `mandarin/hanlin/${grade}`;
    const files = getJsonFiles(dirPath);

    if (files.length === 0) {
      console.log(`⚠️  ${grade} - 目錄為空或不存在`);
      continue;
    }

    console.log(`\n  📂 ${grade} (${files.length} 個文件)`);

    for (const file of files) {
      const url = `http://localhost:3000/data/${dirPath}/${file}`;
      const lessonNum = file.replace(`${grade}_`, '').replace('.json', '');
      const result = await testURL(url, `    ${grade}-第${lessonNum}課`);

      if (result.success) {
        results.hanlin.mandarin.passed++;
      } else {
        results.hanlin.mandarin.failed++;
        results.hanlin.mandarin.errors.push({ file: `${dirPath}/${file}`, error: result.error });
      }
    }
  }

  // 翰林數學
  console.log('\n🔢 翰林數學 - 完整測試');
  const hanlinMathGrades = ['hanlin11', 'hanlin12', 'hanlin21', 'hanlin22', 'hanlin31', 'hanlin32',
                             'hanlin41', 'hanlin42', 'hanlin51', 'hanlin52', 'hanlin61', 'hanlin62'];

  for (const grade of hanlinMathGrades) {
    const dirPath = `math/hanlin/${grade}`;
    const files = getJsonFiles(dirPath);

    if (files.length === 0) {
      console.log(`⚠️  ${grade} - 目錄為空或不存在`);
      continue;
    }

    console.log(`\n  📂 ${grade} (${files.length} 個文件)`);

    for (const file of files) {
      const url = `http://localhost:3000/data/${dirPath}/${file}`;
      const unitNum = file.replace(`${grade}_`, '').replace('.json', '');
      const result = await testURL(url, `    ${grade}-單元${unitNum}`);

      if (result.success) {
        results.hanlin.math.passed++;
      } else {
        results.hanlin.math.failed++;
        results.hanlin.math.errors.push({ file: `${dirPath}/${file}`, error: result.error });
      }
    }
  }
}

// 抽樣測試康軒版
async function testKangxuanSample() {
  console.log('\n' + '='.repeat(80));
  console.log('📚 康軒版抽樣測試');
  console.log('='.repeat(80));

  const samples = [
    // 國文抽樣 (每個年級抽 2 個)
    ['mandarin/kangxuan/kangxuan11', 2],
    ['mandarin/kangxuan/kangxuan21', 2],
    ['mandarin/kangxuan/kangxuan31', 2],
    ['mandarin/kangxuan/kangxuan41', 2],
    ['mandarin/kangxuan/kangxuan51', 2],
    ['mandarin/kangxuan/kangxuan61', 2],
    // 數學抽樣
    ['math/kangxuan/kangxuan12', 2],
    ['math/kangxuan/kangxuan22', 2],
    ['math/kangxuan/kangxuan32', 2],
    ['math/kangxuan/kangxuan42', 2],
    ['math/kangxuan/kangxuan52', 2],
    ['math/kangxuan/kangxuan62', 2],
  ];

  for (const [dirPath, count] of samples) {
    const files = getJsonFiles(dirPath);
    const subject = dirPath.includes('mandarin') ? 'mandarin' : 'math';
    const grade = dirPath.split('/').pop();

    console.log(`\n📂 ${grade} (抽樣 ${Math.min(count, files.length)}/${files.length})`);

    const sampled = files.slice(0, count);
    for (const file of sampled) {
      const url = `http://localhost:3000/data/${dirPath}/${file}`;
      const num = file.replace(`${grade}_`, '').replace('.json', '');
      const desc = subject === 'mandarin' ? `第${num}課` : `單元${num}`;
      const result = await testURL(url, `  ${grade}-${desc}`);

      if (result.success) {
        results.kangxuan[subject].passed++;
      } else {
        results.kangxuan[subject].failed++;
        results.kangxuan[subject].errors.push({ file: `${dirPath}/${file}`, error: result.error });
      }
    }
  }
}

// 抽樣測試南一版
async function testNanoneSample() {
  console.log('\n' + '='.repeat(80));
  console.log('📚 南一版抽樣測試');
  console.log('='.repeat(80));

  const samples = [
    // 國文抽樣
    ['mandarin/nanone/nanone11', 2],
    ['mandarin/nanone/nanone22', 2],
    ['mandarin/nanone/nanone31', 2],
    ['mandarin/nanone/nanone42', 2],
    ['mandarin/nanone/nanone51', 2],
    ['mandarin/nanone/nanone62', 2],
    // 數學抽樣
    ['math/nanone/nanone12', 2],
    ['math/nanone/nanone21', 2],
    ['math/nanone/nanone32', 2],
    ['math/nanone/nanone41', 2],
    ['math/nanone/nanone52', 2],
    ['math/nanone/nanone61', 2],
  ];

  for (const [dirPath, count] of samples) {
    const files = getJsonFiles(dirPath);
    const subject = dirPath.includes('mandarin') ? 'mandarin' : 'math';
    const grade = dirPath.split('/').pop();

    console.log(`\n📂 ${grade} (抽樣 ${Math.min(count, files.length)}/${files.length})`);

    const sampled = files.slice(0, count);
    for (const file of sampled) {
      const url = `http://localhost:3000/data/${dirPath}/${file}`;
      const num = file.replace(`${grade}_`, '').replace('.json', '');
      const desc = subject === 'mandarin' ? `第${num}課` : `單元${num}`;
      const result = await testURL(url, `  ${grade}-${desc}`);

      if (result.success) {
        results.nanone[subject].passed++;
      } else {
        results.nanone[subject].failed++;
        results.nanone[subject].errors.push({ file: `${dirPath}/${file}`, error: result.error });
      }
    }
  }
}

// 打印總結報告
function printSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 測試總結報告');
  console.log('='.repeat(80));

  // 翰林版統計
  const hanlinMandarinTotal = results.hanlin.mandarin.passed + results.hanlin.mandarin.failed;
  const hanlinMathTotal = results.hanlin.math.passed + results.hanlin.math.failed;
  const hanlinMandarinRate = hanlinMandarinTotal > 0 ?
    Math.round((results.hanlin.mandarin.passed / hanlinMandarinTotal) * 100) : 0;
  const hanlinMathRate = hanlinMathTotal > 0 ?
    Math.round((results.hanlin.math.passed / hanlinMathTotal) * 100) : 0;

  console.log('\n📚 翰林版 (完整測試)');
  console.log('  📖 國文:');
  console.log(`     總測試: ${hanlinMandarinTotal}`);
  console.log(`     ✅ 通過: ${results.hanlin.mandarin.passed}`);
  console.log(`     ❌ 失敗: ${results.hanlin.mandarin.failed}`);
  console.log(`     📈 通過率: ${hanlinMandarinRate}%`);

  console.log('  🔢 數學:');
  console.log(`     總測試: ${hanlinMathTotal}`);
  console.log(`     ✅ 通過: ${results.hanlin.math.passed}`);
  console.log(`     ❌ 失敗: ${results.hanlin.math.failed}`);
  console.log(`     📈 通過率: ${hanlinMathRate}%`);

  // 康軒版統計
  const kangxuanMandarinTotal = results.kangxuan.mandarin.passed + results.kangxuan.mandarin.failed;
  const kangxuanMathTotal = results.kangxuan.math.passed + results.kangxuan.math.failed;
  const kangxuanMandarinRate = kangxuanMandarinTotal > 0 ?
    Math.round((results.kangxuan.mandarin.passed / kangxuanMandarinTotal) * 100) : 0;
  const kangxuanMathRate = kangxuanMathTotal > 0 ?
    Math.round((results.kangxuan.math.passed / kangxuanMathTotal) * 100) : 0;

  console.log('\n📚 康軒版 (抽樣測試)');
  console.log('  📖 國文:');
  console.log(`     抽樣測試: ${kangxuanMandarinTotal}`);
  console.log(`     ✅ 通過: ${results.kangxuan.mandarin.passed}`);
  console.log(`     ❌ 失敗: ${results.kangxuan.mandarin.failed}`);
  console.log(`     📈 通過率: ${kangxuanMandarinRate}%`);

  console.log('  🔢 數學:');
  console.log(`     抽樣測試: ${kangxuanMathTotal}`);
  console.log(`     ✅ 通過: ${results.kangxuan.math.passed}`);
  console.log(`     ❌ 失敗: ${results.kangxuan.math.failed}`);
  console.log(`     📈 通過率: ${kangxuanMathRate}%`);

  // 南一版統計
  const nanoneMandarinTotal = results.nanone.mandarin.passed + results.nanone.mandarin.failed;
  const nanoneMathTotal = results.nanone.math.passed + results.nanone.math.failed;
  const nanoneMandarinRate = nanoneMandarinTotal > 0 ?
    Math.round((results.nanone.mandarin.passed / nanoneMandarinTotal) * 100) : 0;
  const nanoneMathRate = nanoneMathTotal > 0 ?
    Math.round((results.nanone.math.passed / nanoneMathTotal) * 100) : 0;

  console.log('\n📚 南一版 (抽樣測試)');
  console.log('  📖 國文:');
  console.log(`     抽樣測試: ${nanoneMandarinTotal}`);
  console.log(`     ✅ 通過: ${results.nanone.mandarin.passed}`);
  console.log(`     ❌ 失敗: ${results.nanone.mandarin.failed}`);
  console.log(`     📈 通過率: ${nanoneMandarinRate}%`);

  console.log('  🔢 數學:');
  console.log(`     抽樣測試: ${nanoneMathTotal}`);
  console.log(`     ✅ 通過: ${results.nanone.math.passed}`);
  console.log(`     ❌ 失敗: ${results.nanone.math.failed}`);
  console.log(`     📈 通過率: ${nanoneMathRate}%`);

  // 整體統計
  const totalPassed = results.hanlin.mandarin.passed + results.hanlin.math.passed +
                      results.kangxuan.mandarin.passed + results.kangxuan.math.passed +
                      results.nanone.mandarin.passed + results.nanone.math.passed;
  const totalFailed = results.hanlin.mandarin.failed + results.hanlin.math.failed +
                      results.kangxuan.mandarin.failed + results.kangxuan.math.failed +
                      results.nanone.mandarin.failed + results.nanone.math.failed;
  const totalTests = totalPassed + totalFailed;
  const totalRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

  console.log('\n' + '='.repeat(80));
  console.log('🎯 整體統計');
  console.log(`   總測試數: ${totalTests}`);
  console.log(`   ✅ 通過: ${totalPassed}`);
  console.log(`   ❌ 失敗: ${totalFailed}`);
  console.log(`   📈 通過率: ${totalRate}%`);
  console.log('='.repeat(80));

  // 顯示錯誤
  const allErrors = [
    ...results.hanlin.mandarin.errors.map(e => ({ publisher: '翰林', subject: '國文', ...e })),
    ...results.hanlin.math.errors.map(e => ({ publisher: '翰林', subject: '數學', ...e })),
    ...results.kangxuan.mandarin.errors.map(e => ({ publisher: '康軒', subject: '國文', ...e })),
    ...results.kangxuan.math.errors.map(e => ({ publisher: '康軒', subject: '數學', ...e })),
    ...results.nanone.mandarin.errors.map(e => ({ publisher: '南一', subject: '國文', ...e })),
    ...results.nanone.math.errors.map(e => ({ publisher: '南一', subject: '數學', ...e })),
  ];

  if (allErrors.length > 0) {
    console.log('\n❌ 錯誤詳情:');
    allErrors.forEach((err, i) => {
      console.log(`   ${i + 1}. [${err.publisher}-${err.subject}] ${err.file}`);
      console.log(`      錯誤: ${err.error}`);
    });
  } else {
    console.log('\n✨ 沒有錯誤！所有測試都通過了！');
  }

  console.log('');

  return totalFailed === 0;
}

// 主程序
async function main() {
  console.log('🚀 開始執行完整測試...\n');

  await testHanlinComplete();
  await testKangxuanSample();
  await testNanoneSample();

  const allPassed = printSummary();

  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error('測試執行失敗:', err);
  process.exit(1);
});

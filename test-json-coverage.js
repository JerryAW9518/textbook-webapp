#!/usr/bin/env node
/**
 * 測試腳本：驗證所有 JSON 文件的結構和 category 類型覆蓋率
 */

const fs = require('fs');
const path = require('path');

// 已實現的 category 類型
const IMPLEMENTED_MATH_CATEGORIES = [
  'text', 'equation', 'tablesOptional', 'checkbox', 'matching',
  'circleMatching', 'multiply', 'division', 'factorization',
  'regrouping', 'short_division', 'short_division_gcf',
  'length', 'weight', 'capacity', 'time', 'money', 'blocks',
  'image', 'tex', ''
];

const IMPLEMENTED_MANDARIN_CATEGORIES = [
  'vocabulary', 'vocabularyZhuyin', 'wordZhuyin', 'matching', 'checkbox'
];

// 統計數據
const stats = {
  totalFiles: 0,
  validFiles: 0,
  errorFiles: [],
  mathCategories: new Set(),
  mandarinCategories: new Set(),
  unimplementedMath: new Set(),
  unimplementedMandarin: new Set(),
  filesByCategory: {}
};

/**
 * 遞迴掃描目錄中的所有 JSON 文件
 */
function scanDirectory(dir, subject) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDirectory(filePath, subject);
    } else if (file.endsWith('.json')) {
      stats.totalFiles++;
      processJsonFile(filePath, subject);
    }
  });
}

/**
 * 處理單個 JSON 文件
 */
function processJsonFile(filePath, subject) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      stats.errorFiles.push({ file: filePath, error: 'Not an array' });
      return;
    }

    stats.validFiles++;

    // 提取所有 category
    extractCategories(data, filePath, subject);

  } catch (error) {
    stats.errorFiles.push({ file: filePath, error: error.message });
  }
}

/**
 * 提取 JSON 中所有的 category
 */
function extractCategories(data, filePath, subject) {
  const isMath = subject === 'math';

  data.forEach(section => {
    if (isMath && section.section) {
      // 數學格式：有 section 層級
      section.section.forEach(subsection => {
        if (subsection.question) {
          subsection.question.forEach(q => {
            if (q.answers) {
              q.answers.forEach(answer => {
                if (answer.category !== undefined) {
                  recordCategory(answer.category, filePath, subject);
                }
              });
            }
          });
        }
      });
    } else if (!isMath && section.question) {
      // 國文格式：直接有 question
      section.question.forEach(q => {
        if (q.category !== undefined) {
          recordCategory(q.category, filePath, subject);
        }
      });
    }
  });
}

/**
 * 記錄 category 統計
 */
function recordCategory(category, filePath, subject) {
  const isMath = subject === 'math';
  const categorySet = isMath ? stats.mathCategories : stats.mandarinCategories;
  const implementedList = isMath ? IMPLEMENTED_MATH_CATEGORIES : IMPLEMENTED_MANDARIN_CATEGORIES;
  const unimplementedSet = isMath ? stats.unimplementedMath : stats.unimplementedMandarin;

  categorySet.add(category);

  // 檢查是否已實現
  if (!implementedList.includes(category)) {
    unimplementedSet.add(category);
  }

  // 記錄使用此 category 的文件
  if (!stats.filesByCategory[category]) {
    stats.filesByCategory[category] = [];
  }
  if (!stats.filesByCategory[category].includes(filePath)) {
    stats.filesByCategory[category].push(filePath);
  }
}

/**
 * 打印統計報告
 */
function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 JSON 文件和 Category 覆蓋率測試報告');
  console.log('='.repeat(80));

  console.log('\n📁 文件統計:');
  console.log(`   總文件數: ${stats.totalFiles}`);
  console.log(`   有效文件: ${stats.validFiles}`);
  console.log(`   錯誤文件: ${stats.errorFiles.length}`);

  if (stats.errorFiles.length > 0) {
    console.log('\n❌ 錯誤文件列表:');
    stats.errorFiles.forEach(({ file, error }) => {
      console.log(`   - ${path.basename(file)}: ${error}`);
    });
  }

  console.log('\n🔢 數學科目 Categories:');
  console.log(`   找到的類型: ${stats.mathCategories.size} 種`);
  console.log(`   已實現: ${IMPLEMENTED_MATH_CATEGORIES.length} 種`);
  Array.from(stats.mathCategories).sort().forEach(cat => {
    const count = stats.filesByCategory[cat]?.length || 0;
    const implemented = IMPLEMENTED_MATH_CATEGORIES.includes(cat);
    const status = implemented ? '✅' : '❌';
    const displayCat = cat === '' ? '(空字串)' : cat;
    console.log(`   ${status} ${displayCat.padEnd(25)} (${count} 個文件)`);
  });

  console.log('\n📖 國文科目 Categories:');
  console.log(`   找到的類型: ${stats.mandarinCategories.size} 種`);
  console.log(`   已實現: ${IMPLEMENTED_MANDARIN_CATEGORIES.length} 種`);
  Array.from(stats.mandarinCategories).sort().forEach(cat => {
    const count = stats.filesByCategory[cat]?.length || 0;
    const implemented = IMPLEMENTED_MANDARIN_CATEGORIES.includes(cat);
    const status = implemented ? '✅' : '❌';
    const displayCat = cat === '' ? '(空字串)' : cat;
    console.log(`   ${status} ${displayCat.padEnd(25)} (${count} 個文件)`);
  });

  if (stats.unimplementedMath.size > 0) {
    console.log('\n⚠️  未實現的數學 Categories:');
    Array.from(stats.unimplementedMath).forEach(cat => {
      const count = stats.filesByCategory[cat]?.length || 0;
      console.log(`   - ${cat} (${count} 個文件使用)`);
    });
  }

  if (stats.unimplementedMandarin.size > 0) {
    console.log('\n⚠️  未實現的國文 Categories:');
    Array.from(stats.unimplementedMandarin).forEach(cat => {
      const count = stats.filesByCategory[cat]?.length || 0;
      console.log(`   - ${cat} (${count} 個文件使用)`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('📈 覆蓋率總結:');
  const mathCoverage = ((stats.mathCategories.size - stats.unimplementedMath.size) / stats.mathCategories.size * 100).toFixed(1);
  const mandarinCoverage = ((stats.mandarinCategories.size - stats.unimplementedMandarin.size) / stats.mandarinCategories.size * 100).toFixed(1);
  console.log(`   數學科目覆蓋率: ${mathCoverage}%`);
  console.log(`   國文科目覆蓋率: ${mandarinCoverage}%`);

  const allCategoriesCount = stats.mathCategories.size + stats.mandarinCategories.size;
  const implementedCount = allCategoriesCount - stats.unimplementedMath.size - stats.unimplementedMandarin.size;
  const totalCoverage = (implementedCount / allCategoriesCount * 100).toFixed(1);
  console.log(`   總體覆蓋率: ${totalCoverage}%`);
  console.log('='.repeat(80) + '\n');

  // 返回是否完全覆蓋
  return stats.unimplementedMath.size === 0 && stats.unimplementedMandarin.size === 0;
}

// 主程序
const dataDir = path.join(__dirname, 'public', 'data');

if (!fs.existsSync(dataDir)) {
  console.error('❌ 找不到 public/data 目錄');
  process.exit(1);
}

console.log('🔍 開始掃描 JSON 文件...\n');

// 掃描數學和國文目錄
const mathDir = path.join(dataDir, 'math');
const mandarinDir = path.join(dataDir, 'mandarin');

if (fs.existsSync(mathDir)) {
  console.log('📊 掃描數學科目...');
  scanDirectory(mathDir, 'math');
}

if (fs.existsSync(mandarinDir)) {
  console.log('📖 掃描國文科目...');
  scanDirectory(mandarinDir, 'mandarin');
}

// 打印報告
const isFullyCovered = printReport();

// 退出碼：0 表示完全覆蓋，1 表示有未實現的類型
process.exit(isFullyCovered ? 0 : 1);

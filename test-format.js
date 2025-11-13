// 測試年級格式轉換
const gradeNames = ['', '一年級', '二年級', '三年級', '四年級', '五年級', '六年級'];

// 模擬點擊三年級上學期
const gradeId = '3';
const semesterIndex = 0;

const gradeName = gradeNames[parseInt(gradeId)];
const academicYear = semesterIndex === 0 ? '114' : '113';
const semesterName = semesterIndex === 0 ? '上學期' : '下學期';
const fullGrade = `${gradeName}\n${academicYear}${semesterName}`;

console.log('生成的 grade 格式:', fullGrade);
console.log('生成的 grade (JSON):', JSON.stringify(fullGrade));

// 測試 JSON 檔案的 key
const jsonKey = "三年級\n114上學期";
console.log('JSON 中的 key:', jsonKey);
console.log('JSON key (JSON):', JSON.stringify(jsonKey));

// 測試比對
const cleanKey = jsonKey.replace(/\n/g, '');
const cleanGrade = fullGrade.replace(/\n/g, '');

console.log('\n比對結果:');
console.log('cleanKey:', cleanKey);
console.log('cleanGrade:', cleanGrade);
console.log('相等嗎？', cleanKey === cleanGrade);

# 題型參考指南

這個文件列出所有已實現的題型及其 JSON 格式範例。

---

## 數學科目題型

### 1. text - 文字答案
```json
{
  "category": "text",
  "extras": {
    "decoration": "none",
    "texts": [
      ["6個燈"],
      ["略"]
    ]
  }
}
```

### 2. equation - 數學算式
```json
{
  "category": "equation",
  "extras": {
    "isParse": true,
    "items": [
      "10+4=14",
      "3+10=13"
    ]
  }
}
```

### 3. tablesOptional - 表格
```json
{
  "category": "tablesOptional",
  "extras": {
    "row": [
      ["項目", "數量"],
      ["西瓜", "4"],
      ["蘋果", "5"]
    ]
  }
}
```

### 4. checkbox - 勾選框
```json
{
  "category": "checkbox",
  "extras": {
    "showValue": false,
    "items": [
      [
        {
          "type": "text",
          "value": "選項A",
          "checked": "unchecked"
        },
        {
          "type": "text",
          "value": "選項B",
          "checked": "checked"
        }
      ]
    ]
  }
}
```

### 5. matching - 配對題
```json
{
  "category": "matching",
  "extras": {
    "layerWidgets": [
      ["項目1", "項目2"],
      ["答案1", "答案2"]
    ],
    "multiConnections": [
      [[0], [1]]
    ]
  }
}
```

### 6. tex - LaTeX 數學表達式
```json
{
  "category": "tex",
  "extras": {
    "tex": [
      ["5"],
      ["\\frac{6}{8}"],
      ["\\frac{11}{8}"]
    ]
  }
}
```

### 7. multiply - 乘法運算
```json
{
  "category": "multiply",
  "extras": {
    "items": ["算式1", "算式2"]
  }
}
```

### 8. division - 除法運算
```json
{
  "category": "division",
  "extras": {
    "items": ["算式1", "算式2"]
  }
}
```

### 9. regrouping - 進位/退位
```json
{
  "category": "regrouping",
  "extras": {
    "items": ["運算步驟"]
  }
}
```

### 10. short_division - 短除法
```json
{
  "category": "short_division",
  "extras": {
    "items": ["除法算式"]
  }
}
```

### 11. factorization - 因數分解
```json
{
  "category": "factorization",
  "extras": {
    "items": ["分解結果"]
  }
}
```

### 12-16. 度量類型
- **length** - 長度測量
- **weight** - 重量測量
- **capacity** - 容量測量
- **time** - 時間計算
- **money** - 金錢計算

```json
{
  "category": "length|weight|capacity|time|money",
  "extras": {
    "texts": [["答案值"]],
    "items": ["測量結果"]
  }
}
```

### 17. blocks - 積木/方塊
```json
{
  "category": "blocks",
  "extras": {
    "items": ["數量"],
    "texts": [["計算結果"]]
  }
}
```

### 18. circleMatching - 圈選配對
```json
{
  "category": "circleMatching",
  "extras": {
    "multiConnections": [[[0], [1]]]
  }
}
```

### 19. image - 圖形題
```json
{
  "category": "image",
  "extras": {}
}
```

---

## 國文科目題型

### 1. vocabulary - 詞彙題
```json
{
  "title": "1",
  "category": "vocabulary",
  "answers": ["走", "在", "左"]
}
```

### 2. vocabularyZhuyin / wordZhuyin - 詞彙注音題
```json
{
  "title": "1",
  "category": "vocabularyZhuyin",
  "answers": ["春", "天"],
  "zhuyin": [
    ["ㄔㄨㄣ"],
    ["ㄊㄧㄢ"]
  ]
}
```

### 3. matching - 配對連線
```json
{
  "category": "matching",
  "extras": {
    "layerCount": 2,
    "layerWidgets": [
      ["選項A", "選項B"],
      ["答案1", "答案2"]
    ],
    "multiConnections": [
      [[0], [1]]
    ]
  }
}
```

### 4. checkbox - 勾選框
```json
{
  "title": "1",
  "category": "checkbox",
  "extras": {
    "items": [
      [
        {
          "type": "text",
          "value": "選項文字",
          "checked": "checked"
        }
      ]
    ]
  }
}
```

---

## 資料結構差異

### 數學科目結構
```json
[
  {
    "title": "單元標題",
    "section": [
      {
        "title": "小節標題",
        "question": [
          {
            "title": "題號",
            "answers": [
              {
                "category": "類型",
                "extras": { }
              }
            ]
          }
        ]
      }
    ]
  }
]
```

### 國文科目結構
```json
[
  {
    "title": "題型標題",
    "subtitle": "副標題",
    "question": [
      {
        "title": "題號",
        "category": "類型",
        "answers": [],
        "zhuyin": []
      }
    ]
  }
]
```

---

## 特殊欄位說明

### decoration
文字裝飾樣式
- `"none"` - 無裝飾
- `"overline"` - 上劃線
- `"underline"` - 下劃線

### checked
勾選狀態
- `"checked"` - 已勾選 ✓
- `"unchecked"` - 未勾選 ○

### isParse
是否需要解析（用於 equation）
- `true` - 需要解析算式
- `false` - 直接顯示

### border
是否顯示邊框
- `true` - 顯示邊框
- `false` - 不顯示邊框

---

## 開發注意事項

1. **空值處理**: 所有題型都應該處理 `null`、`undefined`、空陣列的情況

2. **LaTeX 轉換**: `tex` 類型使用 `convertLatexToText()` 函數轉換

3. **注音顯示**: `zhuyin` 是二維陣列，需要用 `join('')` 連接

4. **多層結構**: 數學題有 `section` → `question` → `answers` 三層結構

5. **回退顯示**: 未知題型應顯示友善提示，並用 debug JSON 顯示原始資料

---

## 測試建議

測試新題型時，請確保：
- ✅ 正常數據顯示正確
- ✅ 空數據不報錯
- ✅ 格式異常有錯誤處理
- ✅ 樣式符合莫蘭迪色系
- ✅ 在平板上觸控友善

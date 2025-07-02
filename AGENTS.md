# 腦力激盪平台 - AI 開發者指南

## 專案概述

這是一個純前端的腦力激盪網站，允許用戶加入聊天室後進行問題創建、回答問題、點讚互動等功能。專案使用 CDN 版本的 JavaScript 套件，無需後端伺服器，所有資料通過 GUN.js 進行即時同步。

## 專案目標

### 核心功能
1. **用戶管理**
   - 支援匿名或實名加入聊天室
   - 用戶狀態持久化（localStorage）
   - 離開/重新加入功能

2. **問題管理**
   - 創建問題（標題+描述）
   - 問題列表顯示
   - 按讚數和時間排序
   - 問題點讚功能

3. **回答系統**
   - 針對特定問題回答
   - 回答點讚功能
   - 按讚數排序顯示

4. **即時同步**
   - 使用 GUN.js 實現即時資料同步
   - 多用戶協作支援

## 技術架構

### 前端技術棧
- **HTML5**: 語意化標記結構
- **CSS3**: 響應式設計 + Bootstrap 5.1.3
- **JavaScript ES6+**: 原生 JavaScript，物件導向設計
- **Bootstrap 5.1.3**: UI 框架 (CDN)
- **Font Awesome 6.0**: 圖標庫 (CDN)
- **GUN.js**: 分散式資料庫 (CDN)

### 資料結構

#### 用戶資料 (localStorage)
```javascript
{
  id: "unique_id",
  name: "用戶名稱",
  isAnonymous: true/false,
  joinedAt: "ISO_timestamp"
}
```

#### 問題資料 (GUN: brainstorm-questions)
```javascript
{
  id: "question_id",
  title: "問題標題",
  description: "問題描述",
  author: "作者名稱",
  authorId: "作者ID",
  createdAt: "ISO_timestamp",
  likes: 0,
  likedBy: { userId: true }
}
```

#### 回答資料 (GUN: brainstorm-answers)
```javascript
{
  id: "answer_id",
  questionId: "關聯問題ID",
  content: "回答內容",
  author: "作者名稱",
  authorId: "作者ID", 
  createdAt: "ISO_timestamp",
  likes: 0,
  likedBy: { userId: true }
}
```

## 檔案結構

```
brainstorm/
├── index.html          # 主頁面
├── styles.css          # 自訂樣式
├── app.js             # 主要應用程式邏輯
├── README.md          # 專案說明
└── AGENTS.md          # 本檔案 - AI 開發指南
```

## 當前進度

### ✅ 已完成功能
1. **基礎 UI 框架**
   - 響應式網頁佈局
   - Bootstrap 整合
   - 模態框和表單設計

2. **用戶系統**
   - 加入/離開聊天室
   - 匿名/實名選擇
   - 用戶狀態顯示

3. **問題管理**
   - 問題創建表單
   - 問題列表顯示
   - 問題選擇功能

4. **回答系統**
   - 回答輸入和提交
   - 回答列表顯示

5. **點讚系統**
   - 問題點讚功能
   - 回答點讚功能
   - 按讚數排序

6. **即時同步**
   - GUN.js 整合
   - 資料即時更新

### 🔄 開發中功能
- 點讚狀態的即時更新顯示
- 更完善的錯誤處理

### 📋 待開發功能
1. **進階功能**
   - 問題分類/標籤系統
   - 搜尋功能
   - 問題編輯/刪除
   - 回答編輯/刪除

2. **用戶體驗**
   - 更多動畫效果
   - 拖拽排序
   - 鍵盤快捷鍵

3. **管理功能**
   - 內容舉報機制
   - 管理員功能

## 開發指南

### 新 AI 開發者上手步驟

1. **了解專案結構**
   - 閱讀本檔案了解專案目標和架構
   - 檢查現有代碼的實作模式

2. **熟悉技術棧**
   - Bootstrap 5 組件使用
   - GUN.js API 和資料模型
   - JavaScript ES6+ 語法

3. **開發工作流程**
   - 在 `app.js` 中的 `BrainstormApp` 類別添加新功能
   - UI 修改在 `index.html` 和 `styles.css`
   - 確保所有功能支援即時同步
   - 測試匿名和實名用戶場景

### 重要設計原則

1. **純前端**: 不使用任何後端服務，所有功能通過前端實現
2. **即時性**: 所有資料變更須即時同步到所有客戶端
3. **用戶友善**: 支援匿名用戶，降低參與門檻
4. **響應式**: 確保在各種設備上都能正常使用
5. **可擴展**: 代碼結構清晰，便於添加新功能

### 常用 GUN.js 模式

```javascript
// 儲存資料
this.gun.get('collection').get('id').put(data);

// 讀取資料
this.gun.get('collection').get('id').once((data) => {
  // 處理資料
});

// 監聽資料變更
this.gun.get('collection').map().on((data, key) => {
  // 即時更新 UI
});
```

### 測試建議

1. **多瀏覽器測試**: 開啟多個瀏覽器視窗模擬多用戶
2. **匿名/實名測試**: 測試兩種用戶模式的互動
3. **網路中斷測試**: 測試離線/重連情況
4. **大量資料測試**: 測試問題和回答數量較多時的效能

## 部署說明

由於是純前端專案，可以部署到任何靜態檔案服務：

1. **GitHub Pages**: 免費，適合開源專案
2. **Netlify**: 功能豐富，支援 CDN
3. **Vercel**: 快速部署，良好效能
4. **本地測試**: 使用 Live Server 或 http-server

## 故障排除

### 常見問題

1. **GUN.js 連接問題**
   - 檢查網路連接
   - 確認 GUN 伺服器狀態
   - 考慮更換 GUN 伺服器節點

2. **資料同步延遲**
   - GUN.js 的分散式特性可能導致輕微延遲
   - 可以添加載入指示器改善用戶體驗

3. **瀏覽器兼容性**
   - 確保目標瀏覽器支援 ES6+
   - 考慮添加 polyfill

## 聯絡資訊

專案建立日期：2025年7月2日
最後更新：2025年7月2日

---

**注意**: 這是一個純前端專案，請勿引入需要伺服器端支援的功能。所有新功能都應該通過前端技術和 GUN.js 實現。


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeDataService } from './services/dataFetchService';

// 初始化数据服务（只在应用启动时执行一次）
initializeDataService().catch(error => {
    console.error('数据服务初始化失败:', error);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

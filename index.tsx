
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeDataService } from './services/dataFetchService';

// 初始化数据服务（只在应用启动时执行一次）
initializeDataService();

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

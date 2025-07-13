// 文件: src/embed.ts (新建)
(window as any).global = window;
var exports = {};
import '../public/lib/chatui_icons_2.6.2.js'; // 引入 ChatUI 图标库
import '../public/lib/lib.js'; // 引入公共库

import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatDialog from './components/ChatDialog'; // 假设你的主组件在这里
// import './styles/index.less'; // 引入你的主样式文件
import './index.css'; // 全局样式
// import './styles/chatui-theme.css'; // ChatUI 主题样式
import './lib/src/styles/index.less';

// 定义一个全局唯一的对象，避免直接污染 window
const AliChatEmbed = {
  render: (containerId: string, props: any) => {
    const container = document.getElementById(containerId);
    if (container) {
      const root = ReactDOM.createRoot(container);
      // 将 root 实例附加到 DOM 元素上，方便后续卸载
      (container as any)._reactRoot = root; 
      root.render(
        <React.StrictMode>
          <ChatDialog {...props} />
        </React.StrictMode>
      );
    } else {
      console.error(`[AliChatEmbed] Container with id "${containerId}" not found.`);
    }
  },
  unmount: (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container && (container as any)._reactRoot) {
      (container as any)._reactRoot.unmount();
      delete (container as any)._reactRoot;
    }
  }
};

// 将我们的 API 挂载到 window 对象上
(window as any).AliChatEmbed = AliChatEmbed;


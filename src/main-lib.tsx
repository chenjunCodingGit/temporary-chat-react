import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatDialog from './components/ChatDialog'; // 确保路径正确
import './index.css'; // 全局样式
// import './styles/chatui-theme.css'; // ChatUI 主题样式
import './lib/src/styles/index.less';

// 如果 ChatDialog 有自己的模块化 CSS，也需要引入，或者在 ChatDialog.tsx 内部处理

// 定义一个全局函数，用于在目标页面渲染 ChatDialog 组件
// @ts-ignore  // 忽略 TypeScript 对 window 对象扩展的检查
window.renderChatDialog = (containerId: string, props?: any) => {
    const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window as any;
    console.log('OmnichannelChatSDK: ', OmnichannelChatSDK);

    const container = document.getElementById(containerId);
    if (container) {
        const root = ReactDOM.createRoot(container);
        // 使用 HashRouter 包裹 ChatDialog，如果它内部依赖路由功能
        // 注意：如果 ChatDialog 本身不直接使用路由，或者路由是由外部App.tsx管理的，
        // 这里可能不需要 HashRouter。根据你的 ChatDialog.tsx 实现来决定。
        // 如果 ChatDialog 内部使用了 useLocation, useNavigate 等 hooks，则需要 RouterProvider。
        // 简单起见，如果 ChatDialog 是一个独立的UI组件，不依赖特定路由上下文，可以直接渲染。
        root.render(
            <React.StrictMode>
                <ChatDialog {...props} />
            </React.StrictMode>
        );
    } else {
        console.error(`Container with id "${containerId}" not found.`);
    }
};

// @ts-ignore
window.unmountChatDialog = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
        // ReactDOM.unmountComponentAtNode 在 React 18 中已废弃
        // 需要获取 root 然后调用 unmount
        // 这需要你在 renderChatDialog 时保存 root 实例，或者重新获取它（如果可能）
        // 简单起见，这里我们假设 ChatDialog 会自己处理卸载逻辑，或者直接清空容器
        const root = (container as any)._reactRootContainer; // 这是一个内部属性，不推荐生产使用
        if (root && root.unmount) {
            root.unmount();
        } else {
            // Fallback: 直接清空容器内容
            container.innerHTML = '';
        }
    } else {
        console.error(`Container with id "${containerId}" not found for unmounting.`);
    }
};


// 你也可以选择导出一个对象包含这些方法
export const ChatLib = {
    // @ts-ignore
    render: window.renderChatDialog,
    // @ts-ignore
    unmount: window.unmountChatDialog,
};

// 为了让 TypeScript 编译器知道这些全局函数，你可以在项目的 .d.ts 文件中声明它们
// 例如，在 src/vite-env.d.ts 中添加：
/*
interface Window {
  renderChatDialog: (containerId: string, props?: any) => void;
  unmountChatDialog: (containerId: string) => void;
}
*/

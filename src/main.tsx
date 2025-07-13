// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import './lib/chatui/core/dist/index.css';
import './lib/src/styles/index.less';
// import './styles/chatui-theme.css'

const sleep = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

const { VITE_CHATSDK_ORG_ID } = import.meta.env;
const { VITE_CHATSDK_ORG_URL } = import.meta.env;
const { VITE_CHATSDK_WIDEGT_ID } = import.meta.env;

const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window as any;
console.log('OmnichannelChatSDK: ', OmnichannelChatSDK);

const chatSDK = new OmnichannelChatSDK.default({
  orgId: VITE_CHATSDK_ORG_ID,
  orgUrl: VITE_CHATSDK_ORG_URL,
  widgetId: VITE_CHATSDK_WIDEGT_ID,
});

await chatSDK.initialize();
await chatSDK.startChat();

// console.table(await chatSDK.getMessages());

createRoot(document.getElementById('root')!).render(
    <App />,
  // <StrictMode>
  // </StrictMode>
)

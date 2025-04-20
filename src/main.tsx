import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@chatui/core/dist/index.css';
import './styles/chatui-theme.css'

const {OmnichannelChatSDK_1: OmnichannelChatSDK } = window as any;
console.log('OmnichannelChatSDK: ', OmnichannelChatSDK);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

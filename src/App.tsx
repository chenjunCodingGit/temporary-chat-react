import { useState } from 'react';
import ChatDialog from './components/ChatDialog';
import aiChatSVG from './assets/ai-chat.svg';
import styles from './App.module.css';
import viteLogo from '/vite.svg'

const { VITE_APP_TITLE } = import.meta.env;

export default function () {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className={styles.App}>
      <div>{VITE_APP_TITLE}</div>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      {
        !isChatOpen && (
          <img className={styles["float-play-btn"]} onClick={toggleChat} src={aiChatSVG} alt="ChatBot AI" />
        )
      }
      <ChatDialog isOpen={isChatOpen} onClose={toggleChat} />
    </div>
  );
}
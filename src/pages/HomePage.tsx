// src/pages/HomePage.tsx
import { useState } from 'react';
import styles from '../App.module.css'; // Import CSS module
import aiChatSVG from '../assets/ai-chat.svg';
import ChatDialog from '../components/ChatDialog'; // Import ChatDialog component

const HomePage = () => {

  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Home Page</h1>
      <p className="text-gray-600">This is the main content of the home page.</p>
      {
        !isChatOpen && (
          <img className={styles["float-play-btn"]} onClick={toggleChat} src={aiChatSVG} alt="ChatBot AI" />
        )
      }
      <ChatDialog isOpen={isChatOpen} onClose={toggleChat} />
    </div>
  );
};

export default HomePage;
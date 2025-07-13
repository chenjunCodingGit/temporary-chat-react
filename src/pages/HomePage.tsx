// src/pages/HomePage.tsx
import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../utils/authConfig'; // Import loginRequest from authConfig
import styles from '../App.module.css'; // Import CSS module
import aiChatSVG from '../assets/ai-chat.svg';
import ChatDialog from '../components/ChatDialog'; // Import ChatDialog component

const HomePage = () => {
  const { instance } = useMsal();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
      window.location.href = '/profile';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="jumbotron">
        <h1 className="display-4">OAuth2.0 Demo</h1>
        <p className="lead">使用 Microsoft 账号登录</p>
        <hr className="my-4" />
        <button  onClick={handleLogin}>
          登录
        </button>
      </div>
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
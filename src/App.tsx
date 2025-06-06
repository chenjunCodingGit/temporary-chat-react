import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid'; // For generating unique IDs
import { jwtDecode } from "jwt-decode"; // To decode JWT token from Google
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import Chat, { Bubble, useMessages, MessageProps } from '@chatui/core';
import '@chatui/core/dist/index.css';
import './styles/chatui-theme.css';
import './index.css';
import aiChatSVG from './assets/ai-chat.svg';

import ChatDialog from './components/ChatDialog';
import styles from './App.module.css'; // Import CSS module

// Define the structure for user profile
interface UserProfile {
  email: string;
  name: string;
  picture?: string;
}

const App: React.FC = () => {
  const { messages, appendMsg } = useMessages([]);
  const [showChat, setShowChat] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const { VITE_GOOGLE_CLIENT_ID } = import.meta.env;

  const googleClientId = VITE_GOOGLE_CLIENT_ID;

  // Handle successful Google login
  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    console.log('Login Success:', credentialResponse);
    if (credentialResponse.credential) {
      try {
        const decodedToken: any = jwtDecode(credentialResponse.credential);
        console.log('Decoded Token:', decodedToken);
        setUserProfile({
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture,
        });
        setIsAuthenticated(true);
        setShowChat(true); // Show chat after successful login
        appendMsg({
          type: 'text',
          content: { text: `欢迎回来, ${decodedToken.name}!` },
          user: { avatar: decodedToken.picture || undefined }, // Use Google profile picture
          _id: nanoid(),
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        appendMsg({
          type: 'text',
          content: { text: '登录凭证解析失败，请重试。' },
          _id: nanoid(),
        });
      }
    } else {
      console.error('No credential in response');
      appendMsg({
        type: 'text',
        content: { text: '登录失败，未收到凭证，请重试。' },
        _id: nanoid(),
      });
    }
  };

  // Handle Google login failure
  const handleLoginError = () => {
    console.error('Login Failed');
    setIsAuthenticated(false);
    setUserProfile(null);
    appendMsg({
      type: 'text',
      content: { text: 'Google 登录失败，请检查您的网络或稍后重试。' },
      _id: nanoid(),
    });
  };

  // Function to handle sending messages
  async function handleSend(type: string, val: string) {
    if (type === 'text' && val.trim()) {
      appendMsg({
        type: 'text',
        content: { text: val },
        position: 'right',
        user: { avatar: userProfile?.picture || undefined }, // User's avatar
        _id: nanoid(),
      });

      // Simulate an API call or bot response
      // In a real app, you would send `val` to your backend/chatbot service
      setTimeout(() => {
        appendMsg({
          type: 'text',
          content: { text: `机器人回复: "${val}"` },
          user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwYj1gK0jSZFuXXcr0XXa-512-512.png' }, // Bot's avatar
          _id: nanoid(),
        });
      }, 1000 + Math.random() * 1000);
    }
  }

  // Function to render messages
  function renderMessageContent(msg: MessageProps) {
    const { type, content } = msg;
    switch (type) {
      case 'text':
        return <Bubble content={content.text} />;
      default:
        return null;
    }
  }

  useEffect(() => {
    // Initial greeting message when chat becomes visible
    if (showChat && isAuthenticated && userProfile) {
      // Messages are already handled in login success
    } else if (!isAuthenticated) {
      appendMsg({
        type: 'text',
        content: { text: '您好！请先登录Google账户以开始聊天。' },
        _id: nanoid(),
      });
    }
  }, [showChat, isAuthenticated, userProfile]); // Removed appendMsg from dependencies


  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className={styles.appContainer}>
        <header className={styles.appHeader}>
          <h1>我的聊天应用</h1>
          {isAuthenticated && userProfile && (
            <div className={styles.userInfo}>
              {userProfile.picture && (
                <img src={userProfile.picture} alt={userProfile.name} className={styles.profilePic} />
              )}
              <span>欢迎, {userProfile.name} ({userProfile.email})</span>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setUserProfile(null);
                  setShowChat(false); // Hide chat on logout
                  // Optionally, you can also use googleLogout() from @react-oauth/google
                  // import { googleLogout } from '@react-oauth/google';
                  // googleLogout();
                  console.log("User logged out");
                  // Clear messages or add a logout message
                  // setMessages([]); // Example: clear messages
                  appendMsg({
                    type: 'text',
                    content: { text: '您已退出登录。' },
                    _id: nanoid(),
                  });
                }}
                className={styles.logoutButton}
              >
                退出登录
              </button>
            </div>
          )}
        </header>

        {!isAuthenticated && (
          <div className={styles.loginContainer}>
            <p>请使用您的 Google 账户登录:</p>
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              useOneTap // Enables One Tap login if available
            />
          </div>
        )}

        {showChat && isAuthenticated && (
          <div className={styles.chatWrapper}>
            <Chat
              navbar={{ title: '聊天机器人' }}
              messages={messages}
              renderMessageContent={renderMessageContent}
              onSend={handleSend}
              locale="zh-CN" // Set locale to Chinese
              placeholder="请输入您想发送的消息..." // Placeholder for input
            />
          </div>
        )}

        {!showChat && !isAuthenticated && (
          <div className={styles.placeholderChat}>
            <p>登录后将在此处显示聊天界面。</p>
          </div>
        )}
      </div>
      {
        !isChatOpen && (
          <img className={styles["float-play-btn"]} onClick={toggleChat} src={aiChatSVG} alt="ChatBot AI" />
        )
      }
      <ChatDialog isOpen={isChatOpen} onClose={toggleChat} />
    </GoogleOAuthProvider>
  );
};

export default App;

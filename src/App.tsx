import { useState } from 'react';
import { GoogleLogin } from 'react-google-login';
import axios from 'axios';
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

  const resSuccessGoogle = (response: any) => {
    console.log('response: ', response);
    const { code } = response;
    axios.post('/api/create-tokens', { code })
      .then(res => {
        console.log('res: ', res);
        if (res.data.success) {
          console.log('Login successful!');
        } else {
          console.log('Login failed!');
        }
      })
      .catch(err => {
        console.error('Error during login:', err);
      });
  }

  const resFailureGoogle = (err: any) => {
    console.log('err: ', err);
  }

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
        <GoogleLogin
          clientId="641028587481-0g3e663i76i3lffcjd57oi7uekn42ae5.apps.googleusercontent.com"
          buttonText="Calendar for OAuth2.0 Login"
          onSuccess={resSuccessGoogle}
          onFailure={resFailureGoogle}
          cookiePolicy={'single_host_origin'}

          responseType='code'
          accessType='offline'
          scope='openid email profile https://www.googleapis.com/auth/calendar'
        />
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
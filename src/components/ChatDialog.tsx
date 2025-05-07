// src/components/ChatDialog.tsx
import React, { useState, useEffect } from 'react';
// @ts-ignore
// import Chat, { Icon, IconButton, Bubble, useMessages, FileCard, Card, CardMedia, CardTitle, CardText, CardActions, Button, Navbar, Input, Skeleton } from '../lib/chatui/core/es/index';
import Chat, { Icon, IconButton, Bubble, useMessages, FileCard, Card, CardMedia, CardTitle, CardText, CardActions, Button, Navbar, Input, Skeleton } from '../lib/src/index';
import chatbotAvatarSVG from '../assets/chatbot-avatar.svg';
import styles from '../styles/ChatDialog.module.css';
import { RateActions } from './RateActions'

const initialMessages = [
  {
    type: 'system',
    content: { text: 'Chatbot AI at your service.' },
  },
  {
    type: 'text',
    content: { text: 'Hi, I am your exclusive intelligent assistant. Please feel free to contact me if you have any questions.' },
    user: {
      avatar: chatbotAvatarSVG,
    },
  },
];

const defaultQuickReplies = [
  {
    icon: 'message',
    name: 'Manual service',
    isNew: true,
    isHighlight: true,
  },
  {
    name: 'Custom Question 1',
    isNew: true,
  },
  {
    name: 'Custom Question 2',
    isHighlight: true,
  },
  {
    name: 'Custom Question 3',
  },
];

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatDialog: React.FC<ChatDialogProps> = ({
  isOpen,
  onClose
}) => {

  const { messages, appendMsg } = useMessages(initialMessages);
  const [chatDialogClass, setChatDialogClass] = useState('');
  const [initChatLoading, setInitChatLoading] = useState(true);
  const [preChatSurveyFlag, setPreChatSurveyFlag] = useState(true);
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [value3, setValue3] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setInitChatLoading(false);
    }, 2000);

    if (isOpen) {
      setChatDialogClass(styles.open);
    } else {
      setChatDialogClass('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }


  // 发送回调
  function handleSend(type: string, val: string) {
    if (type === 'text' && val.trim()) {
      appendMsg({
        type: 'text',
        content: { text: val },
        position: 'right',
      });

      // TODO: 发送请求
      // 模拟回复消息
      setTimeout(() => {
        appendMsg({
          type: 'text',
          content: { text: 'Please briefly describe your problem.' },
          user: {
            avatar: chatbotAvatarSVG,
          },
        });
      }, 1000);
    }
  }

  const handleFileSelected = (file: File, fileInfo: { name: string; extension: string; size: number; }) => {
    console.log('file', file);
    console.log('fileInfo', fileInfo);

    // 这里可以根据文件类型和大小进行判断
    // 例如：只允许上传图片文件
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const fileExtension = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (allowedTypes.includes(fileExtension) && file.size <= maxSize) {
      // 发送图片消息
      appendMsg({
        type: 'file',
        content: {
          file: {
            name: fileInfo.name,
            extension: fileExtension,
            size: fileInfo.size,
            url: URL.createObjectURL(file), // 这里可以使用 URL.createObjectURL(file) 来预览图片
          },
        },
        position: 'right',
      });
    }
  }

  // 快捷短语回调，可根据 item 数据做出不同的操作，这里以发送文本消息为例
  function handleQuickReplyClick(item: { name: any; }) {
    handleSend('text', item.name);
  }

  function renderMessageContent(msg: { type: any; content?: any; position?: string; }) {
    console.log('msg', msg);
    const { type, content } = msg;

    // 根据消息类型来渲染
    switch (type) {
      case 'text':
        return content?.text ? (
          <div style={{ display: 'flex' }}>
            <Bubble
              style={{ textAlign: 'left' }}
              content={content.text} />{
              msg.position === 'left' ?
                <div style={{ position: 'relative', left: '-40px', top: '2px' }}>
                  <RateActions
                    upTitle="Like"
                    downTitle="Unlike"
                    onClick={(val: string) => {
                      console.log(val);
                    }}
                  />
                </div>
                : null
            }

          </div>
        )
          : null;
      case 'image':
        return content?.picUrl ? (
          <Bubble type="image">
            <img src={content.picUrl} alt="" />
          </Bubble>
        ) : null;
      case 'file':
        return content?.file ? (
          <FileCard
            file={content?.file}
            extension={content?.file.extension}
          >
            <a href="#">Download</a>
          </FileCard>
        ) : null;
      default:
        return null;
    }
  }

  const handleCloseDialog = () => {
    // setChatDialogClass('');
    onClose();
  }

  return (
    <div className={`${styles.chatDialogWrapper} ${chatDialogClass}`}>
      <div className={styles.chatDialog}>
        <button className={styles.closeBtn} onClick={onClose}>
          X
        </button>
        {
          initChatLoading ? (
            <div>
              <Navbar
                title="ChatBot AI"
                rightContent={[
                  {
                    icon: 'close',
                    onClick: handleCloseDialog,
                  },
                ]}
              />
              <div className={styles.loadingContainer}>
                <Skeleton h={140} w="85%" r="sm" />
              </div>
              <div style={{ height: '10px', width: '100%' }}></div>
              <div className={styles.loadingContainer}>
                <Skeleton h={40} w="85%" r="sm" />
              </div>
            </div>
          ) :

            (
              preChatSurveyFlag ? (
                <div>
                  <Navbar
                    title="ChatBot AI"
                    rightContent={[
                      {
                        icon: 'close',
                        onClick: handleCloseDialog,
                      },
                    ]}
                  />
                  <div className={styles.loadingContainer}>
                    <Card
                      className="preChatCard"
                      fluid
                    >
                      <div style={{ marginLeft: '12px', marginTop: '0px' }}>
                        <CardText textPosition="left">
                          Please answer below questions.
                        </CardText>
                      </div>
                      <CardTitle className="CardTitle-Text-Left">Email</CardTitle>
                      <div style={{ width: '85%', marginLeft: '12px' }}>
                        <Input value={value1} onChange={val => setValue1(val)} placeholder="Please input..." />
                      </div>
                      <CardTitle className="CardTitle-Text-Left">First Name</CardTitle>
                      <div style={{ width: '85%', marginLeft: '12px' }}>
                        <Input value={value2} onChange={val => setValue2(val)} placeholder="Please input..." />
                      </div>
                      <CardTitle className="CardTitle-Text-Left">Last Name</CardTitle>
                      <div style={{ width: '85%', marginLeft: '12px' }}>
                        <Input value={value3} onChange={val => setValue3(val)} placeholder="Please input..." />
                      </div>
                      <CardActions>
                        <Button
                          onClick={() => setPreChatSurveyFlag(false)}
                        >Cancel</Button>
                        <Button
                          onClick={() => setPreChatSurveyFlag(false)}
                          color="primary"
                        >Submit</Button>
                      </CardActions>
                    </Card>
                  </div>
                </div>
              ) : (
                <Chat
                  locale="en-US"
                  navbar={{
                    title: 'ChatBot AI',
                    className: styles.navbarStyle,
                    rightContent: [
                      {
                        icon: 'close',
                        onClick: handleCloseDialog,
                      },
                    ],
                    // rightSlot: <Icon type="close" onClick={handleCloseDialog} />
                  }}
                  messages={messages}
                  placeholder='please enter your message'
                  renderMessageContent={renderMessageContent}
                  quickReplies={defaultQuickReplies}
                  onQuickReplyClick={handleQuickReplyClick}
                  onSend={handleSend}
                  onFileSelected={handleFileSelected}
                />
              )
            )
        }
      </div>
    </div>
  );
};

export default ChatDialog;

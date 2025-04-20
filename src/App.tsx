import Chat, { Bubble, useMessages } from '@chatui/core';
import chatbotAvatar from './assets/chatbot-avatar.svg';

const initialMessages = [
  {
    type: 'system',
    content: { text: 'Chatbot AI at your service.' },
  },
  {
    type: 'text',
    content: { text: 'Hi, I am your exclusive intelligent assistant. Please feel free to contact me if you have any questions.' },
    user: {
      avatar: chatbotAvatar,
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

export default function() {
  const { messages, appendMsg } = useMessages(initialMessages);

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
        });
      }, 1000);
    }
  }

  // 快捷短语回调，可根据 item 数据做出不同的操作，这里以发送文本消息为例
  function handleQuickReplyClick(item: { name: any; }) {
    handleSend('text', item.name);
  }

  function renderMessageContent(msg: { type: any; content?: any; }) {
      const { type, content } = msg;
  
      // 根据消息类型来渲染
      switch (type) {
        case 'text':
          return content?.text ? <Bubble content={content.text} /> : null;
        case 'image':
          return content?.picUrl ? (
            <Bubble type="image">
              <img src={content.picUrl} alt="" />
            </Bubble>
          ) : null;
        default:
          return null;
      }
    }

  return (
    <Chat
    locale="en-US"
      navbar={{ title: 'ChatBot AI' }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      quickReplies={defaultQuickReplies}
      onQuickReplyClick={handleQuickReplyClick}
      onSend={handleSend}
    />
  );
}
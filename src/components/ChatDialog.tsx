// src/components/ChatDialog.tsx
import React, { useState, useEffect } from 'react';
import Chat, { Icon, IconButton, Bubble, useMessages } from '@chatui/core';
import chatbotAvatarSVG from '../assets/chatbot-avatar.svg';
import styles from '../styles/ChatDialog.module.css';

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

const ChatDialog: React.FC<ChatDialogProps> = ({ isOpen, onClose }) => {

	const { messages, appendMsg } = useMessages(initialMessages);
	const [chatDialogClass, setChatDialogClass] = useState('');

	useEffect(() => {
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
				/>
			</div>
		</div>
	);
};

export default ChatDialog;

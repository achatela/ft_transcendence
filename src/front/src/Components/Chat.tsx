import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import "./css/Chat.css"

interface FriendsProps {
  chat: { room: string, messages: [{ senderId: string, text: string, time: string }] }
}

function useChatScroll<T>(dep: T): React.MutableRefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dep]);

  return ref;
}

const Chat: React.FC<FriendsProps> = ({ chat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>(chat.messages.map((msg) => msg.text));
  const messagesRef = useChatScroll(messages);
  const socket = io('http://localhost:3333');
  const ref = useRef(null);

  useEffect(() => {
    console.log(messages)

    const element = ref.current;
    element.addEventListener('keypress', handleSendMessage);
    // const socket = io('http://localhost:3333');
    socket.on('connect', () => {
      console.log(socket.id, 'connected to the server');
      socket.emit('joinRoom', { room: chat.room });
    });
    socket.on('joinRoom', (name) => {
      console.log(name, 'joined', chat.room);
    });
    socket.on('message', (message: { senderId: string, text: string, time: string }) => {
      console.log("received a message from socket", message)
      setMessages(messages => [...messages, message.text]);
    });

    return () => {
      element.removeEventListener('keypress', handleSendMessage);
    };
  }, []);

  const handleSendMessage = (event: any) => {
    if (event.key === 'Enter') {
      if (event.target.value === "")
        return;
      socket.emit('message', { room: chat.room, senderUsername: sessionStorage.getItem("username"), message: event.target.value });
      setMessage('');
    }
  };

  return (
    <div>
      <h1 className="chat-title">Chat Application</h1>
      <div ref={messagesRef} className="chat-messages">
        {messages.map((msg, index) => (
          <div className="chat-message" key={index}>
            <div className="chat-avatar"></div>
            <p className="chat-username">Username<span> - 02/02/23, 23h23</span></p>
            <p className="chat-message-content">{msg}</p>
          </div>
        ))}

      </div>
      <input ref={ref} className="chat-input" type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
    </div>
  );
}

export default Chat;

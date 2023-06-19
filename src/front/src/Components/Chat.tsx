import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import "./css/Chat.css"

interface FriendsProps {
  chat: {room: string, messages: string[]}
}

const Chat: React.FC<FriendsProps> = ({ chat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>(chat.messages);
  const socket = io('http://localhost:3333');

  useEffect(() => {
    // const socket = io('http://localhost:3333');
    socket.on('connect', () => {
      console.log(socket.id, 'connected to the server');
      socket.emit('joinRoom', {room: chat.room});
    });
    socket.on('joinRoom', (name) => {
      console.log(name, 'joined', chat.room);
    });
    // socket.on('disconnect', () => {
    //   console.log('Disconnected from WebSocket server');
    // });
    socket.on('message', (message: string) => {
      setMessages(messages => [...messages, message]);
    });
  }, []);

  const handleSendMessage = () => {
    socket.emit('message', {room: chat.room, senderUsername: sessionStorage.getItem("username"), message: message});
    // console.log(socket.id);
    setMessage('');
  };

  return (
    <div>
      <h1 className="chat-title">Chat Application</h1>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div className="chat-message" key={index}>{msg}</div>
        ))}
      </div>
      <input className="chat-input" type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button className="chat-button" onClick={handleSendMessage}>Send</button>
    </div>
  );
}

export default Chat;

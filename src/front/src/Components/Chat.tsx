import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import "./css/Chat.css"

const socket = io('http://localhost:3333');

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // const socket = io('http://localhost:3333');
    // socket.on('connect', () => {
    //   console.log('Connected to WebSocket server');
    // });
    // socket.on('disconnect', () => {
    //   console.log('Disconnected from WebSocket server');
    // });
    socket.on('message', (message: string) => {
      setMessages(messages => [...messages, message]);
    });
  }, []);

  const handleSendMessage = () => {
    socket.emit('message', message);
    console.log(messages)
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

import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://localhost:3133');

interface ChatProps {
  userId: number;
}

const Chat: React.FC<ChatProps> = ({ userId }) => {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // socket.on('chat', (chat) => {
    // setChat(chat);
    // });

    // return () => {
    // socket.off('chat');
    // };
  }, []);

  const sendMessage = () => {
    // socket.emit('chat', { message, userId });
    setMessage('');
  };

  return (
    <div>
      <h2>Chat</h2>
      <ul>
        {chat.map((message) => (
          <li key={message.id}>
            <strong>{message.user.name}: </strong>
            {message.text}
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;

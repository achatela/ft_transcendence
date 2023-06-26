import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import "./css/Chat.css"

interface FriendsProps {
  chat: { room: string, messages: [{ senderId: string, text: string, time: string, username: string, avatar: string }] }
  isChannel: boolean;
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

const Chat: React.FC<FriendsProps> = ({ chat, isChannel }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const messagesRef = useChatScroll(messages);
  const socket = io('http://localhost:3333');
  const ref = useRef(null);

  useEffect(() => {
    if (isChannel == false) {
      console.log("chat is a private chat")
      const element = ref.current;
      for (let i = 0; i < chat.messages.length; i++) {
        setMessages(messages => [...messages, { senderId: chat.messages[i].senderId, text: chat.messages[i].text, time: chat.messages[i].time, username: chat.messages[i].username, avatar: chat.messages[i].avatar }]);
      }
      element.addEventListener('keypress', handleSendMessage);
      // const socket = io('http://localhost:3333');
      socket.on('connect', () => {
        console.log(socket.id, 'connected to the server');
        socket.emit('joinRoom', { room: chat.room });
      });
      socket.on('joinRoom', (name) => {
        console.log(name, 'joined', chat.room);
      });
      socket.on('message', (message: { senderId: string, text: string, time: string, username: string, avatar: string }) => {
        console.log("received a message from socket", message)
        setMessages(messages => [...messages, { senderId: message.senderId, text: message.text, time: message.time, username: message.username, avatar: message.avatar }]);
      });

      return () => {
        setMessages([]);
        setMessage('');
        socket.disconnect();
        element.removeEventListener('keypress', handleSendMessage);
      };
    }
    else {
      console.log("chat is a channel")
      const element = ref.current;
      for (let i = 0; i < chat.messages.length; i++) {
        setMessages(messages => [...messages, { senderId: chat.messages[i].senderId, text: chat.messages[i].text, time: chat.messages[i].time, username: chat.messages[i].username, avatar: chat.messages[i].avatar }]);
      }
      element.addEventListener('keypress', handleSendMessage);
      socket.on('connect', () => {
        console.log(socket.id, 'connected to the server');
        socket.emit('joinRoomChannel', { room: chat.room });
      });
      socket.on('joinRoomChannel', (name) => {
        console.log(name, 'joined', chat.room);
      });
      socket.on('messageChannel', (message: { senderId: string, text: string, time: string, username: string, avatar: string }) => {
        console.log("received a message from socket", message)
        setMessages(messages => [...messages, { senderId: message.senderId, text: message.text, time: message.time, username: message.username, avatar: message.avatar }]);
      });

      return () => {
        setMessages([]);
        setMessage('');
        socket.disconnect();
        element.removeEventListener('keypress', handleSendMessage);
      }
    }
  }, [chat]);

  const handleSendMessage = (event: any) => {
    if (event.key === 'Enter') {
      if (event.target.value === "")
        return;
      if (isChannel == false)
        socket.emit('message', { room: chat.room, senderUsername: sessionStorage.getItem("username"), message: event.target.value });
      else
        socket.emit('messageChannel', { room: chat.room, senderUsername: sessionStorage.getItem("username"), message: event.target.value });
      setMessage('');
    }
  };

  function reformatTime(time: string): string {
    return (time.slice(5, 7) + "-" + time.slice(8, 10) + "-" + time.slice(2, 4) + " " + time.slice(11, 19))
  }

  return (
    < div >
      <h1 className="chat-title">Chat Application</h1>
      <div ref={messagesRef} className="chat-messages">
        {messages.map((msg, index) => (
          <div className="chat-message" key={index}>
            <div className="chat-avatar" style={{ backgroundImage: `url(${msg.avatar})` }}></div>
            <p className="chat-username">{msg.username}<span>&nbsp; &nbsp; &nbsp; {reformatTime(msg.time)}</span></p>
            <p className="chat-message-content">{msg.text}</p>
          </div>
        ))}
      </div>
      <input ref={ref} className="chat-input" type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
    </div >
  );
}

export default Chat;

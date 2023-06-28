import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import "./css/Chat.css"
import axios from 'axios';

interface FriendsProps {
  chat: { room: string, messages: [{ senderId: string, text: string, time: string, username: string, avatar: string }] }
  isChannel: boolean;
  isSelected: string;
  blockedIds: number[];
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

const Chat: React.FC<FriendsProps> = ({ chat, isChannel, isSelected, blockedIds }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const messagesRef = useChatScroll(messages);
  const socket = io('http://localhost:3333');
  const ref = useRef(null);
  const channelName = isSelected;
  const [contextMenu, setContextMenu] = useState({ show: false, username: '', position: { x: 0, y: 0 } });

  useEffect(() => {
    console.log("useEffect in Chat.tsx", isChannel)
    if (isChannel == false) {
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
  }, [chat, contextMenu.show, contextMenu.position.x, contextMenu.position.y, isChannel]);

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
    // 2020-12-01T12:00:00.000Z to 12-01-20 14:00:00
    let date = time.split('T')[0];
    let hour = time.split('T')[1].split('.')[0];
    let year = date.split('-')[0].substring(2, 4);
    let month = date.split('-')[1];
    let day = date.split('-')[2];
    let hour2 = hour.split(':')[0];
    let minute = hour.split(':')[1];
    let second = hour.split(':')[2];
    let hour3 = (parseInt(hour2) + 2).toString();
    if (hour3.length === 1)
      hour3 = "0" + hour3;
    return month + "-" + day + "-" + year + " " + hour3 + ":" + minute + ":" + second;
  }

  async function goToProfile(event: React.MouseEvent<HTMLDivElement>): Promise<void> {
    const request = await axios.post(
      "http://localhost:3333/social/get_friend_id/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        friendUsername: sessionStorage.getItem('tmpUsername'),
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      sessionStorage.removeItem('tmpUsername');
      window.location.href = "http://localhost:3133/profile/" + request.data.id;
    }
    else {
      sessionStorage.removeItem('tmpUsername');
      console.error("failed to get friend id");
    }
  }

  async function deleteChat() {
    const request = await axios.post(
      "http://localhost:3333/channel/quit_channel/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        channelName: channelName,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      sessionStorage.setItem('accessToken', request.data.accessToken);
      sessionStorage.setItem('refreshToken', request.data.refreshToken);
      window.location.href = "http://localhost:3133/social";
    }
    else {
      console.error("failed to quit chat");
    }
  }

  return (
    <div>
      <div onClick={() => { setContextMenu({ ...contextMenu, show: false }) }}>
        {contextMenu.show == true && isChannel == false ?
          <div className='context-menu' style={{ left: contextMenu.position.x, top: contextMenu.position.y }}>
            <div>block</div>
            <div>remove</div>
          </div> : null
        }
        {contextMenu.show == true && isChannel == true ?
          <div className='context-menu' style={{ left: contextMenu.position.x, top: contextMenu.position.y }}>
            <div>kick</div>
            <div>ban</div>
            <div>mute</div>
          </div> : null
        }
        <h1 className="chat-title">{channelName}</h1>
        {
          isChannel === true ?
            <>
              <button className='channel-invite'>Invite</button>
              <button className='channel-quit' onClick={deleteChat}>Quit</button>
            </>
            : null
        }
        <div ref={messagesRef} className="chat-messages">
          {messages.filter(msg => !blockedIds.includes(msg.senderId)).map((msg, index) => (
            <div className="chat-message" key={index}
              onContextMenu={
                (e) => {
                  e.preventDefault();
                  setContextMenu({
                    ...contextMenu,
                    show: true,
                    position: { x: e.clientX, y: e.clientY }
                  });
                }
              }>
              <div className="chat-avatar" style={{ backgroundImage: `url(${msg.avatar})` }} onClick={(e) => { sessionStorage.setItem('tmpUsername', msg.username); goToProfile(e) }}></div>
              <p className="chat-username">{msg.username}<span>&nbsp; &nbsp; &nbsp; {reformatTime(msg.time)}</span></p>
              <p className="chat-message-content">{msg.text}</p>
            </div>
          ))}
        </div>
        <input ref={ref} className="chat-input" type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div >
    </div>
  );
}

export default Chat;

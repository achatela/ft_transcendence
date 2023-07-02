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
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
  }, [chat, isChannel]);

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

  async function kickUserChannel() {
    const response = await axios.post(
      "http://localhost:3333/channel/kick_user_channel/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        channelName: channelName,
        targetUsername: sessionStorage.getItem('tmpUsername'),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.data.success === true) {
      sessionStorage.removeItem('tmpUsername');
      sessionStorage.setItem('accessToken', response.data.accessToken);
      sessionStorage.setItem('refreshToken', response.data.refreshToken);
      // window.location.href = "http://localhost:3133/social";
    }
    else {
      setError(true);
      setErrorMessage(response.data.error)
      sessionStorage.removeItem('tmpUsername');
    }
  }

  async function banUserChannel() {
    const response = await axios.post(
      "http://localhost:3333/channel/ban_user_channel/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        channelName: channelName,
        targetUsername: sessionStorage.getItem('tmpUsername'),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.data.success === true) {
      sessionStorage.removeItem('tmpUsername');
      sessionStorage.setItem('accessToken', response.data.accessToken);
      sessionStorage.setItem('refreshToken', response.data.refreshToken);
    }
    else {
      setError(true);
      setErrorMessage(response.data.error)
      sessionStorage.removeItem('tmpUsername');
    }
  }

  async function muteUserChannel() {
    const duration = prompt("Select a time duration (seconds)")
    const response = await axios.post(
      "http://localhost:3333/channel/mute_user_channel/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        channelName: channelName,
        targetUsername: sessionStorage.getItem('tmpUsername'),
        duration: duration,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.data.success === true) {
      sessionStorage.removeItem('tmpUsername');
      sessionStorage.setItem('accessToken', response.data.accessToken);
      sessionStorage.setItem('refreshToken', response.data.refreshToken);
    }
    else {
      setError(true);
      setErrorMessage(response.data.error)
      sessionStorage.removeItem('tmpUsername');
    }
    return;
  }

  async function blockUserPrivate() {
    const request = await axios.post(
      "http://localhost:3333/social/block_user/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        blockedUsername: sessionStorage.getItem("tmpUsername"),
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      sessionStorage.setItem("refreshToken", request.data.refreshToken);
      sessionStorage.setItem("accessToken", request.data.accessToken);
      console.log("blocked")
    }
    else
      console.log("failed to block")
    return;
  }

  async function removeUserPrivate() {
    const request = await axios.post(
      "http://localhost:3333/social/remove_friend",
      JSON.stringify({
        removerUsername: sessionStorage.getItem("username"),
        removedUsername: sessionStorage.getItem("tmpUsername"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        accessToken: sessionStorage.getItem("accessToken"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      sessionStorage.setItem("refreshToken", request.data.refreshToken);
      sessionStorage.setItem("accessToken", request.data.accessToken);
      console.log("removed")
    }
    else {
      console.log("failed to remove")
    }
    window.location.href = "http://localhost:3133/social/";
    return;
  }

  async function changePassword() {
    const newPassword = prompt("Enter new password");
    const request = await axios.post(
      "http://localhost:3333/channel/change_password_channel",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        newPassword: newPassword,
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        channelName: channelName,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      sessionStorage.setItem("refreshToken", request.data.refreshToken);
      sessionStorage.setItem("accessToken", request.data.accessToken);
      console.log("password changed")
    }
    else {
      setError(true);
      setErrorMessage(request.data.error)
      sessionStorage.removeItem('tmpUsername');
    }
    return;
  }

  async function inviteUser() {
    const user = prompt("Enter username");
    const request = await axios.post(
      "http://localhost:3333/channel/invite_user_channel",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        channelName: channelName,
        invitedUser: user,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      sessionStorage.setItem("refreshToken", request.data.refreshToken);
      sessionStorage.setItem("accessToken", request.data.accessToken);
      console.log("invited")
    }
    else {
      setError(true);
      setErrorMessage(request.data.error)
      sessionStorage.removeItem('tmpUsername');
    }
    return;
  }

  async function promoteUserChannel() {
    const response = await axios.post(
      "http://localhost:3333/channel/promote_user_channel/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        channelName: channelName,
        targetUsername: sessionStorage.getItem('tmpUsername'),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.data.success === true) {
      sessionStorage.removeItem('tmpUsername');
      sessionStorage.setItem('accessToken', response.data.accessToken);
      sessionStorage.setItem('refreshToken', response.data.refreshToken);
    }
    else {
      setError(true);
      setErrorMessage(response.data.error)
      sessionStorage.removeItem('tmpUsername');
    }
  }


  async function demoteUserChannel() {
    const response = await axios.post(
      "http://localhost:3333/channel/demote_user_channel/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        channelName: channelName,
        targetUsername: sessionStorage.getItem('tmpUsername'),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.data.success === true) {
      sessionStorage.removeItem('tmpUsername');
      sessionStorage.setItem('accessToken', response.data.accessToken);
      sessionStorage.setItem('refreshToken', response.data.refreshToken);
    }
    else {
      setError(true);
      setErrorMessage(response.data.error)
      sessionStorage.removeItem('tmpUsername');
    }
  }

  return (
    <div>
      <div onClick={() => { setContextMenu({ ...contextMenu, show: false }) }}>
        {contextMenu.show == true && isChannel == false ?
          <div className='context-menu' style={{ left: contextMenu.position.x, top: contextMenu.position.y }}>
            <div onClick={() => { blockUserPrivate() }}>block</div>
            <div onClick={() => { removeUserPrivate() }} >remove</div>
          </div> : null
        }
        {contextMenu.show == true && isChannel == true ?
          <div className='context-menu' style={{ left: contextMenu.position.x, top: contextMenu.position.y }}>
            <div onClick={() => { kickUserChannel() }}>kick</div>
            <div onClick={() => { banUserChannel() }}>ban</div>
            <div onClick={() => { muteUserChannel() }}>mute</div>
            <div onClick={() => { promoteUserChannel() }}>promote</div>
            <div onClick={() => { demoteUserChannel() }}>demote</div>
          </div> : null
        }
        {isError === true ? <div className='error-message-chat'>{errorMessage}</div> : null}
        <h1 className="chat-title">{channelName}</h1>
        {
          isChannel === true ?
            <>
              <button className='channel-invite' onClick={inviteUser}>Invite</button>
              <button className='channel-password' onClick={changePassword}>Change password</button>
              <button className='channel-quit' onClick={deleteChat}>Quit</button>
            </>
            : null
        }
        <div ref={messagesRef} className="chat-messages">
          {messages.filter(msg => !blockedIds.includes(msg.senderId)).map((msg, index) => (
            < div className="chat-message" key={index}
              onContextMenu={
                (e) => {
                  if (sessionStorage.getItem('username') === msg.username)
                    return;
                  e.preventDefault();
                  sessionStorage.setItem('tmpUsername', msg.username);
                  setContextMenu({
                    ...contextMenu,
                    show: true,
                    username: msg.username,
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
    </div >
  );
}

export default Chat;

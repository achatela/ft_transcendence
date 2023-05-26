import React from 'react';
import axios from 'axios'

async function removeFriend(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
  let name = event.currentTarget.dataset.name;
  const request = await axios.post(
    "http://localhost:3333/social/remove_friend",
    JSON.stringify({
      usernameToRemove: name,
      loginUser: sessionStorage.getItem("login"),
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

async function getFriendId(event: React.MouseEvent<HTMLDivElement>): Promise<void> {
  let name = event.currentTarget.dataset.name;
  const request = await axios.post(
    "http://localhost:3333/social/get_friend_id",
    JSON.stringify({
      username: name,
      login: sessionStorage.getItem("login"),
      accessToken: sessionStorage.getItem("accessToken"),
      refreshToken: sessionStorage.getItem("refreshToken"),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
  if (request.data.success === true) {
    sessionStorage.setItem("refreshToken", request.data.refreshToken);
    sessionStorage.setItem("accessToken", request.data.accessToken);
    window.location.href = "http://localhost:3133/profile/" + request.data.id;
  }
  else {
    console.log("failed to get id")
  }
}

interface FriendListProps {
  friendList: string[];
}

const FriendList: React.FC<FriendListProps> = ({ friendList }) => {
  return (
    <div className="friend-list">
      {friendList.map((username) => (
          <div className="friend-list-item">
            <div className="friend-list-name" onClick={getFriendId} data-name={username}>{username}</div>
            <button className="friend-list-delete" onClick={removeFriend} data-name={username}>Delete</button>
          </div>
      ))}
    </div>
  );
};


export default FriendList;

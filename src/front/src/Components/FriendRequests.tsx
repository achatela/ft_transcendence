import React from 'react';
import axios from 'axios'

async function acceptFunction(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
  let name = event.currentTarget.dataset.name;
  const request = await axios.post(
    "http://localhost:3333/social/accept_friend_request/",
    JSON.stringify({
      usernameToAccept: name,
      loginUser: sessionStorage.getItem("login"),
      refreshToken: sessionStorage.getItem("refreshToken"),
      accessToken: sessionStorage.getItem("accessToken"),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
  if (request.data.success === true) {
    sessionStorage.setItem("refreshToken", request.data.refreshToken);
    sessionStorage.setItem("accessToken", request.data.accessToken);
    console.log("accepted")
  }
  else {
    console.log("failed to accept")
  }
  window.location.href = "http://localhost:3133/social/";
}


async function declineFunction(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
  const name = event.currentTarget.dataset.name;
  const request = await axios.post(
    "http://localhost:3333/social/decline_friend_request/",
    JSON.stringify({
      usernameToDecline: name,
      loginUser: sessionStorage.getItem("login"),
      refreshToken: sessionStorage.getItem("refreshToken"),
      accessToken: sessionStorage.getItem("accessToken"),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
  if (request.data.success === true) {
    sessionStorage.setItem("refreshToken", request.data.refreshToken);
    sessionStorage.setItem("accessToken", request.data.accessToken);
    console.log("declined")
  }
  else {
    console.log("failed to decline")
  }
  window.location.href = "http://localhost:3133/social/";
}

interface FriendRequestsProps {
  friendRequests: string[];
}

const FriendRequests: React.FC<FriendRequestsProps> = ({ friendRequests }) => {
  return (
    <div className="friend-requests">
      <p className='friend-requests-p'>Friend Requests</p>
      {friendRequests.map((username) => (
        <div key={username} className="friend-requests-item">
          <div className="friend-requests-name">{username}</div>
          <div className="friend-requests-buttons">
            <button className="friend-requests-accept" onClick={acceptFunction} data-name={username}>Accept</button>
            <button className="friend-requests-decline" onClick={declineFunction} data-name={username}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;

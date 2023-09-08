import React from 'react';
import axios from 'axios'

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

async function acceptFunction(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
  try {
    const request = await axios.post(
      'http://' + domain + ':3333/social/accept_friend_request/',
      JSON.stringify({
        accepterUsername: sessionStorage.getItem("username"),
        acceptedUsername: event.currentTarget.dataset.name,
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
  }
  catch (err) {
    console.log(err);
  }
  window.location.href = "/social/";
}


async function declineFunction(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
  try {
    const request = await axios.post(
      'http://' + domain + ':3333/social/decline_friend_request/',
      JSON.stringify({
        declinerUsername: sessionStorage.getItem("username"),
        declinedUsername: event.currentTarget.dataset.name,
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
  }
  catch (err) {
    console.log(err);
  }
  window.location.href = "/social/";
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

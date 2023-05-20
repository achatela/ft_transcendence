import React from 'react';

interface FriendRequestProps {
  name: string;
}

const FriendRequest: React.FC<FriendRequestProps> = ({ name }) => {
  return (
    <div className="friend-request-item">
      <span className="friend-request-name">{name}</span>
      <div className="friend-request-buttons">
        <button className="friend-request-accept">Accept</button>
        <button className="friend-request-decline">Decline</button>
      </div>
    </div>
  );
};

export default FriendRequest;

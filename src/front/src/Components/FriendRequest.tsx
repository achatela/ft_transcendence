import React from 'react';

interface FriendRequestProps {
    name: string;
    acceptFunction: () => Promise<void>;
    declineFunction: () => Promise<void>;
}

const FriendRequest: React.FC<FriendRequestProps> = ({ name, acceptFunction, declineFunction }) => {
  return (
    <div className="friend-request-item">
      <span className="friend-request-name">{name}</span>
      <div className="friend-request-buttons">
        <button className="friend-request-accept" onClick={acceptFunction}>Accept</button>
        <button className="friend-request-decline" onClick={declineFunction}>Decline</button>
      </div>
    </div>
  );
};

export default FriendRequest;

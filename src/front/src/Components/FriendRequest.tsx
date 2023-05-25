import React from 'react';

interface FriendRequestProps {
  name: string;
  acceptFunction: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  declineFunction: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}

const FriendRequest: React.FC<FriendRequestProps> = ({ name, acceptFunction, declineFunction }) => {
  return (
    <div className="friend-request-item">
      <div className="friend-request-name">{name}</div>
      <div className="friend-request-buttons">
        <button className="friend-request-accept" onClick={acceptFunction} data-name={name}>Accept</button>
        <button className="friend-request-decline" onClick={declineFunction} data-name={name}>Decline</button>
      </div>
    </div>
  );
};

export default FriendRequest;

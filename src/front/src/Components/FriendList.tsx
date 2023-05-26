import React from 'react';

interface FriendListProps {
  name: string;
  removeFriend: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  getID: (event: React.MouseEvent<HTMLDivElement>) => Promise<void>;
}

const FriendList: React.FC<FriendListProps> = ({ name, removeFriend, getID }) => {
  return (
    <div className="friend-list-item">
      <div className="friend-list-name" onClick={getID} data-name={name}>{name}</div>
      <button className="friend-list-delete" onClick={removeFriend} data-name={name}>Delete</button>
    </div>
  );
};


export default FriendList;

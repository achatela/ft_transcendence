import React from 'react';

interface FriendListProps {
    name: string;
    removeFriend: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}

const FriendList: React.FC<FriendListProps> = ({ name, removeFriend }) => {
    return (
      <div className="friend-list-item">
        <div className="friend-list-name">{name}</div>
        <button className="friend-list-delete" onClick={removeFriend} data-name={name}>Delete</button>
      </div>
    );
  };
  

export default FriendList;

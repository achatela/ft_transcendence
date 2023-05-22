import React from 'react';

interface FriendListProps {
    name: string;
    removeFriend: () => void;
}

const FriendList: React.FC<FriendListProps> = ({ name, removeFriend }) => {
  return (
    <div className="friend-list-item">
      <div className="friend-list-name">{name}</div>
      <button className="friend-list-delete" onClick={removeFriend}>Delete</button>
    </div>
  );
};

export default FriendList;

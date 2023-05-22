import React from 'react';

interface FriendListProps {
    name: string;
}

const FriendList: React.FC<FriendListProps> = ({ name }) => {
  return (
    <div className="friend-list-item">
      <span className="friend-list-name">{name}</span>
      <div className="friend-list-buttons">
      </div>
    </div>
  );
};

export default FriendList;

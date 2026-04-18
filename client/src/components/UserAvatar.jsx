import React from 'react';

export default function UserAvatar({ user, size = 24, className = "" }) {
  if (!user) return null;

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=${size * 2}`
    : `https://cdn.discordapp.com/embed/avatars/${(parseInt(user.id) >> 22) % 6}.png`;

  return (
    <img 
      src={avatarUrl} 
      alt={user.username} 
      className={`user-avatar ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        borderRadius: '50%',
        objectFit: 'cover',
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
    />
  );
}

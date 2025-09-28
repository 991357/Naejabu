'use client';

import { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: number;
  created_at: string;
}

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return; // Do not fetch if no token
    }

    try {
      const res = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } else {
        // If token is invalid, maybe clear it and log out?
        console.error('Failed to fetch notifications:', res.status);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.is_read === 0) {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ notificationId: notification.id }),
        });
        fetchNotifications(); // Refresh notifications
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setIsOpen(false);
  };

  const handleReadAll = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-600 dark:text-gray-300">
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 text-gray-800 dark:text-gray-200">
          <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold">알림</h3>
            <button onClick={handleReadAll} className="text-sm text-blue-500 hover:underline">모두 읽음</button>
          </div>
          <ul className="py-1 max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <li key={notif.id} onClick={() => handleNotificationClick(notif)} className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${notif.is_read === 0 ? 'font-bold' : ''}`}>
                  <p className="text-sm">{notif.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{notif.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">새로운 알림이 없습니다.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;

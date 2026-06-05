'use client'
import { useState, useEffect } from 'react';

export default function TopBar() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    const message = hour < 12 ? "Good morning, Creator." : "Good afternoon, Creator.";
    setGreeting(message);
  }, []);

  return (
    <div>
      <p className="text-[11px] text-ink-3">
        {greeting}
      </p>
    </div>
  );
}

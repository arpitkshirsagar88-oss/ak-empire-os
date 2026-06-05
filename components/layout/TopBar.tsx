'use client'
import { useState, useEffect } from 'react';

export default function TopBar() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning, Creator." : "Good afternoon, Creator.");
  }, []);

  return <p className="text-[11px] text-ink-3">{greeting}</p>;
}

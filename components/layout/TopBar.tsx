'use client'
import { useState, useEffect } from 'react';

export default function TopBar() {
  // Hum state ko khali rakhte hain server-side rendering ke liye
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Ye code sirf browser (client) mein chalega, isliye hydration error nahi aayega
    const hour = new Date().getHours();
    const message = hour < 12 ? "Good morning, Creator." : "Good afternoon, Creator.";
    setGreeting(message);
  }, []);

  return (
    <div>
      {/* Agar greeting abhi set nahi hui hai, toh ye kuch render nahi karega */}
      <p className="text-[11px] text-ink-3">
        {greeting}
      </p>
    </div>
  );
}

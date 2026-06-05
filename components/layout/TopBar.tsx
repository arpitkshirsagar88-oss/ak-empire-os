'use client' // Yeh line upar hona zaroori hai
import { useState, useEffect } from 'react';

export default function TopBar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Server par ye component hide rahega

  return (
    <div className="flex justify-between items-center w-full">
      {/* Tumhara baki code yahan rahega */}
      <p>Good Morning/Afternoon, Creator.</p>
    </div>
  );
}

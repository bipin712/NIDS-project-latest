import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}

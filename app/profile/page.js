"use client"
import { SessionProvider } from 'next-auth/react';
import Profile from '../components/Profile';

export default function Page() {
  return (
    <SessionProvider>
      <Profile/>
    </SessionProvider>
  );
}

'use client'
import Landingpage from './components/landingapge'
import { SessionProvider } from 'next-auth/react'

export default function (){
  return(<>
  
  <SessionProvider>
    <Landingpage/>
  </SessionProvider>
  </>)
}
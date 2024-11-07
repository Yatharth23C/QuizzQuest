
'use client'
import Viewquestions from '../components/Viewquestions'
import { SessionProvider } from 'next-auth/react'

export default function (){
  return(<>
  
  <SessionProvider>
    <Viewquestions/>
  </SessionProvider>
  </>)
}
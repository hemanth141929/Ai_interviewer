import React from 'react'
import Headers from '@/components/header'
import Agent from '@/components/agent'
// import { getCurrentUser } from '@/lib/actions/auth.action'


const Interview = async() => {

  // const user = await getCurrentUser();
  return (
    <>
    <Headers/>
    <Agent username="you" userid="user1" type="generate"/>
    </>
  )
}

export default Interview
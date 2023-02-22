import React, { useState } from 'react'
import {ChatState} from "../Context/chatProvider"
import SideBar from "../components/ChatComponents/SideBar"
import ChatList from "../components/ChatComponents/ChatList"
import ChatBox from "../components/ChatComponents/ChatBox"
import { Box } from '@chakra-ui/react'
export default function Chat() {

  const [fetchAgain,setFetchAgain] = useState(false)

  const {user} = ChatState()
  return (
    <div style={{width:"100%"}}>
      {user && <SideBar/>}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && <ChatList fetchAgain={fetchAgain}/>}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
      </Box>
    </div>
  )
}

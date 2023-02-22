import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { getSender, getSenderInfo } from '../../config/chatConnfig'
import { ChatState } from '../../Context/chatProvider'
import ProfileModal from '../Modals/Profile'
import UpdatedGroupChatModal from '../Modals/UpdatedGroupChatModal'
import ScrollableChat from '../ChatComponents/ScrollableChat'
import io from 'socket.io-client'
const EP = "https://chatappbuddy.herokuapp.com/";

let socket, selectedChatCompare;
export default function SingleChat({ fetchAgain, setFetchAgain }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState()
  const [typing, settyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)


  const toast = useToast()

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit('stop typing', selectedChat._id)
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`
          }
        }
         const { data } = await axios.post('https://chatappbuddy.herokuapp.com/api/message', {
          content: newMessage,
          chatId: selectedChat._id
        }, config)
        setNewMessage("");
        console.log(data);

        socket.emit('new message', data)
        setMessages([...messages, data])
      } catch (error) {
        toast({
          title: "Error",
          status: "Failed to send message",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        })
      }
    }
  }
  const typingHandler = (event) => {
    setNewMessage(event.target.value)

    if(!socketConnected) return;

    if(!typing){
      settyping(true)
      socket.emit('typing', selectedChat._id)
    }

    let lastTyping = new Date().getTime()
    let timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTyping;

      if(timeDiff >= timerLength && typing){
        socket.emit('stop typing', selectedChat._id)
        settyping(false)
      }
    }, timerLength);
  }

  const fetchMessages = async()=>{
    if(!selectedChat)
    return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
      setLoading(true)
      const {data} = await axios.get(`https://chatappbuddy.herokuapp.com/api/message/${selectedChat._id}`,config);
      setMessages(data);
      setLoading(false)

      socket.emit('join chat', selectedChat._id)
  } catch (error) {
    toast({
      title: "Error",
      status: "Failed to Load messages",
      duration: 5000,
      isClosable: true,
      position: "bottom"
    })
}
  }

  useEffect(()=>{
    socket = io(EP);
    socket.emit("setup", user);
    socket.on('connected', ()=>setSocketConnected(true))
    socket.on('typing', ()=> setIsTyping(true))
    socket.on('stop typing', ()=> setIsTyping(false))
  })

  useEffect(()=>{
    socket.on('message recieved', (newMessageRecieved)=>{
      if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id){
        if(!notification.includes(newMessageRecieved)){
          setNotification([newMessageRecieved, ...notification])
          setFetchAgain(!fetchAgain);
        }
      }
      else{
        setMessages([...messages, newMessageRecieved])
      }
    });
  })

  


  useEffect(()=>{
    fetchMessages()

    selectedChatCompare = selectedChat; // compare new state with previous state
  },[selectedChat])


  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderInfo(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdatedGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div style={{display:"flex", flexDirection:"column", overflowY:"scroll", scrollbarWidth:"none"}}>
                <ScrollableChat messages={messages}/>
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? <Spinner/> : (<></>)}
              <Input variant="filled" bg="#E0E0E0" placeholder="Enter Message" onChange={typingHandler} value={newMessage} />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex" alignItems="center" justifyContent="center"
          h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a chat to start chatting
          </Text>
        </Box>
      )}
    </>
  )
}

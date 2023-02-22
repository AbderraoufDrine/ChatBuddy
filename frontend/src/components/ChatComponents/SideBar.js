import React, { useState } from 'react'
import {Box, Tooltip, Button, Text, Menu, MenuButton, MenuList, Avatar, MenuItem, MenuDivider, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner} from '@chakra-ui/react'
import {BellIcon, ChevronDownIcon, } from '@chakra-ui/icons'
import {ChatState} from "../../Context/chatProvider"
import Profile from "../Modals/Profile"
import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@chakra-ui/hooks'
import axios from 'axios'
import ChatLoading from './ChatLoading'
import UserListItem from '../UserAvatar/UserListItem'
import { getSender } from '../../config/chatConnfig'
import NotificationBadge from 'react-notification-badge'
import {Effect} from 'react-notification-badge'
export default function SideBar() {
  const [search, setSearch] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)

  let navigate = useNavigate();
  const {user, setSelectedChat, chats, setChats, notification, setNotification} = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure()

  const toast = useToast()
  const handleLogOut = ()=>{
    localStorage.removeItem("userInfo");
    navigate("/");
    
  }
  const handleSearch = async ()=>{
    if(!search){
      toast({
        title: "Please Enter something",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left"
      })
      return;
    }
    try {
      setLoading(true)

      const config = {
        headers:{
          Authorization:`Bearer ${user.token}`
        },
      }
      const {data} = await axios.get(`https://chat-backend-44u8l8kta-abderraoufdrine.vercel.app/api/user?search=${search}`, config)

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error",
        status: "Failed to load search results",
        duration: 5000,
        isClosable: true,
        position: "top-left"
      })

    }
  };
  const accessChat = async (userId)=>{
    try {
      setLoadingChat(true)

      const config = {
        headers:{
          "Content-type": "application/json",
          Authorization:`Bearer ${user.token}`
        },
      }

      const {data} = await axios.post('https://chatappbuddy.herokuapp.com/api/chats',{userId},config);

      if(!chats.find((c)=> c._id === data._id)) setChats([data, ...chats])
      setSelectedChat(data)
      setLoadingChat(false)
      onClose()

    } catch (error) {
      toast({
        title: "Error while fetching chats",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left"
      })

    }
  }
  return (
    <>
    <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"  
    >
      <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
        <Button variant="ghost" onClick={onOpen}>
        <i class="fa-solid fa-magnifying-glass"></i>
        <Text display={{ base: "none", md: "flex" }} px='4'>
          Search User
        </Text>
        </Button>
      </Tooltip>
      <Text fontSize="2xl" fontFamily="Work sans">
        ChatBuddy
      </Text>
      <div>
        <Menu>
          <MenuButton p={1}>
            <BellIcon fontSize="2xl" m={1}/>
            <NotificationBadge
            count = {notification.length}
            effect={Effect.SCALE}
            />
          </MenuButton>
          <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>        </Menu>
        <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
          <Avatar size='sm' cursor='pointer' name={user.name} src={user.pic}/>
         </MenuButton>
         <MenuList>
           <Profile user={user}>
           <MenuItem>My Profile</MenuItem>
           </Profile>
           <MenuDivider/>
           <MenuItem onClick={handleLogOut}>Log Out</MenuItem>
         </MenuList>
        </Menu>
      </div>
    </Box>

    <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay/>
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
        <DrawerBody>
        <Box display="flex" pb={2}>
          <Input
          placeholder='Search for User'
          mr={2}
          value={search}
          onChange={(e)=> setSearch(e.target.value)}
          />
          <Button 
          onClick={handleSearch}
          > Go</Button>
        </Box>
        {loading ?(
          <ChatLoading/>
        ) : (
          searchResult?.map(user =>(
            <UserListItem
            key={user.id}
            user={user}
            handleFunction={()=>accessChat(user._id)}
            />
          ))
        )
      }
      {loadingChat && <Spinner ml="auto" display="flex"/>}
      </DrawerBody>
      </DrawerContent>
    </Drawer>
    </>
  )
}

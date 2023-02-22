const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose")
const user = require("./routes/user")
const chats = require("./routes/chats")
const message = require("./routes/message")
const cors = require("cors");

const app = express();
app.use(cors())
app.use(express.json())
dotenv.config()
mongoose.connect(process.env.MONGO_URL).then(console.log("connected to mongo")).catch((err)=> console.log(err));


app.use("/api/user", user)
app.use("/api/chats", chats)
app.use("/api/message", message)

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log("Backend connected"))

const io = require("socket.io")(server,{
    pingTimeout: 60000,
    cors:{
        origin: "https://chatbuddy1.netlify.app/"
    }
})

io.on("connection", (socket)=>{
    socket.on('setup',(userData)=>{
        socket.join(userData._id);
        socket.emit('connected')
    })

    socket.on('join chat', (room)=>{
        socket.join(room);
    })

    socket.on('typing',(room)=>socket.in(room).emit("typing"));
    socket.on('stop typing',(room)=>socket.in(room).emit("stop typing"));
   
    socket.on('new message',(newMessageRecieved)=>{
        let chat =  newMessageRecieved.chat;

        if(!chat.users) 
        return console.log('chat users not defined')

        chat.users.forEach(user=>{
            if(user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved)
        })
    })

    socket.off("setup", ()=>{
        socket.leave(userData._id)
    })
})
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");

const sendMessage = (async(req,res)=>{
    const { content, chatId} = req.body;

    if(!content || !chatId){
        console.log("Invalid data passed into request")
        return res.sendStatus(400);
    }

    let newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    };

    try {
        let message = await Message.create(newMessage);

        message = await message.populate("sender","name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name pic email'
        });

        res.json(message);
        await Chat.findByIdAndUpdate(req.body.chatId,{
            latestMessage: message
        })
    } catch (error) {
        res.status(400);
        throw new Error (error.message)
    }
})

const getMessages = (async (req,res)=>{
    try {
        const messages = await Message.find({ chat: req.params.chatId}).populate("sender", "name pic emial")
        .populate("chat");

        res.status(200).json(messages);
    } catch (error) {
        res.status(400);
        throw new Error (error.message)
    }
})
module.exports = {sendMessage, getMessages}
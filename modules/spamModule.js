const { Telegram } = require('telegraf')
const { Client } = require('tdl')
const { TDLib } = require('tdl-tdlib-addon')
const { getTdjson } = require('prebuilt-tdlib')
const typeHandler = require('./typeHandler')
const { writeFileSync } = require('fs')
require('dotenv').config()

const client = new Client(new TDLib(getTdjson()), {
    apiId: process.env.API_ID,
    apiHash: process.env.API_HASH
})

var mainChannel = -1001790175470

module.exports = {
    addCurrentPost,
    auth,
    client,
    login: client.login,
    update: client.on,
    replyChannelPost,
    copyMassage,
    updateHandler,
    getMainChannel,
    getSpamChannels,
    addSpamChannel,
    setMainChannel,
    delSpamChannel
}

var spamChannels = [{
    idChannel: -1001893986335,
    idDiscussionGroup: -1001510338058
}, {
    idChannel: -1001764342819,
    idDiscussionGroup: -1001894936338
}]



var currentPost = {
    media_group_id: 0,
    contentType: "",
    content: [],
    caption: {}
}

async function updateHandler(update) {
    if(update["_"] == "updateNewMessage") {
        if(update["message"]["is_channel_post"]) {
            if(update["message"]["chat_id"] == mainChannel) {
                if(update["message"]["sender_id"]["_"] == "messageSenderChat" && update["message"]["sender_id"]["chat_id"] == mainChannel) {
                    if(update["message"]["media_album_id"] != 0) {
                        addCurrentPost(update["message"]["content"], update["message"]["media_album_id"])
                    } else {
                        copyMassage(update["message"]["chat_id"], update["message"]["id"])
                    }
                }
            }
        }
    }
}

function addSpamChannel(idChannel, idDiscussionGroup) {
    spamChannels.push({
        idChannel: idChannel,
        idDiscussionGroup: idDiscussionGroup
    })
}

function delSpamChannel(idChannel) {
    for(var i = 0; i < spamChannels.length; i++) {
        if(idChannel == spamChannels[i].idChannel) {
            spamChannels[i] = spamChannels[spamChannels.length - 1]
            spamChannels.pop()
            return true
        }
    }
    return false
}

function getSpamChannels() {
    return spamChannels
}

function getMainChannel() {
    return mainChannel
}

function setMainChannel(idMainChannel) {
    mainChannel = idMainChannel
}

async function auth(chat_id) {
    for(var i = 0; i < spamChannels.length; i++) {
        if(chat_id == spamChannels[i].id) {
            return true;
        }
    }
    return false;
}

async function addCurrentPost(content, media_album_id) {
    if(currentPost.media_group_id == 0) {
        currentPost.media_group_id = media_album_id;
        currentPost.contentType = content["_"]
    }
    if(content["_"] == "messagePhoto") {
        currentPost.content.push(content["photo"]["sizes"][content["photo"]["sizes"].length - 1]["photo"]["remote"]["id"])
    } else if(content["_"] == "messageVideo") {
        currentPost.content.push(content["video"]["video"]["remote"]["id"])
    } else if(content["_"] == "messageDocument") {
        currentPost.content.push(content["document"]["document"]["remote"]["id"])
    } else if(content["_"] == "messageAudio") {
        currentPost.content.push(content["audio"]["audio"]["remote"]["id"])
    }
    if(content["caption"]["text"] != "") {
        currentPost.caption = content["caption"]
    }
}

async function copyMassage(from_chat_id, message_id) {
    try {
        sendChannels(typeHandler.inputMessageForwarded(from_chat_id, message_id))
    } catch(er) {
        console.log(er)
    }
}

async function replyChannelPost() {
    try {
        // console.log(currentPost.media_group_id)
        if(currentPost.media_group_id != 0) {
            currentPost.media_group_id = 0
            await sendChannels(typeHandler.inputMessageContents(currentPost), true)
            deleteCurrentPost()
        }
    } catch(er) {
        console.log(er)
    }
    
}

async function sendChannels(input_message_content, album = false) {
    var id_chats_message = await getLatestPost()
    // console.log(id_chats_message)
    for(var i = 0; i < id_chats_message.length; i++) {
        if(!album) {
            await sendMessage(id_chats_message[i].id_chat, 0, id_chats_message[i].id, input_message_content)
        } else {
            await sendMessageAlbum(id_chats_message[i].id_chat, 0, id_chats_message[i].id, input_message_content)
        }
    }
}

async function sendMessageAlbum(chat_id, message_thread_id, reply_to_message_id, input_message_content) {
    try {
        await client.invoke({
            _: "sendMessageAlbum",
            chat_id: chat_id,
            message_thread_id: message_thread_id,
            reply_to_message_id: reply_to_message_id,
            input_message_contents: input_message_content
        })
    } catch(er) {
        console.log(er)
    }
}

//функция отправляет новое сообщение в чат
async function sendMessage(chat_id, message_thread_id, reply_to_message_id, input_message_content) {
    try {
        await client.invoke({
            _: "sendMessage",
            chat_id: chat_id,
            message_thread_id: message_thread_id,
            reply_to_message_id: reply_to_message_id,
            input_message_content: input_message_content
        })
    } catch(er) {
        console.log(er)
    }
}

function deleteCurrentPost() {
    currentPost.caption = {}
    currentPost.media_group_id = 0
    currentPost.content = []
    currentPost.contentType = ""
}

var count = 0

//модуль получения последнего поста, под которым написать коментарий
async function getLatestPost() {
    var id_chats_message = []
    try {
        for(var i = 0; i < spamChannels.length; i++) {
            try {
                var True = true
                var message = await getChatHistory(spamChannels[i]["idChannel"], 0, 0, 1, false)
                while(True) {
                    if(message["messages"][0]["can_get_message_thread"]) {
                        True = false
                    } else {
                        message = await getChatHistory(spamChannels[i]["idChannel"], message["messages"][0]["id"], 0, 1, false)
                    }
                }
                id_chats_message.push(await getLatestMessage(message["messages"][0]["id"], spamChannels[i].idDiscussionGroup))
            } catch(er) {
                console.log(er)
            }
        }
    } catch(er) {
        console.log(er)
    }
    return id_chats_message
}

async function getLatestMessage(id, id_chat) {
    try {
        var message = await getChatHistory(id_chat, 0, 0, 1, false)
        var _id = message["messages"][0].id
        if(message["messages"][0]["forward_info"]) {
            if(message["messages"][0]["forward_info"]["_"] == "messageForwardInfo") {
                if(message["messages"][0]["forward_info"]["origin"]["message_id"] == id) {
                    return {
                        id_chat: id_chat,
                        id: message["messages"][0]["id"]
                    }
                }
            }
        }
        while(true) {
            var messages = await getChatHistory(id_chat, _id, 0, 50, false)
            for(var j = 0; j < messages["total_count"]; j++) {
                if(messages["messages"][j]["forward_info"]) {
                    if(messages["messages"][j]["forward_info"]["_"] == "messageForwardInfo") {
                        if(messages["messages"][j]["forward_info"]["origin"]["message_id"] == id) {
                            return {
                                id_chat: id_chat,
                                id: messages["messages"][j]["id"]
                            }
                        }
                    }
                }
            }
            // console.log(messages)
            _id = messages["messages"][messages["total_count"] - 1]["id"]
        }
    } catch(er) {
        console.log(er)
    }
}

async function getChatHistory(id_chat, from_message_id, offset, limit, only_local) {
    try {
        return await client.invoke({
            _: "getChatHistory",
            chat_id: id_chat,
            from_message_id: from_message_id,
            offset: offset,
            limit: limit,
            only_local: only_local
        })
    } catch(er) {
        console.log(er)
    }
}
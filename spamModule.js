const { Telegram } = require('telegraf')
require('dotenv').config()

const bot = new Telegram(process.env.TELEGRAM_API_TOKEN)

module.exports = {
    addCurrentPost,
    addIdLastPublication,
    replyChannelPost,
    auth,
    copyMessage
}

var currentPost = {
    media_group_id: 0,
    contentType: "",
    content: [],
    caption: "",
    caption_entities: []
}

    var spamChannels = [{id: -1001893986335, chat_group_id: -1001510338058, idLastPublication: 115}]

async function auth(chat_id) {
    for(i = 0; i < spamChannels.length; i++) {
        if(chat_id == spamChannels[i].id) {
            return true;
        }
    }
    return false;
}

async function copyMessage(fromChatId, messageId) {
    for(i = 0; i < spamChannels.length; i++) {
        bot.copyMessage(spamChannels[i].chat_group_id, fromChatId, messageId, {
            reply_to_message_id: spamChannels[i].idLastPublication
        })
    }
}

async function addIdLastPublication(chat_id, idPublication, chat_group_id) {
    for(i = 0; i < spamChannels.length; i++) {
        if(chat_id == spamChannels[i].id) {
            spamChannels[i]["idLastPublication"] = idPublication
            spamChannels[i]["chat_group_id"] = chat_group_id
            return
        }
    }
}

async function addCurrentPost(contentType, channelPost) {
    console.log(channelPost)
    if(channelPost?.media_group_id) {
        if(currentPost.media_group_id == 0) {
            currentPost.media_group_id = channelPost.media_group_id
            currentPost.contentType = contentType
        }
        if(currentPost.media_group_id == channelPost.media_group_id) {
            if(channelPost?.caption) currentPost.caption = channelPost.caption
            if(channelPost?.caption_entities) currentPost.caption_entities = channelPost.caption_entities
            if(contentType == "photo") {
                var photo = channelPost.photo[channelPost.photo.length - 1]
                currentPost.content.push(photo.file_id)
            } else if(contentType == "video") {
                currentPost.content.push(channelPost.video.file_id)
            } else if(contentType == "document") {
                currentPost.content.push(channelPost.document.file_id)
            } else if(contentType == "audio") {
                currentPost.content.push(channelPost.audio.file_id)
            }
        }
    } else {
        if(contentType == "photo") {
            var photo = channelPost.photo[channelPost.photo.length - 1]
            for(i = 0; i < spamChannels.length; i++) {
                bot.sendPhoto(spamChannels[i].chat_group_id, photo.file_id, {
                        reply_to_message_id: spamChannels[i].idLastPublication,
                        caption: channelPost?.caption,
                        caption_entities: channelPost?.caption_entities,
                    }
                )
            }
        } else if(contentType == "voice") {
            for(i = 0; i < spamChannels.length; i++) {
                bot.sendVoice(spamChannels[i].chat_group_id, channelPost.voice.file_id, {
                    reply_to_message_id: spamChannels[i].idLastPublication
                })
            }
        } else if(contentType == "video") {
            for(i = 0; i < spamChannels.length; i++) {
                bot.sendVideo(spamChannels[i].chat_group_id, channelPost.video.file_id, {
                    reply_to_message_id: spamChannels[i].idLastPublication,
                    caption: channelPost?.caption,
                    caption_entities: channelPost?.caption_entities,
                })
            }
        } else if(contentType == "video_note") {
            for(i = 0; i < spamChannels.length; i++) {
                bot.sendVideoNote(spamChannels[i].chat_group_id, channelPost.video_note.file_id, {
                    reply_to_message_id: spamChannels[i].idLastPublication
                })
            }
        } else if(contentType == "document") {
            for(i = 0; i < spamChannels.length; i++) {
                bot.sendDocument(spamChannels[i].chat_group_id, channelPost.document.file_id, {
                    reply_to_message_id: spamChannels[i].idLastPublication,
                    caption: channelPost?.caption,
                    caption_entities: channelPost?.caption_entities
                })
            }
        } else if(contentType == "audio") {
            for(i = 0; i < spamChannels.length; i++) {
                bot.sendAudio(spamChannels[i].chat_group_id, channelPost.audio.file_id, {
                    reply_to_message_id: spamChannels[i].idLastPublication,
                    caption: channelPost?.caption,
                    caption_entities: channelPost?.caption_entities
                })
            }
        }
    }
}



async function replyChannelPost() {
    if(currentPost.media_group_id != 0) {
        var mediaGroup = [];
        mediaGroup.push({
            type: currentPost.contentType,
            media: currentPost.content[0],
            caption: currentPost.caption,
            caption_entities: currentPost.caption_entities
        })
        for(i = 1; i < currentPost.content.length; i++) {
            mediaGroup.push({
                type: currentPost.contentType,
                media: currentPost.content[i]
            })
        }
        for(i = 0; i < spamChannels.length; i++) {
            bot.sendMediaGroup(spamChannels[i].chat_group_id, 
                mediaGroup, {
                    reply_to_message_id: spamChannels[i].idLastPublication
                }
            )
        }
        deleteCurrentPost()
    }
}

function deleteCurrentPost() {
    currentPost.caption = ""
    currentPost.caption_entities = []
    currentPost.media_group_id = 0
    currentPost.content = []
    currentPost.contentType = ""
}
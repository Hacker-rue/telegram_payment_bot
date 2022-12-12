module.exports = {

    entitiesBotInTdl,

    inputMessageForwarded: (from_chat_id, message_id) => {
        return {
            _: "inputMessageForwarded",
            from_chat_id: from_chat_id,
            message_id: message_id,
            copy_options: {
                _: "messageCopyOptions",
                send_copy: true
            }
        }
    },

    inputMessageContents: (currentPost) => {
        var contents = []
        var content = typesContents[currentPost.contentType](currentPost.content[0], currentPost.caption)
        
        contents.push(content)
        for(i = 1; i < currentPost.content.length; i++) {
            contents.push(typesContents[currentPost.contentType](currentPost.content[i]))
        }
        console.log(contents)
        return contents
    },

}

const typesEntities = {
    text_link: "textEntityTypeUrl",
    mention: "textEntityTypeMention",
    hashtag: "textEntityTypeHashtag",
    cashtag: "textEntityTypeCashtag",
    bot_command: "textEntityTypeBotCommand",
    url: "textEntityTypeUrl",
    email: "textEntityTypeEmailAddress",
    bold: "textEntityTypeBold",
    italic: "textEntityTypeItalic",
    underline: "textEntityTypeUnderline",
    strikethrough: "textEntityTypeStrikethrough",
    spoiler: "textEntityTypeSpoiler",
    code: "textEntityTypeCode",
    pre: "textEntityTypePreCode",
    text_mention: "textEntityTypeMentionName"
}

const typesContents = {
    messagePhoto: inputMessagePhoto,
    messageVideo: inputMessageVideo,
    messageAudio: inputMessageAudio,
    messageDocument: inputMessageDocument
}

function entitiesBotInTdl(entities) {
    var _entities = []
    for(i = 0; i < entities.length; i++) {
        _entities.push({
            offset: entities[i].offset,
            length: entities[i].length,
            type: addTypeEntities(entities[i])
        })
    }
    return _entities
}


function addTypeEntities(entities) {
    if(entities.type == "text_link") {
        return {
            _: typesEntities[entities.type],
            url: entities.url
        }
    } else if(entities.type == "pre") {
        return {
            _: typesEntities[entities.type],
            language: entities.language
        }
    } else if(entities.type == "text_mention") {
        return {
            _: typesEntities[entities.type],
            userId: entities.user.id
        }
    } else {
        return {
            _: typesEntities[entities.type]
        }
    }
}

function inputFile(id) {
    return {
        _: "inputFileRemote",
        id: id
    }
}

function inputMessagePhoto(id, caption = null) {
    return {
        _: "inputMessagePhoto",
        photo: inputFile(id),
        caption: caption
    }
}

function inputMessageAudio(id, caption = null) {
    return {
        _: "inputMessageAudio",
        audio: inputFile(id),
        caption: caption
    }
}

function inputMessageDocument(id, caption = null) {
    return {
        _: "inputMessageDocument",
        document: inputFile(id),
        caption: caption
    }
}

function inputMessageVideo(id, caption = null) {
    return {
        _: "inputMessageVideo",
        video: inputFile(id),
        caption: caption
    }
}
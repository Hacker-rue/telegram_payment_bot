const { replyChannelPost, getMainChannel, setMainChannel, getSpamChannels } = require('./spamModule')
const add = require('./spamModule')
const { getInvoice } = require("./paymentModule")

const admins_id = [1029277564, 394138820]

var session = {
    
}

module.exports = {
    updateMessage,
    updateStart,
    updateHelp,
    teamHandler: {
        addDonation,
        addSpamChannel,
        addMainChannel,
        delSpamChannel,
        _getSpamChannel
    }
}

async function updateStart(ctx) {
    if(admin(ctx.from.id)) {
        session[ctx.from.id] = 0
        await ctx.reply("Добро пожаловать!\n" + 
            "Бот поможет вам добавить кнопку доната в ваш канал или группу!\n" +
            "А так же поможет вам сделать авто-спам постов из основного канала в дополнительные" +
            "Для получения списка команд введите /help " +
            "Инструкция по настройке бота: https://github.com/Hacker-rue/telegram_payment_bot")
    } else {
        await ctx.reply("У вас нет доступа к боту")
    }
}

async function updateHelp(ctx) {
    if(admin(ctx.from.id)) {
        session[ctx.from.id] = 0
        await ctx.reply("Доступные команды:\n" + 
        "/addDonation - добовляет кнопку оплаты в чат\n"+
        "/addMainChannel - добовляет или меняет канал откуда копируются посты\n" +
        "/addSpamChannel - добовляет новый канала куда копируются посты\n" + 
        "/delSpamChannel - удаляет новый канала куда копируются посты\n" + 
        "/getSpamChannel - показывает все каналы для спама в виде их id")
    } else {
        await ctx.reply("У вас нет доступа к боту")
    }
}

async function updateMessage(ctx) {
    if(ctx.message.is_automatic_forward) {
        if(ctx.message.sender_chat.id == getMainChannel()) {
            await replyChannelPost()
        }
    } else {
        if(admin(ctx.from.id)) {
            menu(ctx)
        }
    }
}

async function addDonation(ctx) {
    if(admin(ctx.from.id)) {
        session[ctx.from.id] = 1
        ctx.reply("Чтобы добавить кнопку доната введите id чата, куда добавить кнопку, если необходимо добавить в данный чат введите 0.")
    } else {
        await ctx.reply("У вас нет доступа к боту")
    }
}

async function addMainChannel(ctx) {
    if(admin(ctx.from.id)) {
        session[ctx.from.id] = 2
        ctx.reply("Для смены id канала из которого будут пересылаться посты, необходимо добавить бота в канал и группу которая используется для комментариев данного канала в роли администратора и ввести id канала, если id будет не правильный или у бота не будет доступа посты пересылаться не будут.")
    } else {
        await ctx.reply("У вас нет доступа к боту")
    }
}

async function addSpamChannel(ctx) {
    try {
        if(admin(ctx.from.id)) {
            session[ctx.from.id] = 3
            ctx.reply("Для добавления нового канала куда пересылать сообщения, необходимо отправить id канала и id группы обсуждений данного канала в такой форме: idChannel = idGroup.\nПользователь от чьего имени пересылаются посты должен состоять и в канале и в группе.")
        } else {
            await ctx.reply("У вас нет доступа к боту")
        }
    } catch(er) {
        console.log(er)
    }
    
}

async function delSpamChannel(ctx) {
    if(admin(ctx.from.id)) {
        session[ctx.from.id] = 4
        ctx.reply("Для удаления канала введите его Id")
    } else {
        await ctx.reply("У вас нет доступа к боту")
    }
}

async function _getSpamChannel(ctx) {
    if(admin(ctx.from.id)) {
        session[ctx.from.id] = 0
        ctx.reply(getChannel())
    } else {
        await ctx.reply("У вас нет доступа к боту")
    }
}



async function menu(ctx) {
    switch(session[ctx.from.id]) {
        case 1:
            await _addDonation(ctx)
            break
        case 2:
            await _addMainChannel(ctx)
            break
        case 3:
            await _addSpamChannel(ctx)
            break
        case 4:
            await _delSpamChannel(ctx)
            break
        default:
            session[ctx.from.id] = 0
            await ctx.reply("Доступные команды:\n" + 
            "/addDonation - добовляет кнопку оплаты в чат\n"+
            "/addMainChannel - добовляет или меняет канал откуда копируются посты\n" +
            "/addSpamChannel - добовляет новый канала куда копируются посты\n" + 
            "/delSpamChannel - удаляет новый канала куда копируются посты\n" + 
            "/getSpamChannel - показывает все каналы для спама в виде их id")
    }
}

async function _addDonation(ctx) {
    if(ctx.message.text == "0") {
        await ctx.replyWithInvoice(getInvoice(ctx.chat.id))
        session[ctx.from.id] = 0
    } else {
        try {
            await ctx.replyWithInvoice(getInvoice(ctx.message.text))
            session[ctx.from.id] = 0
            await ctx.reply("Кнопка доната успешно добавленна")
        } catch {
            await ctx.reply("Не правильный ID канала: у бота нет доступа или вы ввели некорректный ID.")
        }
    }
}

async function _addMainChannel(ctx) {
    var mainChannel = Number(ctx.message.text)
    console.log(mainChannel)
    if(mainChannel) {
        var spamChannels = getSpamChannels()
        for(var i = 0; i <spamChannels.length; i++) {
            if(spamChannels[i].idChannel == mainChannel) {
                await ctx.reply("Id канала из которго берутся посты не может быть равен id канала в который будут пересылаться посты")
                return
            }
        }
        setMainChannel(mainChannel)
        session[ctx.from.id] = 0
        await ctx.reply("Id канала успешно добавлен")
    } else {
        await ctx.reply("Id не может содержать ничего кроме цифр и знака - перед числом")
    }
}

async function _addSpamChannel(ctx) {
    try {
        var word = ctx.message.text.split("=")
        if(word.length == 2) {
            console.log(word)
            var idChannel = word[0].trim()
            var idDiscussionGroup = word[1].trim()
            var idChannel = Number(idChannel)
            var idDiscussionGroup = Number(idDiscussionGroup)
            if(idChannel && idDiscussionGroup) {
                var spamChannels = getSpamChannels()
                for(var i = 0; i < spamChannels.length; i++) {
                    if(spamChannels[i].idChannel == idChannel) {
                        await ctx.reply("Вы уже добавили данную группу")
                        session[ctx.from.id] = 0
                        return
                    }
                }
                session[ctx.from.id] = 0
                add.addSpamChannel(idChannel, idDiscussionGroup)
                await ctx.reply("Вы успешно добавили новый канал для спама\n\n" + getChannel())
            } else {
                await ctx.reply("Id не может содержать ничего кроме цифр и знака - перед числом")
            }
        } else {
            await ctx.reply("Вы отправили не правильное количество параметров или не по шаблону, попробуйте еще раз")
        }
    } catch(er) {
        console.log(er)
    }
}

async function _delSpamChannel(ctx) {
    var idChannel = Number(ctx.message.text)
    if(idChannel) {
        if(add.delSpamChannel(idChannel)) {
            session[ctx.from.id] = 0
            ctx.reply("Вы успешно удалили группу\n\n" + getChannel())
        } else {
            session[ctx.from.id] = 0
            await ctx.reply("Не удалось удалить группу, попробуйте еще раз /help")
        }
    } else {
        await ctx.reply("Id не может содержать ничего кроме цифр и знака - перед числом")
    }
}

function admin(id) {
    for(i = 0; i < admins_id.length; i++) {
        if(admins_id[i] == id) return true
    }
    return false
}

function getChannel() {
    var spamChannels = getSpamChannels()
    var str = "Список групп для спама:\n"
    for(var i = 0; i < spamChannels.length; i++) {
        str+="Id канала: " + spamChannels[i].idChannel + "\n" +
        "Id группы для обсуждений: " + spamChannels[i].idDiscussionGroup + "\n\n"
    }
    return str
}
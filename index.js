const { Telegraf, Markup } = require('telegraf')
require('dotenv').config()
const admins_id = [1029277564, 394138820]

const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN)

var invoice = {
    title: "TEST", //Название продукта, 1-32 символа
    description: "Описание вашего продукта.....", //Описание продукта, 1-255 знаков
    prices: [{label: "Сумма" /*Название товара*/, amount: 100 /*Цена товара, в рублях*/}],
    max_tip_amount: 5000, //Максимальная сумма чаевых в рублях
    suggested_tip_amounts: [200, 300, 500], //возможные варианты чаевых в рублях
    button_text: "Поддержать" //Текст кнопки оплаты
}

var config = {
    mainChannel: -1001790175470,
    spamChannels: [{id: -1001893986335, chat_group_id: -1001510338058}]
}

bot.start(async ctx => {
    if(admin(ctx.from.id)) {
        await ctx.reply("Добро пожаловать!\n" + 
            "Бот поможет вам добавить кнопку доната в ваш канал или группу!\n" +
            "Для получения списка команд введите /help " +
            "Инструкция по настройке бота: https://github.com/Hacker-rue/telegram_payment_bot")
    } else {
        await ctx.reply("У вас нет доступа к управлению ботом")
    }
})

bot.help(async ctx => {
    if(admin(ctx.from.id)) {
        await ctx.reply("Доступные команды:\n" + 
        "/addDonation - добовляет кнопку оплаты в канал или группу имеет 2 способа ввода:\n" + 
        "Принимает один аргумент через пробел: ID канала, если не передать то создаст кнопку в чате где была вызванна команда.\n\n" +
        "Пример команды: /addDonation -123231232")
    } else {
        await ctx.reply("У вас нет доступа к управлению ботом")
    }
})

bot.on("message" , async (ctx) => {
    var text = ctx?.message?.text
    if(admin(ctx.from.id)) {
        var world =  text.split(' ')
        if(text) {
            if(world[0] == "/addDonation") {
                if(world.length == 2) {
                    try {
                        await ctx.replyWithInvoice(getInvoice(world[1], invoice.title, invoice.description, 
                            prices(invoice.prices), invoice.max_tip_amount, invoice.suggested_tip_amounts, invoice.button_text))
                    } catch(er) {
                        await ctx.reply("Не правильный ID канала, у бота нету доступа или вы ввели некорректный ID.")
                    }
                } else {
                    try {
                        await ctx.replyWithInvoice(getInvoice(ctx.chat.id, invoice.title, invoice.description, 
                            prices(invoice.prices), invoice.max_tip_amount, invoice.suggested_tip_amounts, invoice.button_text))
                    } catch(er) {
                        console.log(er)
                    } 
                }
            } else {
                await ctx.reply("Такой команды нет.")
            }
        } else {
            await ctx.reply("У вас нет доступа к управлению ботом.")
        }
    }
    if(ctx.message?.is_automatic_forward) {
        if(auth(ctx.message.sender_chat.id)) {
            addIdLastPublication(ctx.message.sender_chat.id, ctx.message.message_id, ctx.message.chat.id)
        }
    }
})

bot.on("channel_post", async (ctx) => {
    if(ctx.channelPost.chat.id == config.mainChannel) {
        console.log(ctx.channelPost)
        for(i = 0; i < config.spamChannels.length; i++) {
            ctx.copyMessage(config.spamChannels[i]["chat_group_id"], 
                {reply_to_message_id: config.spamChannels[i]["idLastPublication"]})
        }
    } else if(await auth(ctx.channelPost.chat.id)) {
        console.log(ctx.channelPost)
        console.log(ctx.message)
        addIdLastPublication(ctx.channelPost.chat.id, ctx.channelPost.message_id)
    }
})


bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true)) // ответ на предварительный запрос по оплате

const admin = (id) => {
    for(i = 0; i < admins_id.length; i++) {
        if(admins_id[i] == id) return true
    }
    return false
}

async function auth(chat_id) {
    for(i = 0; i < config.spamChannels.length; i++) {
        if(chat_id == config.spamChannels[i].id) {
            return true;
        }
    }
    return false;
}

const prices = (_prices) => {
    var result = []
    _prices.forEach(element => {
        result.push({label: element.label, amount: element.amount*100})
    })
    return result
}

const getInvoice = (chat_id, title, description, prices, max_tip_amount, suggested_tip_amounts, button_text) => {
    var amounts = []
    suggested_tip_amounts.forEach(element => {
        amounts.push(element*100)
    });

    const _markup = Markup.inlineKeyboard([[{text: button_text, pay: true}]])
    const invoice = {
        chat_id: chat_id,
        provider_token: process.env.PROVIDER_TOKEN,
        start_parameter: '',
        title: title,
        description: description,
        currency: 'RUB',
        prices: prices,
        payload: {
            unique_id: `${chat_id}_${Number(new Date())}`,
            provider_token: process.env.PROVIDER_TOKEN 
        },
        max_tip_amount: max_tip_amount*100,
        suggested_tip_amounts: amounts,
        reply_markup: _markup.reply_markup
    }
    return invoice
}

bot.launch()
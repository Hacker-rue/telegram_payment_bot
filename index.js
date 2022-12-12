const { Telegraf, Context } = require('telegraf')
const { login, update, replyChannelPost, updateHandler } = require('./modules/spamModule')
const { prices, getInvoice } = require('./modules/paymentModule')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

const admins_id = [1029277564, 394138820]

const mainChannel = -1001790175470

var invoice = {
    title: "TEST", //Название продукта, 1-32 символа
    description: "Описание вашего продукта.....", //Описание продукта, 1-255 знаков
    prices: [{label: "Сумма" /*Название товара*/, amount: 100 /*Цена товара, в рублях*/}],
    max_tip_amount: 5000, //Максимальная сумма чаевых в рублях
    suggested_tip_amounts: [200, 300, 500], //возможные варианты чаевых в рублях
    button_text: "Поддержать" //Текст кнопки оплаты
}

bot.start(async ctx => {
    if(admin(ctx.from.id)) {
        await ctx.reply("Добро пожаловать!\n" + 
            "Бот поможет вам добавить кнопку доната в ваш канал или группу!\n" +
            "А так же поможет вам сделать авто-спам постов из основного канала в дополнительные" +
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
    var text = ctx["message"]["text"]
    if(admin(ctx.from.id)) {
        var world = text.split(' ')
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
    if(ctx.message.is_automatic_forward) {
        if(ctx.message.sender_chat.id == mainChannel) {
            await replyChannelPost()
        }
    }
})


bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true)) // ответ на предварительный запрос по оплате

const admin = (id) => {
    for(i = 0; i < admins_id.length; i++) {
        if(admins_id[i] == id) return true
    }
    return false
}


login()
update("error", console.error)
update("update", updateHandler)
bot.launch()
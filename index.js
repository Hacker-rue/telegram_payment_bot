const { Telegraf } = require('telegraf')
const { login, update, updateHandler } = require('./modules/spamModule')
const { updateHelp, updateMessage, updateStart, teamHandler } = require('./modules/botModule')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)


bot.start(updateStart)
bot.help(updateHelp)
bot.hears("/addDonation", teamHandler.addDonation)
bot.hears("/addMainChannel", teamHandler.addMainChannel)
bot.hears("/addSpamChannel", teamHandler.addSpamChannel)
bot.hears("/delSpamChannel", teamHandler.delSpamChannel)
bot.hears("/getSpamChannel", teamHandler._getSpamChannel)

bot.on("message", updateMessage)


bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true)) // ответ на предварительный запрос по оплате

bot.launch()
login()
update("error", console.error)
update("update", updateHandler)
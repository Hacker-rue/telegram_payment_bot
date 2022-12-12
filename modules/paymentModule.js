const { Markup } = require('telegraf')
require('dotenv').config()


module.exports = {
    prices, 
    getInvoice
}

function prices(_prices) {
    var result = []
    _prices.forEach(element => {
        result.push({label: element.label, amount: element.amount*100})
    })
    return result
}

function getInvoice(chat_id, title, description, prices, max_tip_amount, suggested_tip_amounts, button_text) {
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
const { Markup } = require('telegraf')
require('dotenv').config()


module.exports = {
    getInvoice
}

var invoice = {
    title: "TEST", //Название продукта, 1-32 символа
    description: "Описание вашего продукта.....", //Описание продукта, 1-255 знаков
    prices: [{label: "Сумма" /*Название товара*/, amount: 100 /*Цена товара, в рублях*/}],
    max_tip_amount: 5000, //Максимальная сумма чаевых в рублях
    suggested_tip_amounts: [200, 300, 500], //возможные варианты чаевых в рублях
    button_text: "Поддержать" //Текст кнопки оплаты
}

function prices(_prices) {
    var result = []
    _prices.forEach(element => {
        result.push({label: element.label, amount: element.amount*100})
    })
    return result
}

function getInvoice(chat_id) {
    var amounts = []
    invoice.suggested_tip_amounts.forEach(element => {
        amounts.push(element*100)
    });

    const _markup = Markup.inlineKeyboard([[{text: invoice.button_text, pay: true}]])
    const _invoice = {
        chat_id: chat_id,
        provider_token: process.env.PROVIDER_TOKEN,
        start_parameter: '',
        title: invoice.title,
        description: invoice.description,
        currency: 'RUB',
        prices: prices(invoice.prices),
        payload: {
            unique_id: `${chat_id}_${Number(new Date())}`,
            provider_token: process.env.PROVIDER_TOKEN 
        },
        max_tip_amount: invoice.max_tip_amount*100,
        suggested_tip_amounts: amounts,
        reply_markup: _markup.reply_markup
    }
    return _invoice
}
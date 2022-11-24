# DonationSupport
> Телеграм бот для получения донатов от пользователей в телеграм каналах.

## Оглавление:
1) [Установка](#установка)
1.1) [Регистрация-бота](#регистрация-бота)
1.2) [Регистрация провайдера платежей](#регистрация-провайдера-платежей)
1.3) [Создание бота](#создание-бота)
1.4) [Настройка конфигураци](#настройка-конфигураци)
1.5) [Запуск бота](#запуск-бота)
2) [Инструкция по использованию бота](#инструкция-по-использованию-бота)

# Установка

## Регистрация бота

Для регистрации бота нужен только Telegram. Находим в нем BotFather (@BotFather):
![BotFather](https://habrastorage.org/r/w1560/webt/o3/ca/yo/o3cayo0nllqv4zon8advwgfluyi.png)

Нажимаем на Start и получаем список команд:
![start](https://habrastorage.org/r/w1560/webt/ui/4n/4v/ui4n4v12uvfcov2njnx44ldt9hc.png)

Выполняем команду /newbot для создания бота, указываем имя и username бота (username должно быть уникальным в пределах Telegram), например: "Neo" и "aio350_reminder_bot".
![newbot](https://habrastorage.org/r/w1560/webt/su/0s/mo/su0smomium-nrapuom1k-xhq7pe.png)

Получаем токен доступа: 5372263544:...

Отлично вы зарегестрировали нового бота!

## Регистрация провайдера платежей

Для получения токена провайдера платежей необходимо использовать бота BotFather.
Выполняем команду /mybots для получения списка наших ботов, выбираем только что созданного бота и нажимаем Payments:
![Payments](https://i.ibb.co/k31g872/image.png)

Выбираем необходимого провайдера и следуем инструкциям. В итоге вы должны будете получить токен провайдера.
## Создание бота

Вы можете использовать наш код

**Клонировать репозиторий**
```
git clone https://github.com/Hacker-rue/telegram_payment_bot.git
```

Или разработать своего бота

## Настройка конфигураци

В клонированном репозиторие создаете файл .env и добовляете полученные токены(бота и платежного провайдера)

```
TELEGRAM_API_TOKEN=5971466479:...
PROVIDER_TOKEN=401643678...
```

Команды бота может вызвать только администратор.

Добовляем администраторов:
```js
const admins_id = [1029277564, 394138820] //user_id - уникальный идентификатор пользователя
```

Дальше вы можете настроить конфигурацию оплаты, название, описание, цены и текст кнопки.

```js
    title: "TEST", //Название продукта, 1-32 символа
    description: "Описание вашего продукта.....", //Описание продукта, 1-255 знаков
    prices: [{label: "Сумма" /*Название товара*/, amount: 100 /*Цена товара, в рублях*/}],
    max_tip_amount: 5000, //Максимальная сумма чаевых в рублях
    suggested_tip_amounts: [200, 300, 500], //возможные варианты чаевых в рублях
    button_text: "Поддержать" //Текст кнопки оплаты
```

## Запуск бота

```
npm run start
```

Поздравляю, ваш бот запущен.

# Инструкция по использованию бота

### Список команд:
1) /start
2) /help
3) /addDonation

#### /start
Запускает бота

#### /help
Выводит информацию по командам

#### /addDonation

Создает и отправляет новый счет для оплаты

Может быть вызванна как без аргументов так и с 1 аргументом.

Если вызвать команду без агрументов то она создаст счет в том чате где была вызванна(не работает для каналов)

Чтобы создать кнопку в канале, необходимо передать id канала куда необходимо добавить счет. Чтобы узнать id канала, можно использовать бота IDBot(@username_to_id_bot):
![chanel_id](https://i.ibb.co/DkCPMQC/image.png)

Находим его в телеграм, запускаем пересылаем ему сообщение из канала, id которого выхотите узнать. Так же с помощью этого бота можно узнать свой user_id

Выполняем команду:
```
/addDonation -1001790175470
```

Готово вы добавили счет в ваш канал.


**Важно, бот должен быть добавлен в канал или группу и иметь права администратора!!!**
const mineflayer = require("mineflayer")
const config = require('./config.json')
const vec3 = require("vec3")
const ClickWindow = require('./lib/clickWindow')

const Login = (bot) => {
    setTimeout(() => {
        bot.chat('/register 99099909 99099909')
        bot.chat('/login 99099909')
    }, 5000);
    bot.once('spawn', () => {
        bot.once('spawn', () => {
            bot.chat('/survival')
            bot.once('spawn', () => {
            })
        })
    })
}

const ManageChat = (bot) => {
    bot.on("messagestr", (message) => {

        // Check if chat Log is true in the config.json
        if (config.chatLog) {
            console.log(message);
        }


        // Run commands
        const command = message.split(" ")
        try {
            var username = command[2].replace(":", "")
        } catch (err) {
            var username = ""
        }
        // Check if message is from admins
        if (config.admins.includes(username)) {
            switch (command[3]) {

                // put items in trash Dispenser
                case "trash":
                    trash(bot)
                    break;

                // tp to player
                case "tp":
                    bot.chat(`/tpa ${command[4]}`)
                    break

                // sell items
                case "sell":
                    if (command[4] == "stop") {
                        sellItem(bot, "stop")
                    } else {
                        sellItem(bot, "start")
                    }
                    break

                // log inventory
                case "inv":
                    logInventory(bot)
                    break
                case "pay":
                    pay(bot, command[4])
                    break
                case 'bal':
                    bot.chat('/bal')

                    var listener = async (message) => {
                        if (message.includes('Balance:')) {
                            bot.chat(`/msg ${command[4]} ${message}`)
                        }
                    };
                    bot.on('messagestr', listener);
                    break
            }
        }
    })
}

// Pay mony
function pay(bot, username) {
    bot.chat('/bal')
    // Balance:
    var listener = async (message) => {
        if (message.includes('Balance:')) {
            var bal = message.split(' ')[1]
            bal = bal.replace('$', '')
            bal = bal.replace(',', '')
            bot.chat(`/pay ${username} ${bal}`)
            bot.removeListener('messagestr', listener);
        }
    };
    bot.on('messagestr', listener);
}

// log inventory items
function logInventory(bot) {
    console.log(bot.inventory.item());
}

// sell items
var continueSell;
const sellItem = (bot, action) => {
    if (action == "start") {
        var timeout = setTimeout(() => {
            sellItem(bot, 'stop')
            sellItem(bot, 'start')
        }, 30000)
        var step = ''
        continueSell = true
        try {
            const StoragePOS = bot.blockAt(vec3(config.storage_pos.x, config.storage_pos.y, config.storage_pos.z))
            bot.openBlock(StoragePOS, new vec3(0, 1, 0)).then(async (storage) => {
                await ClickWindow(bot, storage, 22, 1, 1)
                await bot.closeWindow(storage)
                let myInt0, myInt, shopInt
                step = 'open_shop'
                bot.chat('/shop')
                var OpenListener = async (window) => {
                    switch (step) {
                        case 'open_shop':
                            clearInterval(shopInt)
                            myInt0 = setInterval(async () => {
                                step = 'click_ores'
                                await ClickWindow(bot, window, 19, 1, 0)
                            }, 300);
                            break;
                        case 'click_ores':
                            myInt = setInterval(async () => {
                                clearInterval(myInt0)
                                await ClickWindow(bot, window, 23, 1, 1)
                            }, 300)
                            var listener = async (message) => {
                                if (message.includes('SHOP You')) {
                                    bot.removeListener('messagestr', listener);
                                    clearInterval(myInt)
                                    step = 'solled'
                                    await bot.closeWindow(window)
                                }
                            };
                            bot.on('messagestr', listener);
                            break;
                        default:
                            break;
                    }
                }
                bot.on('windowOpen', OpenListener)
                var CloseListener = () => {
                    switch (step) {
                        case 'solled':
                            if (continueSell) {
                                clearTimeout(timeout)
                                sellItem(bot, "start")
                                bot.removeListener("windowOpen", OpenListener)
                                bot.removeListener("windowClose", CloseListener)
                            }else{
                                clearTimeout(timeout)
                                bot.removeListener("windowOpen", OpenListener)
                                bot.removeListener("windowClose", CloseListener)
                            }
                            break;
                        case 'open_shop':
                            bot.chat('/shop')
                            break
                        default:
                            bot.chat('/shop')
                            break;
                    }
                }
                bot.on('windowClose', CloseListener)
            }).catch(err => {
                if (continueSell) {
                    sellItem(bot, "start")
                }
            })
        } catch (error) {
            if (continueSell) {
                sellItem(bot, "start")
            }
        }

        bot.unequip("hand")
    } else if (action == "stop") {
        continueSell = false
    }
}

const createBot = () => {
    const bot = mineflayer.createBot({
        username: "ATSMan",
        host: "play.paradise-city.ir",
        version: "1.16.5"
    })


    Login(bot)
    ManageChat(bot)

    bot.on('kicked', console.log)
    bot.on('error', console.log)

    return bot
}
const bot = createBot()

bot.on('kicked', () => {
    createBot()
})
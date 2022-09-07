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
            bal = bal.replace('$' , '')
            bal = bal.replace(',' , '')
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
        continueSell = true
        const StoragePOS = bot.blockAt(vec3(config.storage_pos.x, config.storage_pos.y, config.storage_pos.z))
        bot.unequip("hand")
        bot.openBlock(StoragePOS, new vec3(0, 1, 0)).then(async (storage) => {
            await ClickWindow(bot, storage, 22, 1, 1)
            await storage.close()
            bot.chat('/shop')
            bot.once("windowOpen", async (shop) => {
                await ClickWindow(bot, shop, 19, 1, 0)
                bot.once("windowOpen", async (shop2) => {
                    var myInt = setInterval(async ()=>{
                        await ClickWindow(bot, shop2, 23, 1, 1)
                    }, 300)
                    var listener = async (message) => {
                        if (message.includes('SHOP You')) {
                            await bot.closeWindow(shop2)
                            bot.removeListener('messagestr', listener);
                            clearInterval(myInt)
                        }
                    };
                    bot.on('messagestr', listener);
                    bot.once("windowClose", async (shop2) => {
                        if (continueSell) {
                            sellItem(bot, "start")
                        }
                    })
                })
            })
        }).catch(err => {
            if (continueSell) {
                sellItem(bot, "start")
            }
        })
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

bot.on('kicked' , ()=>{
    createBot()
})
const mineflayer = require("mineflayer")
const vec3 = require("vec3")
const ClickWindow = require('./lib/clickWindow')
const fs = require('fs')
const { log, inputBar } = require("blessed-console-input")
const color = require("./lib/colors")
var cReset = color.reset

// global.console.log = log
global.console.log = () => {}

// Print ERRORS
function addError(bot, err) {
    if (bot.config.errorLog) {
        log(color.bg.red + color.dim + "[ERROR]" + cReset + " " + color.fg.red + err + cReset);
    }
    if (bot.config.errMSG) {
        for (admin of bot.config.admins) {
            bot.chat(`/msg ${admin} [ERROR] ${info}`)
        }
    }
}

// Print Infos
function setInfo(bot, info) {
    if (bot.config.infoLog) {
        log(color.bg.green + color.dim + "[INFO]" + cReset + " " + color.fg.green + info + cReset)
    }
    if (bot.config.infoMSG) {
        for (admin of bot.config.admins) {
            bot.chat(`/msg ${admin} [INFO] ${info}`)
        }
    }
}

const Login = (bot) => {
    const pass = bot.config.bot_info.password
    setTimeout(() => {
        bot.chat(`/register ${pass} ${pass}`)
        setTimeout(() => { bot.chat(`/login ${pass}`) }, 300)
    }, bot.config.login_timeout);
    bot.once('spawn', () => {
        bot.once('spawn', () => {
            bot.chat(bot.config.server_command)
            bot.once('spawn', () => {
            })
        })
    })
}

function ManageCommand(bot ,command, args = []) {
    switch (command) {
        // put items in trash Dispenser
        case "trash":
            trash(bot)
            break;
        // tp to player
        case "tp":
            bot.chat(`/tpa ${args[0]}`)
            break
        // sell items
        case "sell":
            if (args[0] == "stop") {
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
            pay(bot, args[0])
            break
        case 'bal':
            bal(bot)
            break
        case 'say':
            breaknode
    }
}

const ManageChat = (bot) => {
    bot.on("messagestr", (message) => {

        // Check if chat Log is true in the config.json
        if (bot.config.chatLog) {
            log(color.bg.blue + color.dim + "[CHAT]" + cReset + " " + color.fg.blue + message + cReset);
        }

        // Run commands
        const command = message.split(" ")
        try {
            var username = command[2].replace(":", "")
        } catch (err) {
            var username = ""
        }

        var cmd = command[3]
        var args = command.slice(4)
        // Check if message is from admins
        if (bot.config.admins.includes(username)) {
            ManageCommand(bot ,cmd, args)
        }
    })
}

// Put items in trash chest
async function trash(bot) {
    bot.unequip("hand")

    // fined trash Dispenser
    const TrashChestPos = bot.blockAt(vec3(bot.config.trash_pos.x, bot.config.trash_pos.y, bot.config.trash_pos.z))
    const items = bot.inventory.items();
    const itemTyps = []
    items.forEach(item => {
        itemTyps.push({
            'type': item.type,
            'meta': item.metadata,
            'count': item.count
        });
    });

    bot.openChest(TrashChestPos).then((chest) => {

        function dipositor(i) {
            if (i >= itemTyps.length) {
                chest.close();
                setInfo(bot, "all items are in trash")
                return
            }
            chest.deposit(itemTyps[i].type, itemTyps[i].metadata, itemTyps[i].count)
            setTimeout(() => {
                dipositor(i + 1)
            }, 500)
        }

        dipositor(0)
    }).catch((err) => {
        addError(bot, "Can not fined Trash Dispenser!")
    });


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

// send Ball to admins
function bal(bot) {
    bot.chat('/bal')
    // Balance:
    var listener = async (message) => {
        if (message.includes('Balance:')) {
            var bal = message.split(' ')[1]
            bal = bal.replace('$', '')
            bal = bal.replace(',', '')
            for (admin of bot.config.admins) {
                bot.chat(`/msg ${admin} Balance: ${bal}`)
            }
            bot.removeListener('messagestr', listener);
        }
    };
    bot.on('messagestr', listener);
}

// log inventory items
function logInventory(bot) {
    log(bot.inventory.item());
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
            const StoragePOS = bot.blockAt(vec3(bot.config.storage_pos.x, bot.config.storage_pos.y, bot.config.storage_pos.z))
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
                            } else {
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

const createBot = (config) => {
    const bot = mineflayer.createBot({
        username: config.bot_info.username,
        host: config.bot_info.host,
        version: config.bot_info.version,
        port: config.bot_info.port
    })

    bot.config = config

    Login(bot)
    ManageChat(bot)

    bot.on('kicked', log)
    bot.on('error', log)

    return bot
}

var bot = {};
fs.readFile('./config.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const config = JSON.parse(data)
    log(config);
    bot = createBot(config)
});

inputBar.on("submit", (text) => {
    try {
        var cmds = text.split(' ')
        var cmd = cmds[0]
        var args = cmd.slice(1)
        ManageCommand(bot, cmd, args)
    } catch (error) {
        log(error.message)
    }
})
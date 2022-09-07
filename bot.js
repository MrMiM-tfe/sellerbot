const mineflayer = require("mineflayer")
const config = require('./config.json')


const Login = (bot) => {
    setTimeout(() => {
        bot.chat('/login mahdi9909')
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

            console.log(message);
        

    //     // Run commands
        const command = message.split(" ")
        console.log(command);
        try {
            var username = command[2].replace(":", "")
        } catch (error) {
            var username = ""
            
        }

        if (config.admins.includes(username)) { // Check if message is from admins
            switch (command[3]) {

                // put items in trash Dispenser
                case "trash":
                    trash(bot)
                    break;

                // log inventory items
                case "tp":
                    bot.chat("/tpa plusboy15")
                    break
            }
        }
    })
}


const createBot = () => {
    const bot = mineflayer.createBot({
        username: "MrMiM",
        host: "play.paradise-city.ir",
        version: "1.16.5"
    })
    

    Login(bot)
    ManageChat(bot)

    bot.on('kicked', console.log)
    bot.on('error', console.log)
}
createBot()

const mineflayer  = require("mineflayer")

const bot = mineflayer.createBot({
    username: "plusboy15",
    host: "play.paradise-city.ir",
    version: "1.16.5"
})

bot.once('spawn' ,() => {
    console.log('done');
})

bot.on('chat' , (user ,msg) => {
    console.log(msg);
})

bot.on('kicked', console.log)
bot.on('error', console.log)
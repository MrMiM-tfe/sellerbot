const mineflayer  = require("mineflayer")

const bot = mineflayer.createBot({
    username: "MrMiM",
    host: "play.paradise-city.ir",
    version: "1.16.5"
})

bot.once('spawn' ,() => {
    console.log('done');
    bot.once('spawn' ,() => {
        bot.chat('/survival')
    })
    

})
setTimeout(() => {
    bot.chat('/login mahdi9909')
    
}, 5000);

bot.on('chat' , (user ,msg) => {
    console.log(msg);
})

bot.on('kicked', console.log)
bot.on('error', console.log)
ClickWindow = (bot, window, slot, mouseButton, mode) => {

    const Item = require('prismarine-item')(bot.version)

    let nextActionNumber = 0

    function createActionNumber() {
        nextActionNumber = nextActionNumber === 32767 ? 1 : nextActionNumber + 1
        return nextActionNumber
    }

    const actionId = createActionNumber()

    const click = {
        slot,
        mouseButton,
        mode,
        id: actionId,
        windowId: window.id,
        item: slot === -999 ? null : window.slots[slot]
    }

    bot._client.write('window_click', {
        windowId: window.id,
        slot,
        mouseButton,
        action: actionId,
        mode,
        item: Item.toNotch(mode === 2 || mode === 4 ? null : click.item)
    })
}

module.exports = ClickWindow
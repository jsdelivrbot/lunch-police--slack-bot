module.exports = function (controller) {

  controller.hears('^\s*help', 'direct_message,direct_mention', async function (bot, message) {

    bot.whisper(message, `"add" : subscribe yourself to lunch\n
"remove" : unsubscribe yourself from lunch\n
"add <user mentions>" : subscribe multiple users to lunch\n
"remove <user mentions>" : unsubscribe multiple users from lunch\n
"who" : show the person having lunch duty\n
"ask @user" : ask @user to do lunch duty\n
"lunch" : show people subscribed to lunch\n
"monitor presence" : start monitoring this channel for presence daily (should be done immediately after adding bot to workspace)\n
"last month" : show last month presence of users\n
"all records" : show presence for all months\n
"all records --detail(-d)" :  show presence for all days\n
"help" : show this message`)

  })
}

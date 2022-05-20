async function run(bot, message, guild, user) {
    message.channel.send("Hier könnte ihre Werbung stehen!");
    message.delete();
}
module.exports = {
    run,
}
const Discord = require('discord.js');

module.exports = {
    name: 'rules',
    description: 'Creates an embed of the server rules',
    usage: '[command]',
    args: false,
    permission: 'ADMINISTRATOR',
    execute(message, args) {
        const embed = new Discord.MessageEmbed();
        date = new Date();
        embed.setTitle('____________________________________________________________________________________')
            .setColor('00fbff')
            .setAuthor('Rules')
            .addField('Messages and text activity', 'Behave civilly in text channels. Avoid sending excessive messages. The text channels, with the exception of specially marked channels (\"fsk18\", \"nsfw\", \"unmoderated\") are all suitable for minors and the sending of content that is not suitable for minors is prohibited. Insulting, racist, anti-Semitic or otherwise disparaging statements are prohibited.', false)
            .addField('Calls and voice activity', 'all rules that concern text channels and are also applicable to voice channels also apply to them. Avoid excessive switching of voice channels. Make sure that the recording quality of your microphone generally does not disturb others, i.e. avoid hissing or interfering noises. Deliberately disturbing others is prohibited. The use of so-called soundboards is prohibited', false)
            .addField("Advertisement", "Advertising for another server or other services that are in competition with this server are generally prohibited. If you have well-founded objections why such a service should still be advertised, please contact the server administration (described in the \"Support\" section) to discuss an exception.", false)
            .addField("Support", " If you have any questions about the server, want to get help with a problem or want to report a player violating the rules of the server, please contact the \"Support Bot\" or write to the server administration directly.", false)
            .addField("Punishment", " The server administration reserves the right to impose penalties at its own discretion if the above rules are violated. imposed penalties are final and are not up for discussion.", false)
            .addField("Rule changes", " The server administration reserves the right to change or expand the rules at any time. If you do not agree to the changes, you can withdraw your consent at any time by removing your reaction.", false)
            .setFooter("Last modified at: " + format(date.getMonth() + 1) + "." + format(date.getDate()) + "." + date.getFullYear());
        message.channel.send(embed).then(sent => {
            sent.react('✅');
        });
        message.delete();
    },
};

function format(string) {
    string = '0' + string;
    return string.slice(-2);
}
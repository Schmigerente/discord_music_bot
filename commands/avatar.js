module.exports = {
	name: 'avatar',
	description: 'displays the avatar of the mentioned member(s)',
	guildOnly: true,
	permission: '',
    execute(message, args) {
        
        
        message.reply(message.author.id);
        return;
        if (args == 0) {
            message.reply('you must mention at least one member');
        }
		let members = message.mentions.members;
        if (members == null || members < 1) {
             return message.reply('you must mention at least one member');
        }
        
        for (member in members) {
            member.user.displayAvatarURL();
        }
	},
};
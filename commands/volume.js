const player = require('../util/player');
const guilds = require(__dirname + '/../util/guild_database.js').guilds;

module.exports = {
	name: 'volume',
	aliases: ['vol'],
	description: 'Pauses and resumes the audio playback.',
	guildOnly: true,
	permission: '',
	execute(message, args) {
        
		if(guilds.get(message.guild.id).queue == undefined) {
			return message.channel.send(`Please use the music function of the bot to perform this command !`);
		}
		if((args[0] == NaN || args[0] < 0 || args[0] > 10) && message.author.id != 139435319668768768) {
			return message.channel.send(`Please give a valid volume value [0-10] !`);
		}
        player.setVolume(message, args[0]);
	},
};

/*|| message.author.id == message.guild.owner.id*/
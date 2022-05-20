const ytdl = require('ytdl-core');
const player = require('../util/player');

const guilds = require(__dirname + '/../util/guild_database.js').guilds;

module.exports = {
	name: 'glay',
	description: 'Starts playback and creates queue if there none',
	usage: '',
	aliases: [],
	guildOnly: true,
	execute(message, args) {
        
        if (!message.member.voice.channel) {
			return message.reply('please join a voice channel first!');
		}
        
        var queue = player.getQueue(message);
        
        if (queue.voiceChannel != message.member.voice.channel) {
            return message.reply('please join the same channel as the bot!');
        }
        
        
        player.playLocal('D:\Music\Glitch Hop\Glitch Hop mix 45 min.mp3', queue);
	},
};

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

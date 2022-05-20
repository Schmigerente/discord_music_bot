const ytdl = require('ytdl-core');
const player = require('../util/player');

const guilds = require(__dirname + '/../util/guild_database.js').guilds;

module.exports = {
	name: 'ülay',
	description: 'Starts playback and creates queue if there none',
	usage: '[Youtube URL]',
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
        
        
        player.getSong(['https://www.youtube.com/watch?v=0y8hxx30niw'])
        .then(song => {
            string = player.pushQueue(queue, song);
            if (queue.playing == false) {
                queue.playing = true;
                player.play(queue);
            } else {
                message.channel.send('```' + string + '```');
            }
        });
	},
};

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

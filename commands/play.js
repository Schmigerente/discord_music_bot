const player = require('../util/player');
const guilds = require(__dirname + '/../util/guild_database.js').guilds;

module.exports = {
	name: 'play',
	description: 'Starts playback and creates queue if there none',
	usage: '[Youtube URL]',
	aliases: ['yt', 'youtube'],
    args: true,
	guildOnly: true,
	execute(message, args) {
        
		console.log(args)
		
        if (message.member.voice.channel == undefined) {
			return message.reply('please join a voice channel first!');
		}
        
        var queue = player.getQueue(message);
        
        if (queue.voiceChannel != message.member.voice.channel) {
            return message.reply('please join the same channel as the bot!');
        }
        
        player.getSong(args)
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

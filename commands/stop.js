const player = require('../util/player');

module.exports = {
	name: 'stop',
	description: 'Stops the playback and clears the queue',
	usage: '',
	aliases: [],
	guildOnly: true,
	async execute(message, args) {
        player.stop(player.getQueue(message));
	},
};

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

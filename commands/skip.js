const player = require('../util/player');

module.exports = {
	name: 'skip',
	description: 'Skips the current song in the queue.',
	aliases: ['next'],
	guildOnly: true,
	execute(message, args) {
		player.skip(player.getQueue(message));
	},
};
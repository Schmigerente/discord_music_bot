module.exports = {
	name: 'pause',
	description: 'Pauses and resumes the audio playback.',
	guildOnly: true,
	execute(message) {
		const dispatcher = message.guild.me.voice.connection.dispatcher;
		if(dispatcher.paused) {
			dispatcher.resume();
		} else {
			dispatcher.pause();
		}
	},
};
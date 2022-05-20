const Discord = require('discord.js');

module.exports = {
	name: 'about',
	description: 'tells you some things about me',
	usage: '',
    args : 0,
	execute(message, args) {
		author = message.author;
        me = message.client.user;
		
		const userEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('About ' + me.username, me.avatarURL)
            .setURL('https://discord.com/oauth2/authorize?client_id=&scope=bot%20applications.commands')
			//https://discord.com/api/oauth2/authorize?client_id=803620963715252264&permissions=0&scope=bot%20applications.commands
			.addFields(
                {name : 'Creator', value : 'Tigerentenclan', inline : true},
                {name : 'Add me to your server', value : '[[Click here to Add]](https://discord.com/oauth2/authorize?client_id=803620963715252264&scope=bot)' , inline : true}
             )
			.setTimestamp()
			.setFooter(message.author.username, message.author.avatarURL()
		);
		message.channel.send(userEmbed);
	},
};
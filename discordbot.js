const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const logger = require('./util/logger.js');
const guilds = require('./util/guild_database').guilds;

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] });

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	logger.log('#BOT-LOG: bot initialized. now listening to commands!');
	client.user.setActivity(prefix + 'help', { type: 'LISTENING' });
});

client.on('messageReactionAdd', (react, user) => {
	if (react.message.channel.id == '833365719038558252') {
		let permRole = react.message.guild.roles.cache.find(role => role.name === 'authorized');
		react.message.guild.members.fetch(user)
			.then(member => {
				member.roles.add(permRole);
			});
	}
});

client.on('messageReactionRemove', (react, user) => {
	if (react.message.channel.id == '833365719038558252') {
		let permRole = react.message.guild.roles.cache.find(role => role.name === 'authorized');
		react.message.guild.members.fetch(user)
			.then(member => {
				member.roles.remove(permRole);
			});
	}
});

client.on('messageCreate', message => {

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return message.reply('You didn\'t use a valid command. Use ">help" to get a list of all available commands!');

	if (command.guildOnly && message.channel.type === 'dm') return message.reply('I can\'t execute that command inside DMs!');

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;
		if (command.usage) { reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``; }
		return message.channel.send(reply);
	}

	try {
		commandString = `${commandName} ${args.join(' ')}`
		logger.log(`#COMMAND: ${message.author.username}|${message.author.id} | ${commandString.trim()}`);
		command.execute(message, args);

	} catch (error) {
		console.error('#error\n' + error);
		message.reply('there was an error trying to execute that command!');
	}
});


module.exports = {
	client
}

module.exports = function deleteMessage(message, delay) {
	setTimeout(message.delete(), delay);
}

client.login(token);
const util = require('../util/util');

module.exports = {
	name: 'prune',
	description: 'Prunes up to 100 messages.',
	guildOnly: true,
	permission: 'MANAGE_MESSAGES',
    execute(message, args) {
		amount = parseInt(args[0]);
		if (args[0] == null) {
			amount = 100;
		} else {
			if (isNaN(amount)) {
				return message.reply('that doesn\'t seem to be a valid number.');
			} else if (amount <= 1 || amount > 100) {
				return message.reply('you need to input a number between 2 and 100.');
			}
		}
		message.channel.bulkDelete(amount, true).then(messages => {
            if (messages.size < amount && messages.size > 0) {
                amount = amount - messages.size;
                message.channel.messages.fetch({limit: amount})
                .then(messages => {
                    messages.forEach(message => {
                        message.delete();
                    });
                    message.channel.send('Deleting ' + messages.size + ' messages  older than 14 days! Please note that this can take several minutes!')
                    .then(reply => {
                        reply.delete({timeout : 5000});
                    }); 
                })
            }
        }).catch(err => {
            return message.channel.send('there was an error trying to prune messages in this channel!');
		});
	},
};

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

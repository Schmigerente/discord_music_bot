const fs = require('fs');
var beautify = require('js-beautify');
const path = require('path')
const bot = require('../discordbot');
const filePath = path.resolve(__dirname + '\\..\\util\\') + '\\';

module.exports = {
	name: 'execute',
	description: 'executes native javascript',
	usage: '[code]',
	args: true,
	permission: 'ADMINISTRATOR',
	async execute(message, args) {
           
         console.log(filePath);
           
        if (message.author.id != 139435319668768768) {
            //return;
        }
        
        var payload = args.join(' ');
        /*if (payload.includes('require')) {
            return message.reply('failed code execution');
        }*/
        const func = beautify('async function run (bot, message, guild, user){' + payload + '} module.exports = {run,}',{ indent_size: 4, space_in_empty_paren: true });
        console.log('#EXECUTE: function \n\n' + func);
        
        fs.writeFileSync(filePath + 'executable.js', func, function (err) {});
        const guild = message.guild;
        const user = message.member;
        const channel = message.channel;
    
        executable = require(filePath + 'executable.js');
        
        try {
            await executable.run(bot, message, guild, user);
        } catch (err) {
            console.log(err);
        }
        
        delete require.cache[require.resolve(filePath + 'executable.js')];
    },
};

function run(message) {
    
    
    
}
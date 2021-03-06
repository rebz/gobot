// Include filesystem
const fs = require('fs');

// Require Discord.js library
const Discord = require('discord.js');

// Load bot commands
commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(command.name, command);
}

// Fake a Message class for ease of integration
let message = {
    channel: {
    	type: "text",
    	send: function(msg){console.log("Output: "+ msg)}
    },
    client: {commands: commands},
    reply: function(msg){console.log("Output: " + msg)},
    author: {
    	client: {ping: 5}, 
    	username: "Tester",
    	id: "123456",
    	send: function(msg){console.log("DM: " + msg)}
    },
    guild: {
    	name: "Test Guild",
    	memberCount: 1
    }
}

// Get args
let args = [];
process.argv.forEach(function (val, index, array) {
  if(index > 1){
  	args[index-2] = val;	
  }
});

// Output for proofing
let commandName = args.shift().toLowerCase();
console.log("Command: " + commandName);
console.log("Args: "+ args);

// Load command if we find it by name or alias
const command = commands.get(commandName) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
if (!command) return;
	
// Guild only command?
if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('I can\'t execute that command inside a test environment!');
}

// Command requires args?
if (command.args && !args.length) {
    let reply = `Missing input.`;
	
	if (command.usage) {
    	reply += ` Try: \`${prefix}${command.name} ${command.usage}\``;
	}

	return message.reply(reply);
}

// Try to process command
try {
    command.execute(message, args);
}
catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
}
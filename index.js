require('dotenv').config();

// Filesystem stuff
const fs = require('fs');
const path = require('path');

// Discord stuff
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Intents, Collection } = require('discord.js');
const Discord = require('discord.js');

// Moment
const moment = require('moment');

// Create the client with the stupid fucking intents
const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

// Initialize command handler
const recursive = function(dir, arr) {
    const files = fs.readdirSync(dir);
  
    for(const file of files) {
        if (fs.statSync(dir + "/" + file).isDirectory()) {
            arr = recursive(dir + "/" + file, arr);
        } else {
            arr.push(path.join(__dirname, dir, "/", file));
        }
    }
  
    return arr;
}

const commandFiles = recursive('./commands', []).filter(f => f.endsWith('.js'));
const commands = [];
client.commands = new Collection();

// Require all the commands found in ./commands
for (const file of commandFiles) {
    let command = require(file);
    if (command.default) command = command.default;

    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
    console.log(`✅ Set ${command.data.name} to client.commands`);
}

client.once('ready', async () => {
    console.log(`${client.user.username} is now online`);

    // FUCKING HATE DISCORD API FUCK DISCORD FUUUCK
    const rest = new REST({
        version: '9'
    }).setToken(process.env.TOKEN);

    try {
        await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), {
            body: commands
        });

        console.log('Registered guild slash commands successfully');
    } catch(err) {
        if(err) console.log(err);
        else console.log('Failed to register slash commands, no error provided');
    }
});

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if(!command) return interaction.reply({
        content: '⛔ Command not found',
        ephemeral: true
    });

    try {
        await command.execute(interaction);
    } catch(err) {
        if(err) console.log(err);
        else console.log(`Failed to execute slash command (${interaction.commandName}), no error provided`);

        interaction.channel.send('⛔ An error occured');
    }
});

client.on('messageCreate', async (message) => {
    if(message.author.bot) return;

    if(message.channel.id == '987359764986097685') {
        await message.guild.members.fetch();

        const trainers = message.guild.roles.cache.get('987881561569521694').members.map(m=>m);
        const trainer = trainers[Math.floor(Math.random() * trainers.length)];``

        const lines = message.content.split('\n');

        if(lines.length != 3) {
            message.author.send('⛔ You must seperate your answers by lines (`shift+enter` on PC, `return` on mobile)');
            message.delete();

            return;
        }

        const intOrTrain = lines[0];
        const dateAndTime = lines[1];
        const firstTime = lines[2];

        if(intOrTrain.toLowerCase() != 'interview' && intOrTrain.toLowerCase() != 'training') {
            message.author.send('⛔ The start of your message must say either "Interview" or "Training". **Refer to the format**');
            message.delete();

            return;
        }

        if(!moment(dateAndTime, 'MM/DD/YYYY HH:mm', true).isValid()) {
            message.author.send('⛔ The second part of your message must be a date in time in `MM/DD/YYYY HH:MM` format. **Refer to the format**');
            message.delete();

            return;
        }

        if(firstTime.toLowerCase() != 'does not apply' && firstTime.toLowerCase() != 'affirmative' && firstTime.toLowerCase() != 'negative') {
            message.author.send('⛔ The third part of your message must be either "Does Not Apply", "Affirmative", or "Negative". **Refer to the format**');
            message.delete();

            return;
        }

        message.guild.channels.cache.get('989739998699987004').send(
            `<@${trainer.id}>: **You have a training setup with ${message.author}**.` +
            `\n\n**Interview/Training:** ${intOrTrain}` +
            `\n**Date/Time:** ${new Date(dateAndTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })} CDT` +
            `\n**First Time Training?:** ${firstTime}` +
            `\n\n*Please contact ${message.author} if this time does not work for you.*`
        );

        message.delete();

        message.author.send(`✅ You have been assigned to **${trainer.user.tag}** for your training/interview`);
    }
});

client.login(process.env.TOKEN);
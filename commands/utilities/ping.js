const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('⌚ Get the response time of the bot'),
    execute: async (interaction) => {
        interaction.reply({
            content: `⌚ Pong! ${Date.now() - interaction.createdTimestamp}ms`,
            ephemeral: true
        })
    }
}
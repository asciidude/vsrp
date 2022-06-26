const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName('embed')
            .setDescription('📩 Send an embed')

            // Options
            .addStringOption(opt =>
                opt.setName('title')
                   .setDescription('The title for the embed')
                   .setRequired(true)
            )

            .addStringOption(opt =>
                opt.setName('body')
                   .setDescription('The body of the embed. Use \\n for a new line')
                   .setRequired(true)
            ),
    execute: async (interaction) => {
        if(!interaction.member.permissions.has(Permissions.FLAGS.EMBED_LINKS)) {
            await interaction.reply({
                content: '⛔ Sorry! You don\'t have the required permissions (`EMBED_LINKS`)',
                ephemeral: true
            });
            
            return;
        }
        
        const embed = new MessageEmbed()
                .setColor('BLUE')
                .setTitle(interaction.options.get('title').value)
                .setDescription(interaction.options.get('body').value.split('\\n').join('\n'))
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTimestamp();

        await interaction.reply({
            content: `📩 Sent the embed!`,
            ephemeral: true
        });

        await interaction.channel.send({ embeds: [embed] });
    }
}
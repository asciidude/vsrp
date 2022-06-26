const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName('setsticky')
            .setDescription('📝 Set the sticky message to a channel')

            .addChannelOption(opt =>
                opt.setName('channel')
                   .setDescription('Set the channel to send the sticky in')
                   .setRequired(true)
            )

            .addStringOption(opt =>
                opt.setName('body')
                   .setDescription('The body of the sticky message. Use \\n for a new line')
                   .setRequired(true)
            )
            
            .addIntegerOption(opt =>
                opt.setName('resend_at')
                   .setDescription('Set the maximum amount of numbers before the message resends')
                   .setRequired(true)

                   .setMaxValue(10)
                   .setMinValue(1)
            )
            
            .addBooleanOption(opt =>
                opt.setName('enabled')
                   .setDescription('Enable or disable the sticky message')
                   .setRequired(true)
                ),
    execute: async (interaction, sticky) => {
        if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            await interaction.reply({
                content: '⛔ Sorry! You don\'t have the required permissions (`ADMINISTRATOR`)',
                ephemeral: true
            });
            
            return;
        }

        const body = interaction.options.get('body').value.split('\\n').join('\n');
        const resendAt = interaction.options.get('resend_at').value;

        const channelID = interaction.options.get('channel').value;
        const channelObject = interaction.guild.channels.cache.get(channelID);

        if(interaction.options.get('enabled').value) {
            if(channelObject.type !== 'GUILD_TEXT') {
                interaction.reply({
                    content: `⛔ The channel selected must be a text channel`,
                    ephemeral: true
                });
    
                return;
            }

            sticky.channel = channelID;
            sticky.content = body;
            sticky.messagesBeforeResend = resendAt;
            sticky.currMessages = 0;
            sticky.enabled = true;
    
            interaction.reply({
                content: `Successfully set the sticky message to channel <#${channelID}>`,
                ephemeral: true
            });

            const msg = interaction.channel.send(body);
            sticky.lastStickyMessage = msg;
        } else {
            sticky.channel = '';
            sticky.content = '';
            sticky.lastStickyMessage = null;
            sticky.messagesBeforeResend = 0;
            sticky.currMessages = 0;
            sticky.enabled = false;

            interaction.reply({
                content: `Successfully disabled sticky message in <#${channelID}>`,
                ephemeral: true
            });
        }
    }
}
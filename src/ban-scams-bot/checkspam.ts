import { CommandInteraction, Interaction } from 'discord.js';
import { handleCheckScams } from '../helpers/ban-scams';

module.exports = {
    data: {
        name: 'checkspam',
        description: 'Bot spam? Not for long',
        defaultPermission: true,
    },
    async execute(interaction: CommandInteraction) {
        if (!interaction.inGuild()) return;
        await handleCheckScams(interaction);
    },
};

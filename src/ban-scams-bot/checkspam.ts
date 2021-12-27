import { Interaction } from 'discord.js';
import { handleCheckScams } from '../helpers/ban-scams';

module.exports = {
    data: {
        name: 'checkspam',
        description: 'Bot spam? Not for long',
        defaultPermission: false,
    },
    async execute(interaction: Interaction) {
        if (interaction.guild === null) return;
        await handleCheckScams(interaction.guild);
    },
};

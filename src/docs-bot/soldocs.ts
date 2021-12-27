import { Interaction } from 'discord.js';
import { algoliaResult, solanaIndex } from '../helpers/handle-autocomplete';

module.exports = {
    data: {
        name: 'soldocs',
        description: 'Fetches the Solana Docs',
        defaultPermission: true,
        options: [
            {
                name: 'query',
                description: 'Phrase to search for',
                type: 3,
                required: true,
                autocomplete: true,
            },
            {
                name: 'target',
                description: 'User to mention',
                type: 6,
                required: false,
            },
            {
                name: 'hidden',
                description: 'Only show the docs to you',
                type: 5,
                required: false,
            },
        ],
    },
    async execute(interaction: Interaction) {
        await algoliaResult(solanaIndex, interaction);
    },
};

import { CommandInteraction } from 'discord.js';
import { CommandObject } from '../types';
import { algoliaResult, metaplexIndex, solanaIndex } from './handle-autocomplete';

const slashCommands: CommandObject[] = [
    {
        data: {
            name: 'docs',
            description: 'Fetches the Metaplex Docs',
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
        async execute(interaction: CommandInteraction) {
            await algoliaResult(metaplexIndex, interaction);
        },
        permissions: { modOnly: false },
    },
    {
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
        async execute(interaction: CommandInteraction) {
            await algoliaResult(solanaIndex, interaction);
        },
        permissions: { modOnly: false },
    },
];

export = slashCommands;

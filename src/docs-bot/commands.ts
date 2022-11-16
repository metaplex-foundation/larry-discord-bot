import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    CommandInteraction,
    PermissionFlagsBits,
} from 'discord.js';
import { CommandObject } from '../types';
import { algoliaResult, metaplexIndex, solanaIndex } from './handle-autocomplete';
import { wtfIs } from './wtf-is';

const slashCommands: CommandObject[] = [
    {
        data: {
            name: 'docs',
            description: 'Fetches the Metaplex Docs',
            defaultMemberPermissions: PermissionFlagsBits.SendMessages,
            options: [
                {
                    name: 'query',
                    description: 'Phrase to search for',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                },
                {
                    name: 'target',
                    description: 'User to mention',
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
                {
                    name: 'hidden',
                    description: 'Only show the docs to you',
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
            ],
        },
        async execute(interaction: ChatInputCommandInteraction) {
            await algoliaResult(metaplexIndex, interaction);
        },
        permissions: { modOnly: false },
    },
    {
        data: {
            name: 'soldocs',
            description: 'Fetches the Solana Docs',
            defaultMemberPermissions: PermissionFlagsBits.SendMessages,
            options: [
                {
                    name: 'query',
                    description: 'Phrase to search for',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                },
                {
                    name: 'target',
                    description: 'User to mention',
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
                {
                    name: 'hidden',
                    description: 'Only show the docs to you',
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
            ],
        },
        async execute(interaction: ChatInputCommandInteraction) {
            await algoliaResult(solanaIndex, interaction);
        },
        permissions: { modOnly: false },
    },
    {
        data: {
            name: 'wtf-is',
            description: 'What specific Metaplex errors mean! Uses the metaboss Rust crate under the hood.',
            defaultMemberPermissions: PermissionFlagsBits.SendMessages,
            options: [
                {
                    name: 'code',
                    description: 'The hex code to look for',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'hidden',
                    description: 'Only show the error message to you',
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
            ],
        },
        async execute(interaction: CommandInteraction) {
            await wtfIs(interaction);
        },
        permissions: { modOnly: false },
    },
];

export = slashCommands;

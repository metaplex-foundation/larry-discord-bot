import { CommandInteraction } from 'discord.js';
import log from 'loglevel';
import { CommandObject } from '../types';
import { handleCheckScams } from './ban-scams';

const slashCommands: CommandObject[] = [
    {
        data: {
            name: 'emptytrash',
            description: 'Gets rid of pesky spam/scam bots',
            defaultPermission: false,
            options: [
                {
                    name: 'user',
                    description: 'The user to smite',
                    type: 6,
                    required: true,
                },
                {
                    name: 'method',
                    description: 'kick or ban',
                    type: 3,
                    required: true,
                    choices: [
                        { name: 'ban', value: 'ban' },
                        { name: 'kick', value: 'kick' },
                    ],
                },
            ],
        },
        async execute(interaction: CommandInteraction<'present'>) {
            log.info('emptytrash');
        },
        permissions: {
            modOnly: true,
        },
    },
    {
        data: {
            name: 'checkspam',
            description: 'Bot spam? Not for long',
            defaultPermission: false,
        },
        async execute(interaction: CommandInteraction<'present'>) {
            await handleCheckScams(interaction);
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'addjoincheck',
            description: 'Adds a member to the join check',
            defaultPermission: false,
            options: [
                {
                    name: 'user',
                    description: 'The user to protect',
                    type: 6,
                    required: true,
                },
            ],
        },
        async execute(interaction: CommandInteraction<'present'>) {
            log.info('addjoincheck');
        },
        permissions: { modOnly: true },
    },
];
export = slashCommands;

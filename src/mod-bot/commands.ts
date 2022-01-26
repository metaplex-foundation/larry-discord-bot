import { CommandInteraction } from 'discord.js';
import log from 'loglevel';
import { CommandObject } from '../types';
import { handleCheckSpam } from './ban-scams';
import {
    handleAddJoinCheck,
    handleAddMod,
    handleLogPermissions,
    handleRemoveJoinCheck,
    handleRemoveMod,
    handleReset,
    handleResetPermissions,
    handleSetLogChannel,
    handleSetSpamTolerance,
    handleSetVerifiedRole,
} from './change-state';

const slashCommands: CommandObject[] = [
    {
        data: {
            name: 'removespam',
            description: 'Gets rid of pesky spam/scam bots',
            defaultPermission: false,
            options: [
                {
                    name: 'user',
                    description: 'One of the scam/spam bots',
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
                {
                    name: 'joinrange',
                    description: 'Time window to use in minutes',
                    type: 4,
                    required: false,
                    min_value: 1,
                    max_value: 60,
                },
            ],
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            log.info('removespam');
        },
        permissions: {
            modOnly: true,
        },
    },
    {
        data: {
            type: 2,
            name: 'kicksimilarjoin',
            defaultPermission: false,
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            log.info('kicksimilarjoin');
        },
        permissions: {
            modOnly: true,
        },
    },
    {
        data: {
            type: 2,
            name: 'bansimilarjoin',
            defaultPermission: false,
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            log.info('bansimilarjoin');
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
        async execute(interaction: CommandInteraction<'cached'>) {
            await handleCheckSpam(interaction);
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'addjoincheck',
            description: 'Adds a user or a role to the join check',
            defaultPermission: false,
            options: [
                {
                    name: 'user',
                    description: 'The user to add',
                    type: 6,
                    required: false,
                },
                {
                    name: 'role',
                    description: 'The role to add',
                    type: 8,
                    required: false,
                },
            ],
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            await handleAddJoinCheck(interaction);
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'addmod',
            description: 'Adds a user or a role to the moderator set',
            defaultPermission: false,
            options: [
                {
                    name: 'user',
                    description: 'The user to add',
                    type: 6,
                    required: false,
                },
                {
                    name: 'role',
                    description: 'The role to add',
                    type: 8,
                    required: false,
                },
            ],
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            await handleAddMod(interaction);
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'removemod',
            description: 'Removes a user or a role from the moderator set',
            defaultPermission: false,
            options: [
                {
                    name: 'user',
                    description: 'The user to remove',
                    type: 6,
                    required: false,
                },
                {
                    name: 'role',
                    description: 'The role to remove',
                    type: 8,
                    required: false,
                },
            ],
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            await handleRemoveMod(interaction);
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'removejoincheck',
            description: 'Removes a user or a role from the join check',
            defaultPermission: false,
            options: [
                {
                    name: 'user',
                    description: 'The user to remove',
                    type: 6,
                    required: false,
                },
                {
                    name: 'role',
                    description: 'The role to remove',
                    type: 8,
                    required: false,
                },
            ],
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            await handleRemoveJoinCheck(interaction);
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'logpermissions',
            description: 'Logs the current mod and joincheck permissions',
            defaultPermission: false,
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            await handleLogPermissions(interaction);
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'resetpermissions',
            description: 'Resets the Angry Larry permissions for the guild',
            defaultPermission: false,
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            await handleResetPermissions(interaction);
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'reset',
            description: 'Resets the state for the guild',
            defaultPermission: false,
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            await handleReset(interaction);
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'setlogchannel',
            description: 'Sets the join spam log channel for the guild',
            defaultPermission: false,
            options: [
                {
                    name: 'channel',
                    description: 'The channel to set',
                    type: 7,
                    required: true,
                    channel_types: [0],
                },
            ],
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            await handleSetLogChannel(interaction);
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'setverifiedrole',
            description: 'Sets the verified role for the guild',
            defaultPermission: false,
            options: [
                {
                    name: 'role',
                    description: 'The role to set',
                    type: 8,
                    required: true,
                },
            ],
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            await handleSetVerifiedRole(interaction);
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'setspamtolerance',
            description: 'Sets the spam tolerance number for the guild',
            defaultPermission: false,
            options: [
                {
                    name: 'tolerance',
                    description: 'The number of joins to be considered spam',
                    type: 4,
                    required: true,
                    min_value: 2,
                },
            ],
        },
        async execute(interaction: CommandInteraction<'cached'>) {
            await handleSetSpamTolerance(interaction);
        },
        permissions: { modOnly: true },
    },
];
export = slashCommands;

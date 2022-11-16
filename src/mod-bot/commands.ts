// noinspection SpellCheckingInspection

import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    UserContextMenuCommandInteraction,
} from 'discord.js';
import { CommandObject } from '../types';
import {
    handleCheckSpam,
    handleRemoveByJoinWindow,
    handleRemoveByName,
    handleRemoveByUser,
    handleRemoveSimilarJoins,
} from './moderation';
import {
    handleAddBotMod,
    handleAddNameCheck,
    handleLogPermissions,
    handleRemoveBotMod,
    handleRemoveNameCheck,
    handleReset,
    handleResetPermissions,
    handleSetLogChannel,
    handleSetSpamTolerance,
    handleSetVerifiedRole,
} from './change-state';

const slashCommands: CommandObject[] = [
    {
        data: {
            name: 'removeby',
            description: 'Gets rid of pesky spam/scam bots',
            defaultMemberPermissions: 0n,
            options: [
                {
                    name: 'user',
                    type: ApplicationCommandOptionType.Subcommand,
                    description: 'Removes multiple spam bots by user',
                    options: [
                        {
                            name: 'user',
                            description: 'One of the scam/spam bots',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: 'range',
                            description:
                                'Join time window to use in minutes, starting with the user',
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                            min_value: 1,
                            max_value: 60,
                        },
                        {
                            name: 'method',
                            description: 'kick or ban (Default: kick)',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            choices: [
                                { name: 'ban', value: 'ban' },
                                { name: 'kick', value: 'kick' },
                            ],
                        },
                        {
                            name: 'verified',
                            description: 'Include members with the verified role',
                            type: ApplicationCommandOptionType.Boolean,
                            required: false,
                        },
                    ],
                },
                {
                    name: 'name',
                    description: 'Removes users with matching names',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'name',
                            description: 'The name to check',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                        {
                            name: 'type',
                            description: 'Name match type (Default: includes)',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            choices: [
                                { name: 'startswith', value: 'startswith' },
                                { name: 'endswith', value: 'endswith' },
                                { name: 'includes', value: 'includes' },
                            ],
                        },
                        {
                            name: 'method',
                            description: 'kick or ban (Default: kick)',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            choices: [
                                { name: 'ban', value: 'ban' },
                                { name: 'kick', value: 'kick' },
                            ],
                        },
                        {
                            name: 'verified',
                            description: 'Include members with the verified role',
                            type: ApplicationCommandOptionType.Boolean,
                            required: false,
                        },
                    ],
                },
                {
                    name: 'joinwindow',
                    description: 'Remove bots that joined within a window',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'first',
                            description: 'The start of the window',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: 'last',
                            description: 'The end of the window',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: 'method',
                            description: 'kick or ban (Default: kick)',
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            choices: [
                                { name: 'ban', value: 'ban' },
                                { name: 'kick', value: 'kick' },
                            ],
                        },
                        {
                            name: 'verified',
                            description: 'Include members with the verified role',
                            type: ApplicationCommandOptionType.Boolean,
                            required: false,
                        },
                    ],
                },
            ],
        },
        async execute(interaction: ChatInputCommandInteraction<'cached'>) {
            switch (interaction.options.getSubcommand(true)) {
                case 'user':
                    await handleRemoveByUser(interaction);
                    break;
                case 'name':
                    await handleRemoveByName(interaction);
                    break;
                case 'joinwindow':
                    await handleRemoveByJoinWindow(interaction);
                    break;
            }
        },
        permissions: {
            modOnly: true,
        },
    },
    {
        data: {
            name: 'set',
            description: 'Configures the settings for the guild',
            defaultMemberPermissions: 0n,
            options: [
                {
                    name: 'logchannel',
                    description: 'Sets the join spam log channel for the guild',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'channel',
                            description: 'The channel to set',
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                            channel_types: [0],
                        },
                    ],
                },
                {
                    name: 'verifiedrole',
                    description: 'Sets the verified role for the guild',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'role',
                            description: 'The role to set',
                            type: ApplicationCommandOptionType.Role,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'spamtolerance',
                    description: 'Sets the spam tolerance number for the guild',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'tolerance',
                            description: 'The number of joins to be considered spam. Min: 2',
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                            min_value: 2,
                        },
                    ],
                },
            ],
        },
        async execute(interaction: ChatInputCommandInteraction<'cached'>) {
            switch (interaction.options.getSubcommand(true)) {
                case 'logchannel':
                    await handleSetLogChannel(interaction);
                    break;
                case 'verifiedrole':
                    await handleSetVerifiedRole(interaction);
                    break;
                case 'spamtolerance':
                    await handleSetSpamTolerance(interaction);
                    break;
            }
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'namecheck',
            description: 'Adds or removes a user or a role from the name check',
            defaultMemberPermissions: 0n,
            options: [
                {
                    name: 'add',
                    description: 'Adds a user or a role to the name check',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            description: 'The user to add',
                            type: ApplicationCommandOptionType.User,
                            required: false,
                        },
                        {
                            name: 'role',
                            description: 'The role to add',
                            type: ApplicationCommandOptionType.Role,
                            required: false,
                        },
                    ],
                },
                {
                    name: 'remove',
                    description: 'Removes a user or a role from the name check',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            description: 'The user to remove',
                            type: ApplicationCommandOptionType.User,
                            required: false,
                        },
                        {
                            name: 'role',
                            description: 'The role to remove',
                            type: ApplicationCommandOptionType.Role,
                            required: false,
                        },
                    ],
                },
            ],
        },
        async execute(interaction: ChatInputCommandInteraction<'cached'>) {
            switch (interaction.options.getSubcommand(true)) {
                case 'add':
                    await handleAddNameCheck(interaction);
                    break;
                case 'remove':
                    await handleRemoveNameCheck(interaction);
                    break;
            }
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'botmod',
            description: 'Adds or removes a user or a role from the bot moderator set',
            defaultMemberPermissions: 0n,
            options: [
                {
                    name: 'add',
                    description: 'Adds a user or a role to the bot moderator set',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            description: 'The user to add',
                            type: ApplicationCommandOptionType.User,
                            required: false,
                        },
                        {
                            name: 'role',
                            description: 'The role to add',
                            type: ApplicationCommandOptionType.Role,
                            required: false,
                        },
                    ],
                },
                {
                    name: 'remove',
                    description: 'Removes a user or a role from the bot moderator set',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            description: 'The user to remove',
                            type: ApplicationCommandOptionType.User,
                            required: false,
                        },
                        {
                            name: 'role',
                            description: 'The role to remove',
                            type: ApplicationCommandOptionType.Role,
                            required: false,
                        },
                    ],
                },
            ],
        },
        async execute(interaction: ChatInputCommandInteraction<'cached'>) {
            switch (interaction.options.getSubcommand(true)) {
                case 'add':
                    await handleAddBotMod(interaction);
                    break;
                case 'remove':
                    await handleRemoveBotMod(interaction);
                    break;
            }
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'permissions',
            description: 'Manage botmod and namecheck permissions',
            defaultMemberPermissions: 0n,
            options: [
                {
                    name: 'log',
                    description: 'Logs the current mod and namecheck permissions',
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'reset',
                    description: 'Resets the mod and namecheck permissions for the guild',
                    type: ApplicationCommandOptionType.Subcommand,
                },
            ],
        },
        async execute(interaction: ChatInputCommandInteraction<'cached'>) {
            switch (interaction.options.getSubcommand(true)) {
                case 'log':
                    await handleLogPermissions(interaction);
                    break;
                case 'reset':
                    await handleResetPermissions(interaction);
                    break;
            }
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            type: ApplicationCommandType.User,
            name: 'Kick Similar Joins',
            defaultMemberPermissions: 0n,
        },
        async execute(interaction: UserContextMenuCommandInteraction<'cached'>) {
            await handleRemoveSimilarJoins(interaction, 'kick');
        },
        permissions: {
            modOnly: true,
        },
    },
    {
        data: {
            type: ApplicationCommandType.User,
            name: 'Ban Similar Joins',
            defaultMemberPermissions: 0n,
        },
        async execute(interaction: UserContextMenuCommandInteraction<'cached'>) {
            await handleRemoveSimilarJoins(interaction, 'ban');
        },
        permissions: {
            modOnly: true,
        },
    },
    {
        data: {
            name: 'checkspam',
            description: 'Bot spam? Not for long',
            defaultMemberPermissions: 0n,
        },
        async execute(interaction: ChatInputCommandInteraction<'cached'>) {
            await handleCheckSpam(interaction);
        },
        permissions: { modOnly: true },
    },
    {
        data: {
            name: 'reset',
            description: 'Resets the state for the guild',
            defaultMemberPermissions: 0n,
        },
        async execute(interaction: ChatInputCommandInteraction<'cached'>) {
            await handleReset(interaction);
        },
        permissions: { modOnly: true },
    },
];
export = slashCommands;

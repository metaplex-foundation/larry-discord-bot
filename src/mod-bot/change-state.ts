import { CommandInteraction } from 'discord.js';
import log from 'loglevel';
import {
    interactionToUserRoleGroup,
    resetCommandPermissions,
} from '../common/slash-commands';
import {
    GuildModel,
    updateMods,
    updateJoinCheck,
    resetMongoPermissions,
    resetMongoModel,
    setMongoLogChannel,
    setMongoVerifiedRole,
    setMongoSpamTolerance,
} from './mod-mongo-model';
import { updateCachedLogChannel, updateCachedSpamTolerance } from './on-join';

export async function handleAddMod(interaction: CommandInteraction<'present'>) {
    if (interaction.guild === null) {
        interaction.reply({
            content: 'This command only works in guilds!',
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    const toModify = interactionToUserRoleGroup(interaction);
    await updateMods(interaction.guild, toModify);
}

export async function handleRemoveMod(
    interaction: CommandInteraction<'present'>
) {
    if (interaction.guild === null) {
        interaction.reply({
            content: 'This command only works in guilds!',
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    const toModify = interactionToUserRoleGroup(interaction);
    await updateMods(interaction.guild, toModify, true);
}

export async function handleAddJoinCheck(
    interaction: CommandInteraction<'present'>
) {
    if (interaction.guild === null) {
        interaction.reply({
            content: 'This command only works in guilds!',
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    const toModify = interactionToUserRoleGroup(interaction);
    updateJoinCheck(interaction.guild, toModify).then();
}

export async function handleRemoveJoinCheck(
    interaction: CommandInteraction<'present'>
) {
    if (interaction.guild === null) {
        interaction.reply({
            content: 'This command only works in guilds!',
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    const toModify = interactionToUserRoleGroup(interaction);
    updateJoinCheck(interaction.guild, toModify, true).then();
}

export async function handleLogPermissions(
    interaction: CommandInteraction<'present'>
) {
    const guild = interaction.guild;
    if (guild === null) {
        interaction.reply({
            content: 'This command only works in guilds!',
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    const commands = await interaction.guild?.commands.fetch();
    if (commands === undefined) return;
    const command = commands.find((command) => command.name === 'emptytrash');
    if (command === undefined) return;
    log.info(command.name + ':');
    log.info(await command.permissions.fetch({ guild: guild?.id }));
    log.info(await GuildModel.findOne({ guildId: guild?.id }));
    return;
}

export async function handleResetPermissions(
    interaction: CommandInteraction<'present'>
) {
    const guild = interaction.guild;
    if (guild === null) {
        interaction.reply({
            content: 'This command only works in guilds!',
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    await resetMongoPermissions(guild);
    await resetCommandPermissions(guild);
}

export async function handleReset(interaction: CommandInteraction<'present'>) {
    const guild = interaction.guild;
    if (guild === null) {
        interaction.reply({
            content: 'This command only works in guilds!',
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    await resetMongoModel(guild);
    await resetCommandPermissions(guild);
}

export async function handleSetLogChannel(
    interaction: CommandInteraction<'present'>
) {
    const guild = interaction.guild;
    if (guild === null) {
        interaction.reply({
            content: 'This command only works in guilds!',
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    const logChannel = interaction.options.getChannel('channel', true);
    await setMongoLogChannel(guild, logChannel.id);
    await updateCachedLogChannel(guild, logChannel.id);
}

export async function handleSetVerifiedRole(
    interaction: CommandInteraction<'present'>
) {
    const guild = interaction.guild;
    if (guild === null) {
        interaction.reply({
            content: 'This command only works in guilds!',
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    const verifiedRole = interaction.options.getRole('role', true);
    if (guild === null) return;
    await setMongoVerifiedRole(guild, verifiedRole.id);
}

export async function handleSetSpamTolerance(
    interaction: CommandInteraction<'present'>
) {
    const guild = interaction.guild;
    if (guild === null) {
        interaction.reply({
            content: 'This command only works in guilds!',
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    const tolerance = interaction.options.getInteger('tolerance', true);
    await setMongoSpamTolerance(guild, tolerance);
    await updateCachedSpamTolerance(guild, tolerance);
}

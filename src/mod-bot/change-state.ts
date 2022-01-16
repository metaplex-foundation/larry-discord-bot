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
import {
    setCache,
    updateCachedLogChannel,
    updateCachedSpamTolerance,
} from './on-join';

export async function handleAddMod(interaction: CommandInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true });
    const toModify = interactionToUserRoleGroup(interaction);
    await updateMods(interaction, toModify).catch((err) => {
        if (err instanceof RangeError) {
            log.info('too many overrides');
            (async () =>
                await interaction.editReply('Error! Too many overrides'))();
            return;
        }
    });
    log.info(
        `Successfully added ${JSON.stringify(
            toModify,
            null,
            4
        )} to moderators for guild: ${interaction.guild.name}`
    );
    await interaction.editReply(
        `Successfully added \`${JSON.stringify(
            toModify,
            null,
            4
        )}\` to moderators.`
    );
}

export async function handleRemoveMod(
    interaction: CommandInteraction<'cached'>
) {
    await interaction.deferReply({ ephemeral: true });
    const toModify = interactionToUserRoleGroup(interaction);
    await updateMods(interaction, toModify, true);
    log.info(
        `Successfully removed ${JSON.stringify(
            toModify,
            null,
            4
        )} from moderators for guild: ${interaction.guild.name}`
    );
    await interaction.editReply(
        `Successfully removed \`${JSON.stringify(
            toModify,
            null,
            4
        )}\` from moderators.`
    );
}

export async function handleAddJoinCheck(
    interaction: CommandInteraction<'cached'>
) {
    await interaction.deferReply({ ephemeral: true });
    const toModify = interactionToUserRoleGroup(interaction);
    await updateJoinCheck(interaction.guild, toModify);
    log.info(
        `Successfully added ${JSON.stringify(
            toModify,
            null,
            4
        )} to join check for guild: ${interaction.guild.name}`
    );
    await interaction.editReply(
        `Successfully added \`${JSON.stringify(
            toModify,
            null,
            4
        )}\` to join check.`
    );
}

export async function handleRemoveJoinCheck(
    interaction: CommandInteraction<'cached'>
) {
    await interaction.deferReply({ ephemeral: true });
    const toModify = interactionToUserRoleGroup(interaction);
    await updateJoinCheck(interaction.guild, toModify, true);
    log.info(
        `Successfully removed ${JSON.stringify(
            toModify,
            null,
            4
        )} from join check for guild: ${interaction.guild.name}`
    );
    await interaction.editReply(
        `Successfully removed \`${JSON.stringify(
            toModify,
            null,
            4
        )}\` from join check.`
    );
}

export async function handleLogPermissions(
    interaction: CommandInteraction<'cached'>
) {
    const guild = interaction.guild;
    await interaction.deferReply({ ephemeral: true });
    const commands = await guild.commands.fetch();
    const command = commands.find((command) => command.name === 'emptytrash');
    if (command === undefined) return;
    log.info(await GuildModel.findOne({ guildId: guild.id }));
    const permissions = await command.permissions.fetch({ guild: guild.id });
    log.info(command.name + ': ' + JSON.stringify(permissions, null, 4));
    await interaction.editReply(`Successfully logged permissions.`);
}

export async function handleResetPermissions(
    interaction: CommandInteraction<'cached'>
) {
    const guild = interaction.guild;
    await interaction.deferReply({ ephemeral: true });
    await resetMongoPermissions(guild);
    await resetCommandPermissions(guild);
    log.info('Successfully reset permissions for guild: ', guild.name);
    await interaction.editReply(`Successfully reset permissions.`);
}

export async function handleReset(interaction: CommandInteraction<'cached'>) {
    const guild = interaction.guild;
    await interaction.deferReply({ ephemeral: true });
    await resetMongoModel(guild);
    await resetCommandPermissions(guild);
    await setCache(guild);
    log.info('Successfully reset state for guild: ', guild.name);
    await interaction.editReply(`Successfully reset state.`);
}

export async function handleSetLogChannel(
    interaction: CommandInteraction<'cached'>
) {
    const guild = interaction.guild;
    await interaction.deferReply({ ephemeral: true });
    const logChannel = interaction.options.getChannel('channel', true);
    await setMongoLogChannel(guild, logChannel.id);
    await updateCachedLogChannel(guild, logChannel.id);
    log.info('Successfully set log channel to: ', logChannel.name);
    await interaction.editReply(
        `Successfully set log channel to **<#${logChannel.id}>**.`
    );
}

export async function handleSetVerifiedRole(
    interaction: CommandInteraction<'cached'>
) {
    const guild = interaction.guild;
    await interaction.deferReply({ ephemeral: true });
    const verifiedRole = interaction.options.getRole('role', true);
    if (guild === null) return;
    await setMongoVerifiedRole(guild, verifiedRole.id);
    log.info('Successfully set verified role to: ', verifiedRole.name);
    await interaction.editReply(
        `Successfully set verified role to **<&@${verifiedRole.id}>**.`
    );
}

export async function handleSetSpamTolerance(
    interaction: CommandInteraction<'cached'>
) {
    const guild = interaction.guild;
    await interaction.deferReply({ ephemeral: true });
    const tolerance = interaction.options.getInteger('tolerance', true);
    await setMongoSpamTolerance(guild, tolerance);
    await updateCachedSpamTolerance(guild, tolerance);
    log.info('Finished setting spam tolerance for: ', guild.name);
    await interaction.editReply(
        `Successfully set spam tolerance to **${tolerance}**.`
    );
}

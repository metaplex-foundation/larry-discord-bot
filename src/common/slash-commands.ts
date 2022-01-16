import {
    ApplicationCommandPermissionData,
    Client,
    Collection,
    CommandInteraction,
    Guild,
    OAuth2Guild,
} from 'discord.js';
import { CommandObject } from '../types';
import log from 'loglevel';
import { GuildModel, UserRoleGroup } from '../mod-bot/mod-mongo-model';
import { BOT_MASTER_ID } from './constants';

export function getCommands(commandObjects: CommandObject[]) {
    const commands = new Collection<string, CommandObject>();

    for (const commandObj of commandObjects) {
        commands.set(commandObj.data.name, commandObj);
    }
    return commands;
}

export async function deleteGlobalCommands(client: Client<true>) {
    await client.application.commands.set([]);
    log.info(
        `Cleared all global commands for: ${
            client.application.name ?? client.application.id
        }`
    );
}

export async function setGuildCommands(
    slashCommands: CommandObject[],
    guild: Guild,
    modIds: UserRoleGroup | undefined
) {
    await guild.commands.set([]);
    log.info(`Cleared all guild commands for: ${guild.name}`);
    let modPermissions: ApplicationCommandPermissionData[] = [];
    modPermissions.push({
        id: BOT_MASTER_ID,
        type: 'USER',
        permission: true,
    });

    if (modIds !== undefined) {
        modPermissions = userRoleGroupToData(modIds, modPermissions);
    }

    for (const command of slashCommands) {
        const newCommand = await guild.commands.create(command.data);
        log.debug(`Set ${command.data.name} command for: ${guild.name}`);
        if (command.permissions.modOnly) {
            await newCommand.permissions.set({ permissions: modPermissions });
            log.info(
                `Set permissions for ${command.data.name} command for: ${guild.name}`
            );
        }
    }
    log.info('Finished setting commands for guild: ', guild.name);
}

export function userRoleGroupToData(
    ids: UserRoleGroup,
    permissions: ApplicationCommandPermissionData[] = []
): ApplicationCommandPermissionData[] {
    if (ids !== undefined) {
        const rolePermissions: ApplicationCommandPermissionData[] =
            ids.roleIds.map((id) => ({
                id: id,
                type: 'ROLE',
                permission: true,
            }));
        const userPermissions: ApplicationCommandPermissionData[] =
            ids.userIds.map((id) => ({
                id: id,
                type: 'USER',
                permission: true,
            }));
        permissions = permissions.concat(rolePermissions, userPermissions);
    }
    return permissions;
}

export async function updateCommandPermissions(
    ids: UserRoleGroup,
    guild: Guild,
    remove = false
) {
    log.info('here2');
    const commands = await guild.commands.fetch();
    log.info('there2');
    if (commands !== undefined) {
        if (remove) {
            for (const [, command] of commands) {
                ids.userIds = ids.userIds.filter(
                    (userId: string) => userId !== BOT_MASTER_ID
                );
                log.info(ids);
                await command.permissions.remove({
                    users: ids.userIds,
                    roles: ids.roleIds,
                });
            }
        } else {
            const permissions = userRoleGroupToData(ids);
            log.info(ids);
            for (const [, command] of commands) {
                await command.permissions.add({ permissions });
            }
        }
    }
}

export async function resetCommandPermissions(guild: Guild) {
    for (const [, command] of await guild.commands.fetch()) {
        await command.permissions.set({
            permissions: [
                {
                    id: BOT_MASTER_ID,
                    type: 'USER',
                    permission: true,
                },
            ],
        });
    }
}

export async function setupCommands(
    client: Client<true>,
    slashCommands: CommandObject[]
) {
    // await deleteGlobalCommands(client);
    log.debug('Fetching all guilds...');
    const partialGuilds = await client.guilds.fetch();
    log.debug(`Fetched ${partialGuilds.size} partial guilds.`);
    const guilds: Guild[] = [];
    for (const [, guild] of partialGuilds) {
        const newGuild = await setupGuild(guild, slashCommands);
        guilds.push(newGuild);
    }
    const commands = getCommands(slashCommands);
    return { guilds, commands };
}

export async function setupGuild(
    guild: OAuth2Guild | Guild,
    slashCommands: CommandObject[]
) {
    let fetchedGuild: Guild;
    if (guild instanceof OAuth2Guild) {
        fetchedGuild = await guild.fetch();
    } else {
        fetchedGuild = guild;
    }
    log.debug(`Fetched ${fetchedGuild.name}.`);
    let targetGuild = await GuildModel.findOne({ guildId: guild.id });
    if (!targetGuild) {
        targetGuild = await GuildModel.create({
            guildId: guild.id,
            moderators: {
                roleIds: [],
                userIds: [BOT_MASTER_ID],
            },
        });
    }
    const moderators = targetGuild.moderators;
    await setGuildCommands(slashCommands, fetchedGuild, moderators);
    return fetchedGuild;
}

export function interactionToUserRoleGroup(
    interaction: CommandInteraction
): UserRoleGroup {
    const options = interaction.options;
    const user = options.getUser('user')?.id;
    const role = options.getRole('role')?.id;
    log.info(role);
    return {
        roleIds: role ? [role] : [],
        userIds: user ? [user] : [],
    };
}

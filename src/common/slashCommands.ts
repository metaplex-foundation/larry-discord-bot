import {
    ApplicationCommandPermissionData,
    Client,
    Collection,
    Guild,
} from 'discord.js';
import { CommandObject } from '../types';
import log from 'loglevel';

export function getCommands(slashCommands: CommandObject[]) {
    const commands = new Collection<string, CommandObject>();

    for (const commandObj of slashCommands) {
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
    modIds: string[]
) {
    await guild.commands.set([]);
    log.info(`Cleared all guild commands for: ${guild.name}`);
    const modPermissions: ApplicationCommandPermissionData[] = modIds.map(
        (id) => ({
            id: id,
            type: 'ROLE',
            permission: true,
        })
    );
    modPermissions.push({
        id: '433413408721862656',
        type: 'USER',
        permission: true,
    });
    for (const command of slashCommands) {
        const newCommand = await guild.commands.create(command.data);
        log.debug(`Set ${command.data.name} command for: ${guild.name}`);
        if (command.permissions.modOnly) {
            await newCommand.permissions.set({ permissions: modPermissions });
            log.debug(
                `Set permissions for ${command.data.name} command for: ${guild.name}`
            );
        }
    }
}

export async function setupCommands(
    client: Client<true>,
    slashCommands: CommandObject[]
) {
    await deleteGlobalCommands(client);
    log.debug('Fetching all guilds...');
    const partialGuilds = await client.guilds.fetch();
    log.debug(`Fetched ${partialGuilds.size} partial guilds.`);
    const guilds: Guild[] = [];
    for (const [, guild] of partialGuilds) {
        const fetchedGuild = await guild.fetch();
        log.debug(`Fetched ${fetchedGuild.name}.`);
        guilds.push(fetchedGuild);
    }
    for (const guild of guilds) {
        await setGuildCommands(slashCommands, guild, []);
    }
    const commands = getCommands(slashCommands);
    return { guilds, commands };
}

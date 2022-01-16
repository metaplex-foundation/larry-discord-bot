import { Guild, GuildMember } from 'discord.js';
import { findOrCreateModel, UserRoleGroup } from './mod-mongo-model';

const guildToCache = new Map<string, MongoCache>();

class MongoCache {
    logChannelId: string | undefined;
    joinCheckNames!: string[];
    spamTolerance: number | undefined;
    isSetup = false;

    constructor(
        logChannelId: string | undefined,
        spamTolerance: number | undefined,
        joinCheck: UserRoleGroup | undefined,
        guild: Guild
    ) {
        this.logChannelId = logChannelId;
        this.spamTolerance = spamTolerance;
        this.updateJoinCheckNames(joinCheck, guild);
    }

    updateJoinCheckNames(
        ids: UserRoleGroup | undefined,
        guild: Guild
    ): this is { logChannelId: string; spamTolerance: number } {
        if (typeof ids === 'undefined') {
            this.joinCheckNames = [];
        } else {
            const names: string[] = [];
            const roles = ids.roleIds.map((id) => guild.roles.resolve(id));
            for (const role of roles) {
                if (role !== null) {
                    names.concat(
                        role.members.map((member) =>
                            member.user.username.toLowerCase()
                        )
                    );
                }
            }
            const members = ids.userIds.map((id) => guild.members.resolve(id));
            for (const member of members) {
                if (member !== null)
                    names.push(member.user.username.toLowerCase());
            }
            this.joinCheckNames = names;
        }
        return this.checkSetup();
    }

    updateLogChannelId(
        id: string
    ): this is { logChannelId: string; spamTolerance: number } {
        this.logChannelId = id;
        return this.isSetup;
    }

    updateSpamTolerance(
        tolerance: number
    ): this is { logChannelId: string; spamTolerance: number } {
        this.spamTolerance = tolerance;
        return this.isSetup;
    }

    checkSetup(): this is { logChannelId: string; spamTolerance: number } {
        if (this.isSetup === true) return true;
        this.isSetup =
            typeof this.logChannelId !== 'undefined' &&
            typeof this.spamTolerance !== 'undefined';
        return this.isSetup;
    }
}

export async function handleOnJoin(guildMember: GuildMember) {
    const guild = guildMember.guild;
    let cache = guildToCache.get(guild.id);
    if (cache === undefined) {
        cache = await setCache(guild);
    }
    if (!cache.checkSetup()) return;
    if (
        cache.joinCheckNames.includes(guildMember.user.username.toLowerCase())
    ) {
        await guildMember.kick('User has identical username to a moderator.');
        const logChannel = guildMember.guild.channels.resolve(
            cache.logChannelId
        );
        if (logChannel?.isText()) {
            logChannel.send(
                `${guildMember.user.tag} *(${guildMember.id})* tried to join the server and was successfully kicked.`
            );
        }
    }
}

export async function updateCachedJoinCheck(guild: Guild, ids: UserRoleGroup) {
    let cache = guildToCache.get(guild.id);
    if (cache === undefined) {
        cache = await setCache(guild);
    }
    cache.updateJoinCheckNames(ids, guild);
}

export async function updateCachedSpamTolerance(
    guild: Guild,
    tolerance: number
) {
    let cache = guildToCache.get(guild.id);
    if (cache === undefined) {
        cache = await setCache(guild);
    }
    cache.updateSpamTolerance(tolerance);
}

export async function updateCachedLogChannel(guild: Guild, channelId: string) {
    let cache = guildToCache.get(guild.id);
    if (cache === undefined) {
        cache = await setCache(guild);
    }
    cache.updateLogChannelId(channelId);
}

export async function setCache(guild: Guild) {
    const model = await findOrCreateModel(guild);
    const newCache = new MongoCache(
        model.logChannelId,
        model.spamTolerance,
        model.joinCheck,
        guild
    );
    newCache.updateJoinCheckNames(model.joinCheck, guild);
    guildToCache.set(guild.id, newCache);
    return newCache;
}

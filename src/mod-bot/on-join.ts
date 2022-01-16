import { Guild, GuildMember } from 'discord.js';
import log from 'loglevel';
import { BOT_MASTER_ID } from '../common/constants';
import { findOrCreateModel, UserRoleGroup } from './mod-mongo-model';

export const guildToCache = new Map<string, MongoCache>();
export const timestampToJoins = new Map<number, GuildMember[]>();
export let activeRaid = false;
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

    async updateJoinCheckNames(ids: UserRoleGroup | undefined, guild: Guild) {
        if (typeof ids === 'undefined') {
            this.joinCheckNames = [];
        } else {
            const names: string[] = [];
            const roles = ids.roleIds;
            const guildMembers = await guild.members.fetch();
            guildMembers.forEach((member) => {
                if (member.roles.cache.hasAny(...roles)) {
                    names.push(member.user.username.toLowerCase());
                }
            });
            const members = ids.userIds.map((id) => guild.members.resolve(id));
            for (const member of members) {
                if (member !== null)
                    names.push(member.user.username.toLowerCase());
            }
            this.joinCheckNames = names;
        }
        log.info('updated joincheck names');
        log.info(this.joinCheckNames);
        return this.checkSetup();
    }

    updateLogChannelId(
        id: string
    ): this is { logChannelId: string; spamTolerance: number } {
        this.logChannelId = id;
        log.info('updated cached log channel id');
        return this.isSetup;
    }

    updateSpamTolerance(
        tolerance: number
    ): this is { logChannelId: string; spamTolerance: number } {
        this.spamTolerance = tolerance;
        log.info('updated cached spam tolerance');
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
        const dmChannel = await guildMember.createDM();
        await dmChannel.send(
            'You have an identical username to a moderator. Please change your username and try again.'
        );
        await guildMember.kick('User has identical username to a moderator.');
        const logChannel = guildMember.guild.channels.resolve(
            cache.logChannelId
        );
        if (logChannel?.isText()) {
            logChannel.send(
                `${guildMember.user.tag} **(${guildMember.id})** tried to join the server and was successfully kicked.`
            );
        }
    } else {
        const joinedTimestamp = guildMember.joinedTimestamp;
        if (joinedTimestamp === null) return;
        const timestamp = Math.floor(joinedTimestamp / 100000);
        const members = timestampToJoins.get(timestamp);
        if (members === undefined) {
            timestampToJoins.clear();
            timestampToJoins.set(timestamp, [guildMember]);
        } else {
            members.push(guildMember);
            if (members.length >= cache.spamTolerance && !activeRaid) {
                activeRaid = true;
                guild
                    .setVerificationLevel('MEDIUM', 'Raid timer has ended')
                    .then(() =>
                        log.info(
                            `Updated guild verification level to ${guild.verificationLevel}`
                        )
                    );
                setTimeout(async () => {
                    activeRaid = false;
                    await guild.setVerificationLevel(
                        'MEDIUM',
                        'Raid timer has ended'
                    );
                    log.info(
                        `Updated guild verification level to ${guild.verificationLevel}`
                    );
                }, 1000 * 60 * 10);

                const logChannel = guildMember.guild.channels.resolve(
                    cache.logChannelId
                );

                if (logChannel?.isText()) {
                    logChannel.send(
                        `<@${BOT_MASTER_ID}> \n**ALERT: likely raid is happening!**`
                    );
                }
            }
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
    await newCache.updateJoinCheckNames(model.joinCheck, guild);
    newCache.checkSetup();
    guildToCache.set(guild.id, newCache);
    return newCache;
}

import { CommandInteraction, Guild } from 'discord.js';
import log from 'loglevel';
log.setDefaultLevel;
import { model, Schema } from 'mongoose';
import { BOT_MASTER_ID } from '../common/constants';
import { updateCommandPermissions } from '../common/slash-commands';
import {
    updateCachedJoinCheck,
    updateCachedLogChannel,
    updateCachedSpamTolerance,
} from './on-join';

export type UserRoleGroup = {
    roleIds: string[];
    userIds: string[];
};

export interface GuildInterface {
    guildId: string;
    moderators?: UserRoleGroup;
    joinCheck?: UserRoleGroup;
    logChannelId?: string;
    verifiedRoleId?: string;
    spamTolerance?: number;
}

export const GuildSchema = new Schema({
    guildId: String,
    moderators: {
        roleIds: [String],
        userIds: [String],
    },
    joinCheck: {
        roleIds: [String],
        userIds: [String],
    },
    logChannelId: String,
    verifiedRoleId: String,
    spamTolerance: Number,
});

export function updateMongoPermissions(
    target: any,
    toModify: UserRoleGroup,
    remove = false
) {
    if (!target) {
        target = {
            roleIds: toModify.roleIds,
            userIds: toModify.userIds,
        };
        addBotMaster(target.userIds);
    } else {
        if (remove) {
            target.roleIds = target.roleIds?.filter(
                (roleId: string) => !toModify.roleIds.includes(roleId)
            );
            target.userIds = target.userIds?.filter(
                (userId: string) => !toModify.userIds.includes(userId)
            );
            addBotMaster(target.userIds);
        } else {
            for (const roleId of toModify.roleIds) {
                if (!target.roleIds.includes(roleId)) {
                    log.info;
                    target.roleIds.push(roleId);
                }
            }
            for (const userId of toModify.userIds) {
                if (!target.userIds.includes(userId)) {
                    target.userIds.push(userId);
                }
            }
        }
    }
}

export function addBotMaster(ids: string[]) {
    if (!ids.includes(BOT_MASTER_ID)) {
        ids.push(BOT_MASTER_ID);
    }
}

export async function updateMods(
    interaction: CommandInteraction<'cached'>,
    toModify: UserRoleGroup,
    remove = false
) {
    const guild = interaction.guild;
    const targetGuild = await findOrCreateModel(guild);
    const mods = targetGuild.moderators;
    if (!remove && mods) {
        if (mods.roleIds.length + mods.userIds.length > 10) {
            throw new RangeError('Too many overrides');
        }
    }

    updateMongoPermissions(targetGuild.moderators, toModify, remove);
    targetGuild.markModified('moderators');
    await targetGuild.save();
    log.info('aaaa');
    if (targetGuild.moderators === undefined) return;
    await updateCommandPermissions(targetGuild.moderators, guild, remove);
}

export async function updateJoinCheck(
    guild: Guild,
    toModify: UserRoleGroup,
    remove = false
) {
    const targetGuild = await findOrCreateModel(guild);
    updateMongoPermissions(targetGuild.joinCheck, toModify, remove);
    targetGuild.markModified('joinCheck');
    await targetGuild.save();
    if (targetGuild.joinCheck)
        await updateCachedJoinCheck(guild, targetGuild.joinCheck);
}

export async function resetMongoModel(guild: Guild) {
    await GuildModel.deleteOne({ guildId: guild.id });
    const targetGuild = await GuildModel.create({
        guildId: guild.id,
        moderators: {
            roleIds: [],
            userIds: [BOT_MASTER_ID],
        },
        joinCheck: {
            roleIds: [],
            userIds: [],
        },
    });
    await targetGuild.save();
}

export async function resetMongoPermissions(guild: Guild) {
    const targetGuild = await findOrCreateModel(guild);
    targetGuild.moderators = {
        roleIds: [],
        userIds: [BOT_MASTER_ID],
    };
    targetGuild.markModified('moderators');
    await targetGuild.save();
}

export async function findOrCreateModel(guild: Guild) {
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
    return targetGuild;
}

export async function setMongoLogChannel(guild: Guild, channelId: string) {
    const targetGuild = await findOrCreateModel(guild);
    targetGuild.logChannelId = channelId;
    targetGuild.markModified('logChannelId');
    await targetGuild.save();
    if (targetGuild.logChannelId)
        await updateCachedLogChannel(guild, targetGuild.logChannelId);
}

export async function setMongoVerifiedRole(
    guild: Guild,
    verifiedRoleId: string
) {
    const targetGuild = await findOrCreateModel(guild);
    targetGuild.verifiedRoleId = verifiedRoleId;
    targetGuild.markModified('verifiedRoleId');
    await targetGuild.save();
}

export async function setMongoSpamTolerance(
    guild: Guild,
    spamTolerance: number
) {
    const targetGuild = await findOrCreateModel(guild);
    targetGuild.spamTolerance = spamTolerance;
    targetGuild.markModified('spamTolerance');
    await targetGuild.save();
    if (targetGuild.spamTolerance)
        await updateCachedSpamTolerance(guild, targetGuild.spamTolerance);
}

export const GuildModel = model<GuildInterface>('guildschema', GuildSchema);

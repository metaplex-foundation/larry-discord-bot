import { Guild, GuildMember } from 'discord.js';
import { COMMUNITY_DEV_ROLE_ID, METAPLEX_PHISHING_CHANNEL_ID, MODERATOR_ROLE_ID } from '../util/constants';

const guildToModMap = new Map<string, string[]>();

export async function handleOnJoin(guildMember: GuildMember) {
    const guildId = guildMember.guild.id;
    let modArray = guildToModMap.get(guildId);
    if (typeof modArray === 'undefined') {
        modArray = getModNameArray(guildMember.guild);
        guildToModMap.set(guildId, modArray);
    }
    if (modArray.includes(guildMember.user.username.toLowerCase())){
        await guildMember.kick('User has identical username to a moderator.');
        const logChannel = guildMember.guild.channels.resolve(METAPLEX_PHISHING_CHANNEL_ID);
        if (logChannel?.isText()){
            logChannel.send(`${guildMember.user.tag} *(${guildMember.id})* tried to join the server and was successfully kicked.`);
        }
    }
}

//TODO add a database to allow servers to set their own mod roles
function getModNameArray(guild: Guild): string[] {
    const modNames: string[] = [];
    const modRoleIds = [MODERATOR_ROLE_ID, COMMUNITY_DEV_ROLE_ID];
    const modRoles = modRoleIds.map(id => guild.roles.resolve(id));
    for (const role of modRoles) {
        if (role !== null) {
            modNames.concat(role.members.map(member => member.user.username.toLowerCase()));
        }
    }
    return modNames;
}
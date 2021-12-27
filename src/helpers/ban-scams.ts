import { Guild, GuildMember } from 'discord.js';


export async function handleCheckScams(guild: Guild) {
    const joinMap = new Map<number,GuildMember[]>();
    const guildMembers = await guild.members.fetch();
    for (const member of guildMembers.values()) {
        console.log((member.joinedTimestamp??0));
    }
}
import { CacheType, CommandInteraction, Guild, GuildMember, Interaction, MessageAttachment, MessagePayload } from 'discord.js';



type NeededInfo = {
    tag: string,
    id: string,
    createTimestamp: number,
}

interface InfoObject {
    [propName: number]: NeededInfo[];
}

export async function handleCheckScams(interaction: CommandInteraction) {
    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        interaction.reply({ content: "This command only works in guilds!", ephemeral: true });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    const joinMap = new Map<number, GuildMember[]>();
    const resultsMap = new Map<number, NeededInfo[]>();
    const guildMembers = await guild.members.fetch();
    for (const member of guildMembers.values()) {
        const timestamp = Math.floor(((member.joinedTimestamp ?? 0) / 100000));
        const entry = joinMap.get(timestamp);
        if (entry === undefined) {
            joinMap.set(timestamp, [member]);
        } else {
            entry.push(member);
        }
    }

    for (const [key, value] of joinMap) {
        if (value.length > 3) {
            const neededInfo: NeededInfo[] = value.map(member => {
                const toReturn: NeededInfo = ({ tag: member.user.tag, id: member.id, createTimestamp: Math.floor(member.user.createdTimestamp / 10000000) });
                return toReturn;
            })
            resultsMap.set(key, neededInfo);
        }
    }

    const infoObj: InfoObject = Object.fromEntries(resultsMap);
    const attachment: Buffer = Buffer.from(JSON.stringify(infoObj));
    const file = await MessagePayload.resolveFile(attachment);
    file.name = "info.json";
    interaction.editReply({files: [file]});
}
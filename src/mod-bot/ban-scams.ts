import {
    Collection,
    CommandInteraction,
    GuildMember,
    HTTPAttachmentData,
    MessagePayload,
} from 'discord.js';
import log from 'loglevel';
import { VERIFIED_ROLE_ID } from '../common/constants';

type NeededInfo = {
    tag: string;
    id: string;
    createTimestamp: number;
};

interface InfoObject {
    [propName: number]: NeededInfo[];
}

export async function handleCheckScams(interaction: CommandInteraction) {
    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        interaction.reply({
            content: 'This command only works in guilds!',
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });

    const guildMembers = await guild.members.fetch();
    log.info(guildMembers.size);
    const verifedRoleIds = [VERIFIED_ROLE_ID];
    const { infoObj, totalSus } = getQuestionableMembers(
        guildMembers,
        verifedRoleIds,
        3
    );
    const file = await makeResultsFile(infoObj);
    interaction.editReply({
        content: `Potential Bots: ${totalSus}`,
        files: [file],
    });
}

function getQuestionableMembers(
    guildMembers: Collection<string, GuildMember>,
    verifedRoleIds: string[],
    joinNumber: number
) {
    const joinMap = new Map<number, GuildMember[]>();
    const resultsMap = new Map<number, NeededInfo[]>();
    let totalSus = 0;
    for (const member of guildMembers.values()) {
        if (member.roles.cache.hasAny(...verifedRoleIds)) {
            continue;
        }
        const timestamp = Math.floor((member.joinedTimestamp ?? 0) / 100000);
        const entry = joinMap.get(timestamp);
        if (entry === undefined) {
            joinMap.set(timestamp, [member]);
        } else {
            entry.push(member);
        }
    }

    for (const [key, value] of joinMap) {
        if (value.length > joinNumber) {
            totalSus += value.length;
            const neededInfo: NeededInfo[] = value.map((member) => {
                const toReturn: NeededInfo = {
                    tag: member.user.tag,
                    id: member.id,
                    createTimestamp: Math.floor(
                        member.user.createdTimestamp / 10000000
                    ),
                };
                return toReturn;
            });
            resultsMap.set(key, neededInfo);
        }
    }
    log.info('TotalSus: ', totalSus);
    const infoObj: InfoObject = Object.fromEntries(resultsMap);
    return { infoObj: infoObj, totalSus: totalSus };
}

async function makeResultsFile(
    infoObj: InfoObject
): Promise<HTTPAttachmentData> {
    const attachment: Buffer = Buffer.from(JSON.stringify(infoObj));
    const file = await MessagePayload.resolveFile(attachment);
    file.name = 'info.json';
    return file;
}

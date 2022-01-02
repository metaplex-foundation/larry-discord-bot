import { ApplicationCommandData, CommandInteraction } from 'discord.js';

export type CommandObject = {
    data: ApplicationCommandData;
    execute(
        interaction: CommandInteraction<'present'> | CommandInteraction
    ): Promise<void>;
    permissions: {
        modOnly: boolean;
    };
};

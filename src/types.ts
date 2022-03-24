import { ApplicationCommandData, CommandInteraction } from 'discord.js';

export type CommandObject = {
    data: ApplicationCommandData;
    execute(interaction: CommandInteraction<'cached'> | CommandInteraction): Promise<void>;
    permissions: {
        modOnly: boolean;
    };
};

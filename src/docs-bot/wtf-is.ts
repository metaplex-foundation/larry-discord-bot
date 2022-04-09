import { CommandInteraction } from 'discord.js';
import * as child_process from 'child_process';
import * as util from 'util';

export async function wtfIs(interaction: CommandInteraction) {
    const query = interaction.options.getString('code', true);
    const hidden = interaction.options.getBoolean('hidden');

    await interaction.deferReply({ ephemeral: hidden ?? false });

    // Uses the `wtf-is` crate made by Sam Vanderwaal.
    // https://crates.io/crates/wtf-is/0.3.0
    const execFile = util.promisify(child_process.execFile);
    const { stdout } = await execFile('wtf-is', [query]);

    const message = `**Response from *wtf-is*:**\n${stdout}`;
    await interaction.editReply(message);
}
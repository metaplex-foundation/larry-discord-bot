import { GuildMember, Interaction } from 'discord.js';
import { getCommands, setupCommands } from './common/slashCommands';
import { handleOnJoin } from './mod-bot/on-join';
import { Client, Intents } from 'discord.js';
import modCommands from './mod-bot/commands';
import log from 'loglevel';
import dotenv from 'dotenv';
dotenv.config();

log.setLevel(log.levels.INFO);

process.on('unhandledRejection', (error) => {
    log.error('Unhandled promise rejection:', error);
});

// Create a new discord client
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
});

client.login(process.env.MOD_BOT_TOKEN);

// When the client is ready, run this code (only once)
client.once('ready', async () => {
    log.info('Ready!');
    await main();
});

async function main() {
    if (!client.isReady()) return;
    // const { guilds, commands } = await setupCommands(client, modCommands);
    const commands = getCommands(modCommands);
    client.on('interactionCreate', async (interaction: Interaction) => {
        if (!interaction.isCommand()) return;
        log.debug('Command Name: ', interaction.commandName);
        const theCommand = commands.get(interaction.commandName);

        if (!theCommand) return;

        try {
            await theCommand.execute(interaction);
        } catch (error) {
            log.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    });

    client.on('guildMemberAdd', async (guildMember: GuildMember) => {
        await handleOnJoin(guildMember);
    });
}

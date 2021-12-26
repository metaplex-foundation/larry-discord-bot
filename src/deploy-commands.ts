/* eslint-disable @typescript-eslint/no-var-requires */
// Fix block scoped issue
export { };

require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
import fs from 'fs';

const tokens = [process.env.DOCS_BOT_TOKEN, process.env.BAN_SCAMS_BOT_TOKEN, process.env.JOIN_KICK_BOT_TOKEN];
const ids = [process.env.DOCS_BOT_ID, process.env.BAN_SCAMS_BOT_ID, process.env.JOIN_KICK_BOT_ID];
const commandFolders = ['docs-bot', 'ban-scams-bot', 'join-kick-bot'];


const guildId = process.env.TEST_GUILD_ID;
// const guildId = process.env.GUILD_ID;

for (let i = 0; i < commandFolders.length; i++) {
    const commands: JSON[] = [];
    const commandFiles = fs
        .readdirSync(`./${commandFolders[i]}`)
        .filter((file: string) => file.endsWith('.ts'));

    for (const file of commandFiles) {
        const command = require(`./${commandFolders[i]}/${file}`);
        commands.push(command.data);
    }
    const rest = new REST({ version: '8' }).setToken(tokens[i]);

    rest.put(Routes.applicationGuildCommands(ids[i], guildId), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}
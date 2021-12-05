const dotenv = require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.TEST_GUILD_ID;

const commands = [
	new SlashCommandBuilder().setName('docs').setDescription('Replies with a link to the Metaplex Docs!').setDefaultPermission(true),
	new SlashCommandBuilder().setName('add').setDescription('Adds a link to the Metaplex Docs!').setDefaultPermission(false),
    new SlashCommandBuilder().setName('refresh').setDescription('Refreshes my database!').setDefaultPermission(false),
    new SlashCommandBuilder().setName('checkspam').setDescription('Checks all the members I\'ve tracked for bot spam!').setDefaultPermission(false),
    new SlashCommandBuilder().setName('banspam').setDescription('Does some magic to ban the bot spam!').setDefaultPermission(false),

]
	.map(command => command.toJSON());

const rest = new REST({ version: '8' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
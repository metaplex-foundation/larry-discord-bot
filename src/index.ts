import { Interaction } from "discord.js";
import { handleAutoComplete } from "./util/handleAutocomplete";


// Require neccesary discord.js classes and dotenv
const dotenv = require('dotenv').config();
const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');
// const Sequelize = require('sequelize');

// // define Sqlite connection
// const sequelize = new Sequelize('database', 'user', 'password', {
// 	host: 'localhost',
// 	dialect: 'sqlite',
// 	logging: false,
// 	// SQLite only
// 	storage: 'database.sqlite',
// });


// Create a new discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter((file: string) => file.endsWith('.ts'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.login(process.env.DISCORD_TOKEN);

client.on('interactionCreate', async (interaction: Interaction) => {
	if (interaction.isAutocomplete()) {
		await handleAutoComplete(interaction);
		return;
	}

	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});
// Fix dotenv issue
export {};

// Require neccesary discord.js classes and dotenv
const dotenv = require('dotenv').config();
const { Client, Intents } = require('discord.js');

// Create a new discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.login(process.env.DISCORD_TOKEN);
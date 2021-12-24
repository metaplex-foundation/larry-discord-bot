// Fix block scoped issue
export {};

const dotenv = require("dotenv").config();
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
// const guildId = process.env.TEST_GUILD_ID;
const guildId = process.env.GUILD_ID;

const commands: JSON[] = [];
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file: string) => file.endsWith(".ts"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data);
}
const rest = new REST({ version: "8" }).setToken(token);

rest
	.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log("Successfully registered application commands."))
	.catch(console.error);

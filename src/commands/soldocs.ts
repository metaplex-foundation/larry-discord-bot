import { Interaction } from "discord.js";

module.exports = {
	data: {
		name: 'soldocs',
		description: 'Fetches the Solana Docs',
		defaultPermission: true,
		options: [
			{
				name: 'query',
				description: 'Phrase to search for',
				type: 3,
				required: true,
				autocomplete: true,
			}
		],
	},
	async execute(interaction: Interaction) {

	}
};
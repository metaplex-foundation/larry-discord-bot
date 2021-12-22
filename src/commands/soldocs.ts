import { Interaction } from "discord.js";
import { algoliaResult, solanaIndex } from "../util/handleAutocomplete";

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
		await algoliaResult(solanaIndex,interaction);
	}
};
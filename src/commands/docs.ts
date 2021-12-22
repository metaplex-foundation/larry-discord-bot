import { Interaction } from "discord.js";
import { algoliaResult, metaplexIndex } from "../util/handleAutocomplete";

module.exports = {
	data: {
		name: 'docs',
		description: 'Fetches the Metaplex Docs',
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
		await algoliaResult(metaplexIndex, interaction);
	}
};
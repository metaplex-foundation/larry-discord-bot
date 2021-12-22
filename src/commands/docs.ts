import { ApplicationCommand, CommandInteraction, Interaction } from "discord.js";
import { getAlgoliaResponse, metaplexIndex } from "../util/handleAutocomplete";

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
		console.log("hi");
		
		if (!interaction.isCommand()) return;
		await interaction.deferReply();
		const query = interaction.options.get("query")?.value;
		if (typeof query !== 'string') {
			const response = await interaction.editReply("Something went wrong");
			return;
		}
		const result = await getAlgoliaResponse(query,metaplexIndex);
		const response = await interaction.editReply(`${result.responses[0]?.name}: *${result.links[0]}*`);
	}
};
const dotenv = require('dotenv').config();
import algoliasearch, { SearchIndex } from "algoliasearch";
import { ApplicationCommandOptionChoice, AutocompleteInteraction, Interaction } from "discord.js";

const ALGOLIA_APP_METAPLEX = process.env.ALGOLIA_APP_METAPLEX ?? 'MISSING';
const ALGOLIA_KEY_METAPLEX = process.env.ALGOLIA_KEY_METAPLEX ?? 'MISSING';

const ALGOLIA_APP_SOLANA = process.env.ALGOLIA_APP_SOLANA ?? 'MISSING';
const ALGOLIA_KEY_SOLANA = process.env.ALGOLIA_KEY_SOLANA ?? 'MISSING';

const metaplexClient = algoliasearch(ALGOLIA_APP_METAPLEX, ALGOLIA_KEY_METAPLEX);
export const metaplexIndex = metaplexClient.initIndex('metaplex');

const solanaClient = algoliasearch(ALGOLIA_APP_SOLANA, ALGOLIA_KEY_SOLANA);
export const solanaIndex = solanaClient.initIndex('solana');


type AlgoliaResults = { responses: ApplicationCommandOptionChoice[], links: string[] };

export async function handleAutoComplete(interaction: AutocompleteInteraction) {
    if (interaction.commandName === 'docs') {
        let query = interaction.options.getFocused();
        if (typeof query === 'number') return;
        let { responses: choices } = await getAlgoliaResponse(query, metaplexIndex);
        const response = await interaction.respond(choices);
    } else if (interaction.commandName === 'soldocs') {
        let query = interaction.options.getFocused();
        if (typeof query === 'number') return;
        let { responses: choices } = await getAlgoliaResponse(query, solanaIndex);
        const response = await interaction.respond(choices);
    }
};

export async function getAlgoliaResponse(query: string, index: any, hits: number = 10): Promise<AlgoliaResults> {
    let result = await index.search(query, {
        attributesToRetrieve: ['type', 'hierarchy', 'url'],
        hitsPerPage: hits,
    }).catch((error: any) => { console.log(error) });
    if (!result.hits) return { responses: [], links: [] };
    let responses: ApplicationCommandOptionChoice[] = [];
    let links: string[] = [];
    for (let i = 0; i < result.hits.length; i++) {
        const type: string = result.hits[i]?.type;
        const choice: string = result.hits[i]?.hierarchy[type];
        if (!choice || !type) {
            continue;
        }
        links.push(result.hits[i]?.url);
        const newResponse: ApplicationCommandOptionChoice = { name: choice, value: choice };
        responses.push(newResponse);
    }
    return { responses, links };
}

export async function algoliaResult(index: SearchIndex, interaction: Interaction) {
    if (!interaction.isCommand()) return;
    await interaction.deferReply();
    const query = interaction.options.get("query")?.value;
    if (typeof query !== 'string') {
        const response = await interaction.editReply("Something went wrong");
        return;
    }
    const result = await getAlgoliaResponse(query, index, 1);
    const response = await interaction.editReply(`${result.responses[0]?.name}: *${result.links[0]}*`);
}

const dotenv = require('dotenv').config();
import algoliasearch, { SearchIndex } from "algoliasearch";
import { ApplicationCommandInteractionOptionResolver, ApplicationCommandOptionChoice, ApplicationCommandOptionData, AutocompleteInteraction, Interaction, InteractionReplyOptions } from "discord.js";
import { ApplicationCommandInteractionDataOptionChannel } from "discord.js/node_modules/discord-api-types";

const ALGOLIA_APP_METAPLEX = process.env.ALGOLIA_APP_METAPLEX ?? 'MISSING';
const ALGOLIA_KEY_METAPLEX = process.env.ALGOLIA_KEY_METAPLEX ?? 'MISSING';

const ALGOLIA_APP_SOLANA = process.env.ALGOLIA_APP_METAPLEX ?? 'MISSING';
const ALGOLIA_KEY_SOLANA = process.env.ALGOLIA_KEY_METAPLEX ?? 'MISSING';

const metaplexClient = algoliasearch(ALGOLIA_APP_METAPLEX, ALGOLIA_KEY_METAPLEX);
export const metaplexIndex = metaplexClient.initIndex('metaplex');

const solanaClient = algoliasearch(ALGOLIA_APP_SOLANA, ALGOLIA_KEY_SOLANA);
export const solanaIndex = algoliasearch(ALGOLIA_APP_SOLANA, ALGOLIA_KEY_SOLANA);


type AlgoliaResults = { responses: ApplicationCommandOptionChoice[], links: string[] };

export async function handleAutoComplete(interaction: AutocompleteInteraction) {
    if (interaction.commandName === 'docs') {
        let query = interaction.options.getFocused();
        if (typeof query === 'number') return;
        console.log(query);
        let { responses: choices } = await getAlgoliaResponse(query, metaplexIndex);
        const response = await interaction.respond(choices);
    }
};

export async function getAlgoliaResponse(query: string, index: any, hits: number = 10): Promise<AlgoliaResults> {
    let result = await index.search(query, {
        attributesToRetrieve: ['type', 'hierarchy', 'url'],
        hitsPerPage: hits,
    });
    if (!result.hits) return { responses: [], links: [] };
    let responses: ApplicationCommandOptionChoice[] = [];
    let links: string[] = [];
    for (let i = 0; i < result.hits.length; i++) {
        const type: string = result.hits[i]?.type;
        const choice: string = result.hits[i]?.hierarchy[type];
        if (!choice || !type){
            continue;
        }
        links.push(result.hits[i]?.url);
        const newResponse: ApplicationCommandOptionChoice = { name: choice, value: choice };
        responses.push(newResponse);
    }
    return { responses, links };
}
import { CommandInteraction, Interaction } from 'discord.js';

module.exports = {
    data: {
        name: 'emptytrash',
        description: 'Gets rid of pesky spam/scam bots',
        defaultPermission: false,
        options: [
            {
                name: 'user',
                description: 'The user to smite',
                type: 6,
                required: true,
            },
            {
                name: 'method',
                description: 'kick or ban',
                type: 3,
                required: true,
                choices: [
                    { name: 'ban', value: 'ban' },
                    { name: 'kick', value: 'kick' },
                ],
            },
        ],
    },
    async execute(interaction: CommandInteraction) {},
};

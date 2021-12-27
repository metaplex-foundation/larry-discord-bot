import { Interaction } from 'discord.js';

module.exports = {
    data: {
        name: 'addjoincheck',
        description: 'Adds a member to the join check',
        defaultPermission: false,
        options: [
            {
                name: 'user',
                description: 'The user to protect',
                type: 6,
                required: true,
            },
        ],
    },
    async execute(interaction: Interaction) {},
};

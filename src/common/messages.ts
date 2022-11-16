import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Colors,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
} from 'discord.js';

const confirmButton = new ButtonBuilder()
    .setCustomId('confirm')
    .setLabel('Confirm')
    .setStyle(ButtonStyle.Success);

const cancelButton = new ButtonBuilder()
    .setCustomId('cancel')
    .setLabel('Cancel')
    .setStyle(ButtonStyle.Danger);

export const errorEmbed = new EmbedBuilder().setColor(Colors.Red);
export const successEmbed = new EmbedBuilder().setColor(Colors.Green);
export const pendingEmbed = new EmbedBuilder().setColor(Colors.Orange);
export const alertEmbed = new EmbedBuilder().setColor(Colors.Yellow);

export const countingEmbed = new EmbedBuilder()
    .setDescription('Counting members. Please wait...')
    .setColor(Colors.Orange);

export const cancelEmbed = new EmbedBuilder()
    .setDescription(`Interaction cancelled.`)
    .setColor(Colors.Red);

export async function doConfirmation(interaction: CommandInteraction<'cached'>, message: string) {
    const embed = pendingEmbed.setDescription(message);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton);
    await interaction.editReply({ embeds: [embed], components: [row] });
    const lastMessage = await interaction.fetchReply();

    const filter = (i: ButtonInteraction<'cached'>) => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
    };
    const click = await lastMessage.awaitMessageComponent({
        filter,
        componentType: ComponentType.Button,
        time: 15000,
    }).catch(() => false);
    if (typeof click === 'boolean') return false;
    return click.customId === 'confirm';
}

export async function deleteReply(interaction: CommandInteraction<'cached'>) {
    if (!interaction.ephemeral) {
        setTimeout(async () => {
            await interaction.deleteReply();
        }, 10000);
    }
}

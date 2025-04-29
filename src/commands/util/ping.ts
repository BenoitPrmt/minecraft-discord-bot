import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import config from '../../config';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🔴 Latence du bot et de l\'API Discord');

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder()
        .setTitle('Pong ! 🏓')
        .setColor(config.color.default)
        .setDescription(`Latence bot : ${Date.now() - interaction.createdTimestamp}ms\nLatence API : ${Math.round(interaction.client.ws.ping)}ms`)
        .setFooter({ text: config.embed.footer });

    await interaction.reply({ embeds: [embed] });
};

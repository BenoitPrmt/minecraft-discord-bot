import {ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder} from 'discord.js';
import {startInstance, stopInstance} from '../../helpers/ec2';
import config from "../../config";

export const data = new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Arrête le serveur Minecraft');

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder()
        .setTitle("Arrêt de l'instance EC2")
        .setColor(config.color.default)
        .setDescription('Arrêt de l\'instance EC2 en cours...')
        .setFooter({ text: config.embed.footer });

    await interaction.reply({ embeds: [embed] });

    await stopInstance().then(() => {
        const successEmbed = new EmbedBuilder()
            .setTitle("Instance EC2 arrêtée")
            .setColor(config.color.success)
            .setDescription('L\'instance EC2 a été arrêtée avec succès.')
            .setFooter({ text: config.embed.footer });

        interaction.editReply({
            embeds: [successEmbed]
        });
    })
};

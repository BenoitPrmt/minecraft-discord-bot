import {ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder} from 'discord.js';
import { startInstance } from '../../helpers/ec2';
import {status} from "minecraft-server-util";
import config from "../../config";

export const data = new SlashCommandBuilder()
    .setName('start')
    .setDescription('Démarre le serveur Minecraft');

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder()
        .setTitle("Démarrage de l'instance EC2")
        .setColor(config.color.default)
        .setDescription('Démarrage de l\'instance EC2 en cours...')
        .setFooter({ text: config.embed.footer });

    await interaction.reply({ embeds: [embed] });

    try {
        await startInstance().then(async () => {
            await new Promise(resolve => setTimeout(resolve, 30000));

            const successEmbed = new EmbedBuilder()
                .setTitle("Instance EC2 démarrée")
                .setColor(config.color.success)
                .setDescription('L\'instance EC2 a été démarrée avec succès.')
                .setFooter({ text: config.embed.footer });

            await interaction.editReply({
                embeds: [successEmbed]
            });
        })
    } catch (err) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("Erreur lors du démarrage de l'instance EC2")
            .setColor(config.color.error)
            .setDescription('Une erreur est survenue lors du démarrage de l\'instance EC2, réessayez plus tard.')
            .setFooter({ text: config.embed.footer });

        await interaction.editReply({
            embeds: [errorEmbed]
        });
    }
};
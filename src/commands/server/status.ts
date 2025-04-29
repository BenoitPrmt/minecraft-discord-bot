import {ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder} from 'discord.js';
import { startInstance } from '../../helpers/ec2';
import {status} from "minecraft-server-util";
import config from '../../config';

const SERVER_IP = process.env.AWS_IP_ADDRESS!;
const SERVER_PORT = 25565;

export const data = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Vérifie le statut du serveur Minecraft');

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder()
        .setTitle("Statut du serveur Minecraft")
        .setColor(config.color.default)
        .setDescription('Vérification du statut du serveur Minecraft en cours...')
        .setFooter({ text: config.embed.footer });

    await interaction.reply({ embeds: [embed] });

    try {
        const res = await status(SERVER_IP, SERVER_PORT);
        console.log(res);
        const players = res.players.online;
        const successEmbed = new EmbedBuilder()
            .setTitle("Statut du serveur Minecraft")
            .setColor(config.color.default)
            .setDescription(
                `
            **✅ Statut du serveur :** En ligne
            **⚔️ Joueurs connectés :** ${players}
            **🗺️ Version :** ${res.version.name}
            `
            )
            .setFields(
                {
                    name: '**👾 Joueurs**',
                    value: res.players.sample ? res.players.sample.map((player) => player.name).join(', ') : 'Aucun joueur connecté',
                    inline: false
                },
            )
            .setFooter({ text: config.embed.footer });

        await interaction.editReply({
            embeds: [successEmbed]
        });
    } catch (err) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("Statut du serveur Minecraft")
            .setColor('#FF0000')
            .setDescription('Le serveur est hors ligne.')
            .setFooter({ text: config.embed.footer });

        await interaction.editReply({
            embeds: [errorEmbed]
        });
    }
};
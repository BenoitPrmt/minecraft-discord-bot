import {ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder} from 'discord.js';
import config from "../../config";
import {DbPlayer} from "../../types/Player";
import {playerTable} from "../../helpers/db";
import {LeaderboardHelper} from "../../helpers/leaderboard";

export const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Voir le tableau des temps de jeu');

export const execute = async (interaction: ChatInputCommandInteraction) => {
    try {
        const leaderboardEmbed = new EmbedBuilder()
            .setTitle("Leaderboard")
            .setColor(config.color.default)
            .setFooter({ text: config.embed.footer });

        const players: DbPlayer[] = await playerTable.all();

        const leaderboardData = players.map((player: DbPlayer, index: number) => {
            return {
                name: `${LeaderboardHelper.displayLeaderboardRank(index + 1)} - ${player.value.username}`,
                value: `${LeaderboardHelper.displayPlaytime(player.value.playtime)} de jeu`,
                inline: true
            }
        })

        leaderboardEmbed.setFields(
            leaderboardData.length > 0 ? leaderboardData : [{
                name: 'Aucun joueur trouvé',
                value: 'Aucun joueur n\'a été trouvé sur le serveur.',
                inline: false
            }]
        )

        await interaction.reply({ embeds: [leaderboardEmbed] });
    } catch (err) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("Erreur")
            .setColor(config.color.error)
            .setDescription('Oups ! Une erreur est survenue lors de la récupération du leaderboard.')
            .setFooter({ text: config.embed.footer });

        await interaction.editReply({
            embeds: [errorEmbed]
        });
    }
};
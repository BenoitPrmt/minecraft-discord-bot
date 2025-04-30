import {ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder} from 'discord.js';
import config from "../../config";
import {DbPlayer} from "../../types/Player";
import {playerTable} from "../../helpers/db";
import {LeaderboardHelper} from "../../helpers/leaderboard";

export const data = new SlashCommandBuilder()
    .setName('player')
    .setDescription('Voir les informations sur un joueur')
    .addStringOption(option =>
        option.setName('username')
            .setDescription('Nom du joueur')
            .setRequired(true)
    );

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const username = interaction.options.getString('username', true);
    const players: DbPlayer[] | null = await playerTable.all();

    if (!players) {
        await interaction.reply({ content: '❌ Aucun joueur trouvé.', ephemeral: true });
        return;
    }

    const player = players.find((player: DbPlayer) => player.value.username.toLowerCase() === username.toLowerCase());

    if (!player) {
        await interaction.reply({ content: `❌ Aucun joueur trouvé avec le nom ${username}.`, ephemeral: true });
        return;
    }

    const leaderboard = await LeaderboardHelper.getLeaderboard();
    const lastSeenTimestamp = Math.floor(new Date(player.value.lastSeen).getTime() / 1000);

    const playerEmbed = new EmbedBuilder()
        .setTitle(`Informations sur ${player.value.username}`)
        .setColor(config.color.default)
        .setFooter({ text: config.embed.footer })
        .addFields([
            { name: 'Temps de jeu', value: LeaderboardHelper.displayPlaytime(player.value.playtime) },
            { name: 'Dernière connexion', value: `<t:${lastSeenTimestamp}:R>` },
            { name: 'Rang', value: LeaderboardHelper.displayLeaderboardRank(LeaderboardHelper.calculateLeaderboardRank(leaderboard, player.id)) }
        ]);

    await interaction.reply({ embeds: [playerEmbed] });
};
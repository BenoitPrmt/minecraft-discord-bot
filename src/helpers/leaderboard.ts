import {playerTable} from "./db";
import {CompletePlayer, DbPlayer, Player} from "../types/Player";

export class LeaderboardHelper {
    static async getLeaderboard(): Promise<CompletePlayer[]> {
        const players = await playerTable.all();
        return players.map((player) => {
            return {
                id: player.id,
                username: player.value.username,
                playtime: player.value.playtime,
                lastSeen: player.value.lastSeen,
                firstSeen: player.value.firstSeen,
            };
        });
    }

    static calculateLeaderboardRank(leaderboard: CompletePlayer[], userId: string): number {
        const rank = leaderboard.findIndex((player) => player.id === userId) + 1;

        return rank > 0 ? rank : -1;
    }

    static displayLeaderboardRank(rank: number): string {
        const emojis: Record<number, string> = {
            1: '🥇',
            2: '🥈',
            3: '🥉',
        };

        return emojis[rank] || `${rank}`;
    }

    static displayPlaytime(playtime: number): string {
        const days = Math.floor(playtime / (24 * 60));
        const hours = Math.floor((playtime % (24 * 60)) / 60);
        const minutes = playtime % 60;

        let result = '';
        if (days > 0) {
            result += `${days}j `;
        }
        if (hours > 0) {
            result += `${hours}h `;
        }
        result += `${minutes}m`;

        return result.trim();
    }
}
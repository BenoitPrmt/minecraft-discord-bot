import {JavaStatusResponse} from "minecraft-server-util";
import {playerTable} from "./db";
import {Player} from "../types/Player";

export const processAnalytics = (data: JavaStatusResponse) => {
    const players = data.players.sample;
    console.log(players);

    if (players && players.length > 0) {
        players.forEach(async (player) => {
            const dbPlayer: Player | null = await playerTable.get(`${player.id}`);

            if (dbPlayer) {
                dbPlayer.playtime += 1;
                dbPlayer.lastSeen = new Date();
                await playerTable.set(`${player.id}`, dbPlayer);
            } else {
                await playerTable.set(`${player.id}`, {
                    username: player.name,
                    playtime: 1,
                    lastSeen: Date.now(),
                    firstSeen: Date.now()
                });
            }
        });
    }
}

import {status} from "minecraft-server-util";
import {CHECK_INTERVAL, SERVER_PORT, TIMEOUT} from "../constants/server";
import {stopInstance} from "./ec2";
import {processAnalytics} from "./analytics";

let lastPlayersConnected = Date.now();
let shutdownTimer: NodeJS.Timeout | null = null;

export const monitorPlayers = () => {
    lastPlayersConnected = Date.now();
    setInterval(async () => {
        try {
            console.log("Pinging Minecraft server...");
            const res = await status( process.env.AWS_IP_ADDRESS!, SERVER_PORT);
            processAnalytics(res);
            const players = res.players.online;
            console.log(`${players} players connected`);
            if (players > 0) {
                lastPlayersConnected = Date.now();
                if (shutdownTimer) {
                    clearTimeout(shutdownTimer);
                    shutdownTimer = null;
                }
            } else {
                console.log(`Stopping instance in ${TIMEOUT / 1000 / 60} minutes...`);
                if (!shutdownTimer && Date.now() - lastPlayersConnected > TIMEOUT) {
                    console.log('No players for 10 min, stopping instance...');
                    await stopInstance();
                }
            }
        } catch (err) {
            console.error('Erreur de ping Minecraft :', err);
        }
    }, CHECK_INTERVAL);
};
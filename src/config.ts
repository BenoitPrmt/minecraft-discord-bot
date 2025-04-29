import {Config} from "./types/Config";

const config: Config = {
    discordToken: process.env.DISCORD_TOKEN!,
    botId: process.env.DISCORD_BOT_ID!,
    isWhitelistEnabled: false,
    whitelist: [],
    color: {
        default: 0x4259ff,
        success: 0x47c78e,
        warning: 0xffb710,
        error: 0xff6684,
    },
    embed: {
        footer: 'Développé par @BenoitPrmt'
    }
};

export default config;
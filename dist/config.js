"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    discordToken: process.env.DISCORD_TOKEN,
    botId: process.env.DISCORD_BOT_ID,
    whitelist: [
        "351456719294955538", // Benoit
        "306509538184658944", // Matéo
        "281552810095411204", // Guillaume
        "353872861519413248", // Raphaël
    ],
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

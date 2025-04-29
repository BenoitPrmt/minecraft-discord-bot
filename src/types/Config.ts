export type Config = {
    discordToken: string;
    botId: string;
    isWhitelistEnabled: boolean;
    whitelist: string[];
    color: {
        default: number;
        success: number;
        warning: number;
        error: number;
    };
    embed: {
        footer: string;
    };
}
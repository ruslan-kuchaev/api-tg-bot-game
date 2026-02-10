import { Context, SessionFlavor } from "grammy";

export interface GameUpdate {
    title: string;
    hasUpdate: boolean;
    lastUpdateTime?: string;
    lastCheck: Date;
    lastNews?: {
        date: string;
        title: string;
        url?: string;
    };
}

export interface SessionData {
    lastCheckTime?: Date;
    gameUpdates?: {
        [gameName: string]: GameUpdate;
    };
}

export type MyContext = Context & SessionFlavor<SessionData>;
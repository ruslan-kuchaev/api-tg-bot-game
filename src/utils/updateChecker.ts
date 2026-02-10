import { getGamesConfig } from './configLoader';
import { NewsItem, NewsResponse } from './steamApi';

export async function checkGameUpdates(): Promise<Array<{
    game: string;
    hasUpdate: boolean;
    lastUpdate?: NewsItem;
    lastCheck: Date;
    errorConfig?: string;
    errorGame?: string
}>> {
    const results = [];
    const now = new Date();

    const WORD_EXCEPTIONS = ["Update", "Version", "Patch", "Hotfix"]
    
    let games: any[];
    try {
        games = getGamesConfig();
    } catch (error : any) {
        return [{
            game: "Конфиг",
            hasUpdate: false,
            lastCheck: now,
            errorConfig: `${error.message}` || "что то с кофигом"
        }];
    }

    const apiUrl = "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2";

    for (const game of games) {
        try {
            const response = await fetch(
                `${apiUrl}?appid=${game.appId}&count=1&maxlength=100&format=json`
            );

            if (!response.ok) {
                results.push({
                    game: game.name,
                    hasUpdate: false,
                    lastCheck: now,
                    errorGame: "ошибка при получение данных"
                });
                continue;
            }

            const data: NewsResponse = await response.json();
            const latestNews = data.appnews.newsitems[0];

            if (latestNews) {
                const newsDate = new Date(latestNews.date * 1000);
                const hoursDiff = (now.getTime() - newsDate.getTime()) / (1000 * 60 * 60);
                const titleNews = latestNews.title;
                const hasUpdateWord = WORD_EXCEPTIONS.some(word => titleNews.toLowerCase().includes(word.toLowerCase()))
                
                if (hoursDiff < 24 && hasUpdateWord === true){
                    results.push({
                    game: game.name,
                    hasUpdate: true,
                    lastUpdate: latestNews,
                    lastCheck: now
                });
                
            }else{
                results.push({
                    game: game.name,
                    hasUpdate: false,
                    lastCheck: now
                })
            }
            } else {
                results.push({
                    game: game.name,
                    hasUpdate: false,
                    lastCheck: now
                });
            }
        } catch (error) {
            results.push({
                game: game.name,
                hasUpdate: false,
                lastCheck: now,
                errorGame: "Проверки нету url ошибка"
            });
        }
    }

    return results;
}
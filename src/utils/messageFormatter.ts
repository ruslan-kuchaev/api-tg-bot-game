import { checkGameUpdates } from './updateChecker';

export function formatUpdateMessage(updates: ReturnType<typeof checkGameUpdates> extends Promise<infer T> ? T : never): string {
    const configError = updates.find(update => update.errorConfig);
    if (configError) {
        return `❌ **Ошибка:** ${configError.errorConfig}`;
    }

    const hasAnyUpdates = updates.some(update => update.hasUpdate);

    if (!hasAnyUpdates) {
        return "✅ Все игры обновлены";
    }

    let message = "📊 **Статус обновлений игр**\n\n";

    updates.forEach(update => {
        if (update.hasUpdate && update.lastUpdate) {
            const updateTime = new Date(update.lastUpdate.date * 1000);
            const timeString = updateTime.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            message += `🎮 **${update.game}**\n`;
            message += `✅ Обновление есть!\n`;
            message += `📅 Дата: ${timeString}\n`;
            message += `📝 ${update.lastUpdate.title.substring(0, 100)}${update.lastUpdate.title.length > 100 ? '...' : ''}\n\n`;
        }
    });

    const failedGames = updates.filter(update => update.errorGame);
    if (failedGames.length > 0) {
        message += `\n⚠️ **Проблемы с проверкой:**\n`;
        failedGames.forEach(game => {
            message += `❌ ${game.game}: ${game.errorGame}\n`;
        });
    }

    message += `\n⏰ Последняя проверка: ${new Date().toLocaleString('ru-RU')}`;

    return message;
}
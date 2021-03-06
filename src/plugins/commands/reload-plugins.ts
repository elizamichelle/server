import { ActionType, RunePlugin } from '@server/plugins/plugin';
import { commandAction } from '@server/world/actor/player/action/input-command-action';
import { injectPlugins } from '@server/game-server';

const action: commandAction = (details) => {
    const { player } = details;

    player.sendMessage('Reloading plugins...');

    injectPlugins()
        .then(() => player.sendMessage('Plugins reloaded.'))
        .catch(() => player.sendMessage('Error reloading plugins.'));
};

export default new RunePlugin({ type: ActionType.COMMAND, commands: 'plugins', action });

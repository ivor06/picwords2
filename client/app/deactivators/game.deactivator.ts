import {CanDeactivate} from '@angular/router';

import {GameComponent} from "../components/game/game.component";

export class GameDeactivator implements CanDeactivate<GameComponent> {
    canDeactivate(game: GameComponent) {
        game.saveState();
        return true;
    }
}

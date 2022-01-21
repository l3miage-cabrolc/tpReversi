import { Injectable } from '@angular/core';
import { RouteConfigLoadStart } from '@angular/router';
import { ReversiGameEngineService } from './reversi-game-engine.service';

@Injectable({
  providedIn: 'root'
})
export class IaService {

  constructor(private RGS: ReversiGameEngineService) { 
    RGS.gameStateObs.subscribe((game) => {
      RGS.résuméDebug();
      if(game.turn === 'Player2') {
        const possiblePlays = RGS.whereCanPlay();
        if(possiblePlays.length > 0) {
          const nbCoupPossible = Math.floor(Math.random() * possiblePlays.length - 1);
          RGS.play(possiblePlays[nbCoupPossible][0], possiblePlays[nbCoupPossible][1]);
        } else {
          console.log("Aucun coup possible pour l'ia");
        }
      }
    });

    console.log("IA créée !");
  }
}

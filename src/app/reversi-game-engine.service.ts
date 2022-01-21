import { Injectable } from '@angular/core';
import { BehaviorSubject, isEmpty, Observable } from 'rxjs';
import {
  Board,
  BoardtoString,
  Board_RO,
  C,
  charToTurn,
  GameState,
  getEmptyBoard,
  PlayImpact,
  ReversiModelInterface,
  TileCoords,
  Turn,
} from './ReversiDefinitions';

@Injectable({
  providedIn: 'root',
})
export class ReversiGameEngineService implements ReversiModelInterface {
  // NE PAS MODIFIER
  protected gameStateSubj = new BehaviorSubject<GameState>({
    board: getEmptyBoard(),
    turn: 'Player1',
  });
  public readonly gameStateObs: Observable<GameState> =
    this.gameStateSubj.asObservable();

  // NE PAS MODIFIER
  constructor() {
    this.restart();
    // NE PAS TOUCHER, POUR LE DEBUG DANS LA CONSOLE
    (window as any).RGS = this;
    console.log(
      "Utilisez RGS pour accéder à l'instance de service ReversiGameEngineService.\nExemple : RGS.résuméDebug()"
    );
  }

  résuméDebug(): void {
    console.log(`________
${BoardtoString(this.board)}
________
Au tour de ${this.turn}
X représente ${charToTurn('X')}
O représente ${charToTurn('O')}
________
Coups possibles (${this.whereCanPlay().length}) :
${this.whereCanPlay()
  .map((P) => `  * ${P}`)
  .join('\n')}
    `);
  }

  // NE PAS MODIFIER
  get turn(): Turn {
    return this.gameStateSubj.value.turn;
  }

  get board(): Board_RO {
    return this.gameStateSubj.value.board;
  }

  // NE PAS MODIFIER
  restart({ turn, board }: Partial<GameState> = {}): void {
    const gs = this.initGameState();
    let newBoard: Board;
    let newTurn: Turn;

    newBoard = !!board
      ? (board.map((L) => [...L]) as Board)
      : (gs.board as Board);
    newTurn = turn ?? gs.turn;

    this.gameStateSubj.next({
      turn: newTurn,
      board: newBoard,
    });
  }

  // NE PAS MODIFIER
  play(i: number, j: number): void {
    const { board: b1, turn: t1 } = this.gameStateSubj.value;
    const { board: b2, turn: t2 } = this.tryPlay(i, j);
    if (b1 !== b2 || t1 !== t2) {
      this.gameStateSubj.next({
        turn: t2,
        board: b2,
      });
      if (!this.canPlay()) {
        this.gameStateSubj.next({
          turn: t2 === 'Player1' ? 'Player2' : 'Player1',
          board: b2,
        });
      }
    }
  }

  //_______________________________________________________________________________________________________
  //__________________________________________ MODIFICATIONS ICI __________________________________________
  //_______________________________________________________________________________________________________

  /**
   * initGameState initialise un nouveau plateau à l'état initiale (2 pions de chaque couleurs).\
   * Initialise aussi le joueur courant.
   * @returns L'état initiale du jeu, avec les 4 pions initiaux bien placés.
   */
  private initGameState(): GameState {
    /*const newBoard: Board = this.board.map((x) => [...x]) as Board; //copie le plateau de départ*/
    const board = getEmptyBoard();
    board[3][3] = board[4][4] = 'Player2';
    board[3][4] = board[4][3] = 'Player1';
    return { turn: 'Player1', board }; //renvoyer le plateau dans le gamestate
  }

  /**
   * Renvoie la liste des positions qui seront prises si on pose un pion du joueur courant en position i,j
   * @param i Indice de la ligne où poser le pion
   * @param j Indice de la colonne où poser le pion
   * @returns Une liste des positions qui seront prise si le pion est posé en x,y
   */
  PionsTakenIfPlayAt(i: number, j: number): PlayImpact {
    
    let a = i;
    let b = j;
    let n = 1;
    let posTemp:TileCoords[] = [];
    let posValide:TileCoords[] = [];

    if(this.board[i][j] === 'Empty') {
      // 1. Pour vérifier en montée
      a = i - 1;
      b = j;
      while(a >= 0 && a < this.board.length && b >= 0 && b < this.board.length && n === 1) {
        if(this.board[a][b] === 'Empty') {
          n = 0;
        } else if (this.board[a][b] !== this.turn) {
          posTemp.push([a, b]);
          a--;
        } else {
          n = 2;
          posValide.push(...posTemp);
        }
      }

      // 2. Pour vérifier en descente
      a = i + 1;
      b = j;
      posTemp = [];
      n = 1;
      while(a >= 0 && a < this.board.length && b >= 0 && b < this.board.length && n === 1) {
        if(this.board[a][b] === 'Empty') {
          n = 0;
        } else if (this.board[a][b] !== this.turn) {
          posTemp.push([a, b]);
          a++;
        } else {
          n = 2;
          posValide.push(...posTemp);
        }
      }

      // 3. Pour vérifier en diagonale haut gauche
      a = i - 1;
      b = j - 1;
      posTemp = [];
      n = 1;
      while(a >= 0 && a < this.board.length && b >= 0 && b < this.board.length && n === 1) {
        if(this.board[a][b] === 'Empty') {
          n = 0;
        } else if (this.board[a][b] !== this.turn) {
          posTemp.push([a, b]);
          a--;
          b--;
        } else {
          n = 2;
          posValide.push(...posTemp);
        }
      }

      // 4. Pour vérifier en diagonale haut droit
      a = i - 1;
      b = j + 1;
      posTemp = [];
      n = 1;
      while(a >= 0 && a < this.board.length && b >= 0 && b < this.board.length && n === 1) {
        if(this.board[a][b] === 'Empty') {
          n = 0;
        } else if (this.board[a][b] !== this.turn) {
          posTemp.push([a, b]);
          a--;
          b++;
        } else {
          n = 2;
          posValide.push(...posTemp);
        }
      }

      // 5. Pour vérifier en diagonale bas gauche
      a = i + 1;
      b = j - 1;
      posTemp = [];
      n = 1;
      while(a >= 0 && a < this.board.length && b >= 0 && b < this.board.length && n === 1) {
        if(this.board[a][b] === 'Empty') {
          n = 0;
        } else if (this.board[a][b] !== this.turn) {
          posTemp.push([a, b]);
          a++;
          b--;
        } else {
          n = 2;
          posValide.push(...posTemp);
        }
      }

      // 6. Pour vérifier en diagonale bas droit
      a = i + 1;
      b = j + 1;
      posTemp = [];
      n = 1;
      while(a >= 0 && a < this.board.length && b >= 0 && b < this.board.length && n === 1) {
        if(this.board[a][b] === 'Empty') {
          n = 0;
        } else if (this.board[a][b] !== this.turn) {
          posTemp.push([a, b]);
          a++;
          b++;
        } else {
          n = 2;
          posValide.push(...posTemp);
        }
      }

      // 7. Pour vérifier à gauche
      a = i;
      b = j - 1;
      posTemp = [];
      n = 1;
      while(a >= 0 && a < this.board.length && b >= 0 && b < this.board.length && n === 1) {
        if(this.board[a][b] === 'Empty') {
          n = 0;
        } else if (this.board[a][b] !== this.turn) {
          posTemp.push([a, b]);
          b--;
        } else {
          n = 2;
          posValide.push(...posTemp);
        }
      }

      // 8. Pour vérifier à droite
      a = i;
      b = j + 1;
      posTemp = [];
      n = 1;
      while(a >= 0 && a < this.board.length && b >= 0 && b < this.board.length && n === 1) {
        if(this.board[a][b] === 'Empty') {
          n = 0;
        } else if (this.board[a][b] !== this.turn) {
          posTemp.push([a, b]);
          b++;
        } else {
          n = 2;
          posValide.push(...posTemp);
        }
      }
    }
    
    return posValide;
  }

  /**
   * Liste les positions pour lesquels le joueur courant pourra prendre des pions adverse.
   * Il s'agit donc des coups possibles pour le joueur courant.
   * @returns liste des positions jouables par le joueur courant.
   */
  whereCanPlay(): readonly TileCoords[] {
    const L: TileCoords[] = [];
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board.length; j++) {
        if (this.PionsTakenIfPlayAt(i, j).length > 0) {
          L.push([i,j]);
        }
      }
    }
    return L;
  }

  /**
   * Le joueur courant pose un pion en i,j.
   * Si le coup n'est pas possible (aucune position de prise), alors le pion n'est pas joué et le tour ne change pas.
   * Sinon les positions sont prises et le tour de jeu change.
   * @param i L'indice de la ligne où poser le pion.
   * @param j L'indice de la colonen où poser le pion.
   * @returns Le nouvel état de jeu si le joueur courant joue en i,j, l'ancien état si il ne peut pas jouer en i,j
   */
  private tryPlay(i: number, j: number): GameState {
    const newBoard: Board = this.board.map((x) => [...x]) as Board;
    let tour = this.turn;
    let pos = this.PionsTakenIfPlayAt(i,j);
    if(pos.length > 0) {
      pos.forEach(element => {
        newBoard[element[0]][element[1]] = this.turn;
      });
      newBoard[i][j] = this.turn;
      tour = this.turn === 'Player1' ? 'Player2' : 'Player1';
    }
    
    return { turn : tour, board : newBoard };
  }

  /**
   * @returns vrai si le joueur courant peut jouer quelque part, faux sinon.
   */
  private canPlay(): boolean {
    return this.whereCanPlay().length > 0;
  }
}

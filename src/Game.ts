import { Player } from "./Player";
import { GameRound, GameSettings, UserID } from "./types";

export class Game {
  private gameId: string;
  private players: Player[] = [];
  private settings: GameSettings;
  private rounds: GameRound[];
  private host: UserID;

  /**
   *
   */
  constructor(hostId: UserID, settings: GameSettings) {
    this.gameId = crypto.randomUUID();
    this.host = hostId;
    const hostPlayer = new Player(hostId, "Host");
    this.players.push(hostPlayer);
    this.settings = settings;
    const { totalRounds } = this.settings;
    this.rounds = this.createRounds(totalRounds);
  }

  createRounds = (totalRounds: number): GameRound[] => {
    let array: GameRound[] = [];

    return array;
  };
}

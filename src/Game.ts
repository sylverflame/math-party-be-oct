import { ALLOW_NEGATIVE_ANSWERS, DIFFICULTY_SETTINGS, MAX_SCORE } from "./config";
import { Player } from "./Player";
import { DifficultyLevel, GameSettings, RoomCode } from "./Schemas";
import { GameRound, GameStatus, Operator, operators, UserID } from "./types";
export class Game {
  // private gameId: string;
  private roomCode: RoomCode;
  private status: GameStatus;
  private settings: GameSettings;
  private isMultiplayer: boolean = false;
  private isPrivateGame: boolean = true;
  private host: UserID;
  private players: Player[] = [];
  private rounds: GameRound[] = [];
  private playersFinished: UserID[] = [];
  public maxScorePerRound: number;
  public timePerRound: number;
  /**
   *
   */
  constructor(hostId: UserID, roomCode: RoomCode, settings: GameSettings) {
    // this.gameId = crypto.randomUUID();
    this.roomCode = roomCode;
    this.settings = settings;
    this.host = hostId;
    const { isMultiplayer, isPrivateGame, totalRounds, timePerRound } = this.settings;
    this.isMultiplayer = isMultiplayer;
    this.isPrivateGame = isPrivateGame;
    this.status = GameStatus.INITIALIZING_GAME;
    this.initializeGame(hostId, settings);
    this.maxScorePerRound = MAX_SCORE / totalRounds;
    this.timePerRound = timePerRound;
  }

  private initializeGame = (hostId: UserID, gameSettings: GameSettings) => {
    const { totalRounds, difficulty, isMultiplayer } = gameSettings;
    const hostPlayer = new Player(hostId, "Host");
    this.players.push(hostPlayer);
    this.rounds = this.createRounds(totalRounds, difficulty);
  };

  addPlayer = (userId: UserID) => {
    const player = new Player(userId, "Player");
    this.players.push(player);
  };

  removePlayer = (userId: UserID) => {
    this.players.forEach((player, index) => {
      if (player.getUserId() === userId) this.players.splice(index, 1);
    });
    this.playersFinished.forEach((player, index) => {
      if (player === userId) this.playersFinished.splice(index, 1);
    });
  };

  getPlayer = (userId: UserID): Player => {
    return this.players.filter((player) => {
      if (player.getUserId() === userId) return player;
    })[0];
  };

  getAllPlayerIDs = (): UserID[] => {
    return this.players.map((player) => {
      return player.getUserId();
    });
  };

  getState = () => {
    return {
      roomCode: this.roomCode,
      host: this.host,
      players: this.players,
      status: this.status,
      timePerRound: this.timePerRound,
    };
  };

  setStatus = (status: GameStatus) => {
    this.status = status;
  };

  getStatus = (): GameStatus => {
    return this.status;
  };

  getRound = (roundNumber: number): GameRound | null => {
    if (roundNumber > this.rounds.length) {
      return null;
    }
    return this.rounds[roundNumber - 1];
  };

  playerFinished = (userId: UserID) => {
    this.playersFinished.push(userId);
  };

  getFinishedPlayers = (): UserID[] => {
    return this.playersFinished;
  };

  resetGame = () => {
    const { totalRounds, difficulty, isMultiplayer } = this.settings;
    this.players.forEach((player) => player.resetPlayer());
    this.rounds = this.createRounds(totalRounds, difficulty);
    this.setStatus(GameStatus.WAITING_TO_START);
    this.playersFinished = [];
  };

  private createRounds = (totalRounds: number, gameDifficulty: DifficultyLevel): GameRound[] => {
    let rounds: GameRound[] = [];
    for (let i = 0; i < totalRounds; i++) {
      const operator = this.getRandomOperator(operators);
      let isExpressionValid = false;
      let firstNumber = 0;
      let secondNumber = 0;
      while (!isExpressionValid) {
        const { first, second } = DIFFICULTY_SETTINGS[gameDifficulty].limits[operator];
        firstNumber = this.getRandomNumber(first.min, first.max);
        secondNumber = this.getRandomNumber(second.min, second.max);
        isExpressionValid = this.isValidExpression(firstNumber, secondNumber, operator, ALLOW_NEGATIVE_ANSWERS);
      }
      rounds.push({ roundNumber: i + 1, firstNumber, secondNumber, operator });
    }
    return rounds;
  };

  private getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  private getRandomOperator = (operators: readonly Operator[]): Operator => {
    const randomIndex = Math.floor(Math.random() * operators.length);
    return operators[randomIndex];
  };

  private isValidExpression = (firstNumber: number, secondNumber: number, operator: Operator, allowNegativeNumbers: boolean): boolean => {
    if (operator === "Divide" && secondNumber === 0) return false;
    if (operator === "Divide" && firstNumber % secondNumber !== 0) return false;
    if (!ALLOW_NEGATIVE_ANSWERS && firstNumber < secondNumber) return false;
    return true;
  };
}

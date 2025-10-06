import { ALLOW_NEGATIVE_ANSWERS, DIFFICULTY_SETTINGS } from "./config";
import { Player } from "./Player";
import { DifficultyLevel, GameRound, GameSettings, Operator, operators, UserID } from "./types";
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
    const { totalRounds, difficulty } = this.settings;
    this.rounds = this.createRounds(totalRounds, difficulty);
  }

  private createRounds = (totalRounds: number, gameDifficulty: DifficultyLevel): GameRound[] => {
    let rounds: GameRound[] = [];
    for (let i = 0; i < totalRounds; i++) {
      const operator = this.getRandomOperator();
      let isExpressionValid = false;
      let firstNumber = 0;
      let secondNumber = 0;
      while (!isExpressionValid) {
        const { first, second } = DIFFICULTY_SETTINGS[gameDifficulty].limits[operator];
        firstNumber = this.getRandomNumber(first.min, first.max);
        secondNumber = this.getRandomNumber(second.min, second.max);
        isExpressionValid = this.isValidExpression(firstNumber, secondNumber, operator);
      }
      rounds.push({ firstNumber, secondNumber, operator });
    }
    return rounds;
  };

  private getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  private getRandomOperator = (): Operator => {
    const randomIndex = Math.floor(Math.random() * operators.length);
    return operators[randomIndex];
  };

  private isValidExpression = (firstNumber: number, secondNumber: number, operator: Operator): boolean => {
    if (operator === "Divide" && secondNumber === 0) return false;
    if (operator === "Divide" && firstNumber % secondNumber !== 0) return false;
    if (!ALLOW_NEGATIVE_ANSWERS && firstNumber < secondNumber) return false;
    return true;
  };
}

import { PlayerRole, PlayerScore, UserID } from "./types";

export class Player {
  private userId: UserID;
  private role: PlayerRole;
  private scores: PlayerScore[];
  private totalScore: number;
  private currentRound: number = 1;

  /**
   *
   */
  constructor(userId: UserID, role: PlayerRole) {
    this.userId = userId;
    this.role = role;
    this.scores = [];
    this.totalScore = 0;
  }

  private updateScore = (round: number, score: number) => {
    this.scores.push({ round, score });
    this.currentRound += 1;
    this.totalScore += score;
  };

  getCurrentRound = (): number => {
    return this.currentRound;
  }

  getUserId = () => {
    return this.userId
  }
}

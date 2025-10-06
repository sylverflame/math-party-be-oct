import { PlayerRole, PlayerScore, UserID } from "./types";

export class Player {
  private userId: UserID;
  private role: PlayerRole;
  private scores: PlayerScore[];
  private totalScore: number;

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
    this.totalScore += score;
  };
}

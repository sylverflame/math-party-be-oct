import { MAX_SCORE, WRONG_ANSWER_PENALTY } from "./config";
import { PlayerRole, PlayerScore, UserID } from "./types";

export class Player {
  private userId: UserID;
  private role: PlayerRole;
  private scores: PlayerScore[];
  private totalScore: number;
  private currentRound: number;
  private penalties: number;

  /**
   *
   */
  constructor(userId: UserID, role: PlayerRole) {
    this.userId = userId;
    this.role = role;
    this.scores = [];
    this.totalScore = MAX_SCORE;
    this.currentRound = 1;
    this.penalties = 0;
  }

  updateScore = (round: number, score: number) => {
    this.scores.push({ round, score });
    this.currentRound += 1;
    this.totalScore -= score;
  };

  getCurrentRound = (): number => {
    return this.currentRound;
  };

  getUserId = () => {
    return this.userId;
  };

  resetPlayer = () => {
    this.scores = [];
    this.totalScore = 0;
    this.totalScore = MAX_SCORE;
    this.penalties = 0;
    this.currentRound = 1;
  };

  addPenalty = () => {
    this.penalties += 1;
    this.totalScore -= WRONG_ANSWER_PENALTY * this.penalties
  };
}

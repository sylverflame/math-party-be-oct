import { NewDBScore } from "../db/schema";
import { Player } from "../Player";
import { ScoresRepository } from "../repository/ScoresRepository";

export class ScoresService {
  private scoresRepo: ScoresRepository;

  constructor(scoresRepo: ScoresRepository) {
    this.scoresRepo = scoresRepo;
  }

  insertScores = async (players: Player[], gameCode: string) => {
    const parsedScores = players
      .filter((player) => player.getScoresForDB().total_score > 0) // Insert only scores which are higher than 0
      .map((player) => {
        const parsed: NewDBScore = {
          ...player.getScoresForDB(),
          game_code_id: gameCode,
        };
        return parsed;
      });
    await this.scoresRepo.insertScores(parsedScores);
  };
}

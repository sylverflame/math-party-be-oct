import { EventEmitter } from "events";
import { MAX_PLAYERS_PER_ROOM, MULTIPLAYER_ROOMCODE_LENGTH } from "./config";
import { Game } from "./Game";
import { GameSettings, RoomCode } from "./Schemas";
import { GameManagerEvents, GameStatus, SocketManagerEvents, UserID } from "./types";
import * as scoresService from "./services/scores.service";

export class GameManager {
  private games = new Map<RoomCode, Game>();
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this.addEventListeners();
  }

  private onCreateGame = (userId: UserID, settings: GameSettings) => {
    const roomCode = this.generateRoomCode(MULTIPLAYER_ROOMCODE_LENGTH);
    const game = new Game(userId!, roomCode, settings);
    this.addGame(roomCode, game);
    game.setStatus(GameStatus.WAITING_TO_START);
    const state = game.getState();
    this.eventEmitter.emit(GameManagerEvents.GAME_CREATED, roomCode, userId, state);
  };

  private onJoinRoom = (userId: UserID, roomCode: RoomCode) => {
    const game = this.getGame(roomCode);
    if (game.getAllPlayerIDs().length === MAX_PLAYERS_PER_ROOM) {
      throw new Error("Room is full");
    }
    // Check if user is already present in the game
    if (game.getAllPlayerIDs().includes(userId)) {
      throw new Error("User already present in the game");
    }
    // Add player to game
    game.addPlayer(userId);

    // If game is already in progress
    if (game.getStatus() === GameStatus.GAME_IN_PROGRESS) {
      game.playerFinished(userId);
      this.eventEmitter.emit(GameManagerEvents.PLAYER_GAME_FINISHED, userId);
    }
    const state = game.getState();
    this.eventEmitter.emit(GameManagerEvents.PLAYER_JOINED, userId, roomCode, game.getAllPlayerIDs(), state);
  };

  private onPlayerDisconnectOrLeave = (userId: UserID, roomCode: RoomCode) => {
    const game = this.getGame(roomCode);
    game.removePlayer(userId);
    this.eventEmitter.emit(GameManagerEvents.PLAYER_LEFT, userId, game.getAllPlayerIDs());

    // To handle case when some players have already finished and other players leave in the middle
    if (this.isGameOver(game)) {
      game.setStatus(GameStatus.GAME_OVER);
      this.eventEmitter.emit(GameManagerEvents.GAME_OVER, game.getAllPlayerIDs());
    }
    this.broadcastGameState(roomCode);
    // Delete room if all players leave the room
    if (game.getAllPlayerIDs().length === 0) {
      this.games.delete(roomCode);
    }
  };

  private onStartGame = (userId: UserID, roomCode: RoomCode) => {
    const game = this.getGame(roomCode);
    if (game.getStatus() === GameStatus.GAME_IN_PROGRESS) {
      throw new Error("Game already started");
    }
    game.setStatus(GameStatus.GAME_IN_PROGRESS);
    const round = game.getRound(1);
    const state = game.getState();
    this.eventEmitter.emit(GameManagerEvents.GAME_STARTED, game.getAllPlayerIDs(), round, state);
  };

  private isGameOver = (game: Game): boolean => {
    const playersFinished = game.getAllPlayerIDs().filter((player) => game.getFinishedPlayers().includes(player));
    if (playersFinished.length === game.getAllPlayerIDs().length) {
      return true;
    }
    return false;
  };

  private interpolateY = (maxScorePerRound: number, timePerRound_ms: number, elapsedTime_ms: number): number => {
    if (elapsedTime_ms > timePerRound_ms) return 0;
    return Math.round(maxScorePerRound + ((elapsedTime_ms - 0) / (timePerRound_ms - 0)) * (0 - maxScorePerRound));
  };

  private getScore = (game: Game, elapsedTime: number): number => {
    const timePerRound = game.timePerRound * 1000;
    const maxScorePerRound = game.maxScorePerRound;
    return this.interpolateY(maxScorePerRound, timePerRound, elapsedTime);
  };

  private onSolutionSubmit = async (userId: UserID, roomCode: RoomCode, roundNumber: number, elapsedTime: number) => {
    const game = this.getGame(roomCode);
    const player = game.getPlayer(userId);

    // Calculate the score for the round
    let score = 0;
    if (elapsedTime == 0 || elapsedTime) {
      score = this.getScore(game, elapsedTime);
    }
    if (!elapsedTime) {
      elapsedTime = game.timePerRound * 1000;
    }
    player.updateScore(roundNumber, elapsedTime, score);

    // If score is 0 - player did not submit an answer - Hence add a penalty
    if (score === 0) {
      player.addPenalty();
    }

    // Get next round to send across to client
    const round = game.getRound(roundNumber + 1);

    // If round is not fetched - Player finished the game
    if (!round) {
      game.playerFinished(userId);
      this.eventEmitter.emit(GameManagerEvents.PLAYER_GAME_FINISHED, userId);
      // Check if all players finshed the game
      if (this.isGameOver(game)) {
        game.setStatus(GameStatus.GAME_OVER);
        game.freezeResults();
        this.eventEmitter.emit(GameManagerEvents.GAME_OVER, game.getAllPlayerIDs());
        const { players: playerScores } = game.getState();
        const gameCode = game.getGameCode();
        try {
          await scoresService.insertScore(playerScores, gameCode);
        } catch (error) {
          this.eventEmitter.emit(GameManagerEvents.ERROR, (error as any).message, game.getAllPlayerIDs());
        }
      }
    } else {
      // 100ms delay added to fix an issue in client, where countdown timer does not unmount after answer is submitted. Since next round is immediately recieved.
      let id = setTimeout(() => {
        this.eventEmitter.emit(GameManagerEvents.NEXT_ROUND, userId, round);
        clearInterval(id);
      }, 100);
    }
    this.broadcastGameState(roomCode);
  };

  private onSendChatMessage = (userId: UserID, roomCode: RoomCode, message: string) => {
    const game = this.getGame(roomCode);
    this.eventEmitter.emit(GameManagerEvents.BROADCAST_MESSAGE, userId, game.getAllPlayerIDs(), message);
  };

  private onRestartGame = (userId: UserID, roomCode: RoomCode) => {
    const game = this.getGame(roomCode);
    game.resetGame();
    this.eventEmitter.emit(GameManagerEvents.GAME_RESTARTED, game.getAllPlayerIDs());
    this.broadcastGameState(roomCode);
  };

  broadcastGameState = (roomCode: RoomCode) => {
    const game = this.getGame(roomCode);
    const state = game.getState();
    this.eventEmitter.emit(GameManagerEvents.STATE_UPDATED, game.getAllPlayerIDs(), state);
  };

  onPenalty = (userId: UserID, roomCode: RoomCode) => {
    const game = this.getGame(roomCode);
    const player = game?.getPlayer(userId);
    player?.addPenalty();
    this.broadcastGameState(roomCode);
  };

  onUpdateSettings = (roomCode: RoomCode, settings: GameSettings) => {
    const game = this.getGame(roomCode);
    game.setSettings(settings);
    this.eventEmitter.emit(GameManagerEvents.GAME_SETTINGS_UPDATED, game.getAllPlayerIDs());
    this.broadcastGameState(roomCode);
  };

  private addEventListeners = () => {
    this.eventEmitter.on(SocketManagerEvents.CREATE_GAME, this.onCreateGame);
    this.eventEmitter.on(SocketManagerEvents.JOIN_ROOM, this.onJoinRoom);
    this.eventEmitter.on(SocketManagerEvents.LEAVE_ROOM, this.onPlayerDisconnectOrLeave);
    this.eventEmitter.on(SocketManagerEvents.PLAYER_DISCONNECTED, this.onPlayerDisconnectOrLeave);
    this.eventEmitter.on(SocketManagerEvents.START_GAME, this.onStartGame);
    this.eventEmitter.on(SocketManagerEvents.SOLUTION_SUBMIT, this.onSolutionSubmit);
    this.eventEmitter.on(SocketManagerEvents.SEND_CHAT_MESSAGE, this.onSendChatMessage);
    this.eventEmitter.on(SocketManagerEvents.RESTART_GAME, this.onRestartGame);
    this.eventEmitter.on(SocketManagerEvents.PENALTY, this.onPenalty);
    this.eventEmitter.on(SocketManagerEvents.NO_ANSWER, this.onSolutionSubmit); // No elapsedtime sent across from the socket manager
    this.eventEmitter.on(SocketManagerEvents.UPDATE_GAME_SETTINGS, this.onUpdateSettings); // No elapsedtime sent across from the socket manager
  };

  private addGame = (roomCode: RoomCode, game: Game) => {
    this.games.set(roomCode, game);
  };

  getRoomCodes = (): RoomCode[] => {
    return [...this.games.keys()];
  };

  getGame = (roomCode: RoomCode): Game => {
    const game = this.games.get(roomCode) || null;
    if (!game) {
      throw new Error("Game does not exist");
    }
    return game;
  };

  private generateRoomCode = (codeLength: number): RoomCode => {
    const allowedCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let roomCode = "";
    for (let i = 0; i < codeLength; i++) {
      let randomChar = allowedCharacters[Math.floor(Math.random() * allowedCharacters.length)];
      roomCode += randomChar;
    }
    return roomCode;
  };
}

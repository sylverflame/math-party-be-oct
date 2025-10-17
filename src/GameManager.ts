import { EventEmitter } from "events";
import { MULTIPLAYER_ROOMCODE_LENGTH } from "./config";
import { Game } from "./Game";
import { GameSettings, RoomCode } from "./Schemas";
import { GameManagerEvents, GameStatus, SocketManagerEvents, UserID } from "./types";

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
    if (!game) {
      throw new Error("Game does not exist");
    }
    // Check if user is already present in the game
    if (game.getPlayers().includes(userId)) {
      throw new Error("User already present in the game");
    }
    // Add player to game
    game.addPlayer(userId);
    const state = game.getState();
    this.eventEmitter.emit(GameManagerEvents.PLAYER_JOINED, userId, roomCode, game.getPlayers(), state);
  };

  private onPlayerDisconnectOrLeave = (userId: UserID, roomCode: RoomCode) => {
    const game = this.getGame(roomCode);
    if (!game) {
      throw new Error("Game does not exist");
    }
    game.removePlayer(userId);
    const state = game.getState();
    this.eventEmitter.emit(GameManagerEvents.PLAYER_LEFT, userId, game.getPlayers(), state);
    if (game.getPlayers().length === 0) {
      this.games.delete(roomCode);
    }
  };

  private onStartGame = (userId: UserID, roomCode: RoomCode) => {
    const game = this.getGame(roomCode);
    if (!game) {
      throw new Error("Game does not exist");
    }
    if (game.getStatus() === GameStatus.GAME_IN_PROGRESS) {
      throw new Error("Game already started");
    }
    game.setStatus(GameStatus.GAME_IN_PROGRESS);
    const round = game.getRound(1);
    const state = game.getState();
    this.eventEmitter.emit(GameManagerEvents.GAME_STARTED, game.getPlayers(), round, state);
  };

  private onSolutionSubmit = (userId: UserID, roomCode: RoomCode, roundNumber: number, score: number) => {
    const game = this.getGame(roomCode);
    if (!game) {
      throw new Error("Game does not exist");
    }
    const player = game.getPlayer(userId);
    player.updateScore(roundNumber, score);
    const round = game.getRound(roundNumber + 1);
    const state = game.getState();
    this.eventEmitter.emit(GameManagerEvents.NEXT_ROUND, userId, game.getPlayers(), round, state);
  };

  private onSendChatMessage = (userId: UserID, roomCode: RoomCode, message: string) => {
    const game = this.getGame(roomCode);
    if (!game) {
      throw new Error("Game does not exist");
    }
    this.eventEmitter.emit(GameManagerEvents.BROADCAST_MESSAGE, userId, game.getPlayers(), message);
  };

  private addEventListeners = () => {
    this.eventEmitter.on(SocketManagerEvents.CREATE_GAME, this.onCreateGame);
    this.eventEmitter.on(SocketManagerEvents.JOIN_ROOM, this.onJoinRoom);
    this.eventEmitter.on(SocketManagerEvents.LEAVE_ROOM, this.onPlayerDisconnectOrLeave);
    this.eventEmitter.on(SocketManagerEvents.PLAYER_DISCONNECTED, this.onPlayerDisconnectOrLeave);
    this.eventEmitter.on(SocketManagerEvents.START_GAME, this.onStartGame);
    this.eventEmitter.on(SocketManagerEvents.SOLUTION_SUBMIT, this.onSolutionSubmit);
    this.eventEmitter.on(SocketManagerEvents.SEND_CHAT_MESSAGE, this.onSendChatMessage);
  };

  private addGame = (roomCode: RoomCode, game: Game) => {
    this.games.set(roomCode, game);
  };

  getRoomCodes = (): RoomCode[] => {
    return [...this.games.keys()];
  };

  getGame = (roomCode: RoomCode): Game | null => {
    return this.games.get(roomCode) || null;
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

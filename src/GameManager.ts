import { EventEmitter } from "events";
import { MULTIPLAYER_ROOMCODE_LENGTH } from "./config";
import { Game } from "./Game";
import { GameSettings, RoomCode } from "./Schemas";
import { GameManagerEvents, SocketManagerEvents, UserID } from "./types";

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
    this.eventEmitter.emit(GameManagerEvents.GAME_CREATED, roomCode, userId);
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
    this.eventEmitter.emit(GameManagerEvents.PLAYER_JOINED, userId, roomCode, game.getPlayers());
  };

  private onPlayerDisconnectOrLeave = (userId: UserID, roomCode: RoomCode) => {
    const game = this.getGame(roomCode);
    if (!game) {
      throw new Error("Game does not exist");
    }
    game.removePlayer(userId);
    this.eventEmitter.emit(GameManagerEvents.PLAYER_LEFT, userId, game.getPlayers());
  };

  private addEventListeners = () => {
    this.eventEmitter.on(SocketManagerEvents.CREATE_GAME, this.onCreateGame);
    this.eventEmitter.on(SocketManagerEvents.JOIN_ROOM, this.onJoinRoom);
    this.eventEmitter.on(SocketManagerEvents.LEAVE_ROOM, this.onPlayerDisconnectOrLeave);
    this.eventEmitter.on(SocketManagerEvents.PLAYER_DISCONNECTED, this.onPlayerDisconnectOrLeave);
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

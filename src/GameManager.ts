import { EventEmitter } from "events";
import { MULTIPLAYER_ROOMCODE_LENGTH } from "./config";
import { Game } from "./Game";
import { GameSettings, RoomCode } from "./Schemas";
import { GameManagerEvents, SocketManagerEvents, UserID } from "./types";

export class GameManager {
  private games = new Map<RoomCode, Game>();
  private eventEmitter: EventEmitter;
  /**
   *
   */
  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this.addEventListeners();
  }

  private addEventListeners = () => {
    this.eventEmitter.on(SocketManagerEvents.CREATE_GAME, (userId: UserID, settings: GameSettings) => {
      const roomCode = this.generateRoomCode(MULTIPLAYER_ROOMCODE_LENGTH);
      const game = new Game(userId!, roomCode, settings);
      this.addGame(roomCode, game);
      this.eventEmitter.emit(GameManagerEvents.GAME_CREATED, roomCode, userId);
    });
    this.eventEmitter.on(SocketManagerEvents.JOIN_ROOM, (userId: UserID, roomCode: RoomCode) => {
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
      this.eventEmitter.emit(GameManagerEvents.PLAYER_JOINED, userId, game.getPlayers());
    });
    this.eventEmitter.on(SocketManagerEvents.LEAVE_ROOM, (userId: UserID, roomCode: RoomCode) => {
      const game = this.getGame(roomCode);
      if (!game) {
        throw new Error("Game does not exist");
      }
      game.removePlayer(userId);
      this.eventEmitter.emit(GameManagerEvents.PLAYER_LEFT, userId, game.getPlayers());
    });
  };
  //   handleMessage = (socket: AuthedSocket, message: WsMessage) => {
  //     if (message.type === "CREATE_GAME") {
  //       const { userId } = socket;
  //       const parsed = CreateGameMessageSchema.parse(message);
  //       const { settings } = parsed.payload;
  //       const roomCode = this.generateRoomCode(MULTIPLAYER_ROOMCODE_LENGTH);

  //       // Create new game
  //       const game = new Game(userId!, roomCode, settings);

  //       // Add roomcode to socket connection
  //       socket.isHostingGame = roomCode;
  //       this.addGame(roomCode, game);
  //       sendMessage("Success", { message: `Game Created - Room Code - ${roomCode}` }, socket);
  //     }

  //     if (message.type === "JOIN_ROOM" || message.type === "LEAVE_ROOM") {
  //       const { userId } = socket;
  //       const parsed = JoinLeaveMessageSchema.parse(message);
  //       const { roomCode } = parsed.payload;
  //       const game = this.getGame(roomCode);
  //       if (!game) {
  //         throw new Error("Game does not exist");
  //       }
  //       if (!userId) {
  //         throw new Error("Invalid user");
  //       }
  //       if (message.type === "JOIN_ROOM") {
  //         if (game.getPlayers().includes(userId)) {
  //           throw new Error("User is already in the game");
  //         }
  //         game.addPlayer(userId);
  //         socket.isHostingGame = roomCode;
  //         broadcastMessageToRoom("Notification", { message: `Player joined - ${socket.userId}` }, game.getPlayers());
  //       } else if (message.type === "LEAVE_ROOM") {
  //         socket.isHostingGame = undefined;
  //         game.removePlayer(userId);
  //         broadcastMessageToRoom("Notification", { message: `Player left - ${socket.userId}` }, game.getPlayers());
  //       }
  //     }
  //   };

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

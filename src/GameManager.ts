import { MULTIPLAYER_ROOMCODE_LENGTH } from "./config";
import { Game } from "./Game";
import { CreateGameMessageSchema, JoinGameMessageSchema, RoomCode, WsMessage } from "./Schemas";
import { sendMessage } from "./utils";
import { AuthedSocket } from "./WebSocketManager";

export class GameManager {
  private games = new Map<RoomCode, Game>();
  /**
   *
   */
  constructor() {}
  handleMessage = (socket: AuthedSocket, message: WsMessage) => {
    if (message.type === "CREATE_GAME") {
      const { userId } = socket;
      const parsed = CreateGameMessageSchema.parse(message);
      const { settings } = parsed.payload;
      const roomCode = this.generateRoomCode(MULTIPLAYER_ROOMCODE_LENGTH);

      // Create new game
      const game = new Game(userId!, roomCode, settings);

      // Add roomcode to socket connection
      socket.isHostingGame = roomCode;
      this.addGame(roomCode, game);
      sendMessage("Success", { message: "Game Created" }, socket);
    }

    if (message.type === "JOIN_ROOM") {
      const { userId } = socket;
      const parsed = JoinGameMessageSchema.parse(message);
      const { roomCode } = parsed.payload;
      const game = this.games.get(roomCode);
      if (!game) {
        throw new Error("Game does not exist");
      }

      if (!userId) {
        throw new Error("Invalid user");
      }
      if (game.getPlayers().includes(userId)) {
        throw new Error("User is already in the game");
      }
      game.joinGame(userId);
    }
  };

  private addGame = (roomCode: RoomCode, game: Game) => {
    this.games.set(roomCode, game);
  };

  getRoomCodes = (): RoomCode[] => {
    return [...this.games.keys()];
  };

  getGameState = (roomCode: RoomCode): Game | null => {
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

import { Injectable } from '@nestjs/common';
import { CreatePongDto } from './dto/create-pong.dto';
import { UpdatePongDto } from './dto/update-pong.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { map } from 'rxjs';


const widthGameboard: number = 1000;
const heightGameboard: number = 600;
const widthGameboardMid: number = widthGameboard / 2;
const heightGameboardMid: number = heightGameboard / 2;
const speedMultiplier: number = 8;
const paddleStep: number = 25;
const paddleHeight: number = 100;
const paddleMid: number = paddleHeight / 2;
const paddleGap: number = 50;
const paddleWidth: number = 20;
const squareSize: number = 20;
const midSquare: number = squareSize / 2;


@Injectable()
export class PongService {
  private queueClassic: number[] = [];
  private queueCustom: number[] = [];
  gameStates: [{ id1: number, id2: number, socketLeft: number, socketRight: number, x: number, y: number, dx: number, dy: number, paddleLeft: number, paddleRight: number, leftScore: number, rightScore: number, prevLpc: boolean, prevRpc: boolean }] = [{ id1: 1, id2: 0, socketLeft: 0, socketRight: 0, x: 0, y: 0, dx: 0, dy: 0, paddleLeft: 0, paddleRight: 0, leftScore: 0, rightScore: 0, prevLpc: false, prevRpc: false }];
  map1 = new Map();

  constructor(private prismaService: PrismaService, private authService: AuthService) {
    setInterval(() => {
      this.checkQueueClassic();
    }, 1000);
    setInterval(() => {
      this.checkQueueCustom();
    }, 1000);
  }

  disconnectSocket(socketId: number) {
    try {
      const index = this.map1.get(socketId);
      if (index !== undefined) {
        if (this.gameStates[index].socketLeft === socketId) {
          this.gameStates[index].socketLeft = 0;
          // this.gameStates[index].id1 = 0;
        }
        else {
          this.gameStates[index].socketRight = 0;
          // this.gameStates[index].id2 = 0;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  moveUp(socketId: number) {
    try {
      const index = this.map1.get(socketId);
      if (index !== undefined) {
        if (this.gameStates[index].socketLeft === socketId) {
          if (this.gameStates[index].paddleLeft - paddleStep < 0)
            this.gameStates[index].paddleLeft = 0;
          else
            this.gameStates[index].paddleLeft -= paddleStep;
          // this.gameStates[index].paddleLeft -= paddleStep;
        }
        else {
          if (this.gameStates[index].paddleRight - paddleStep < 0)
            this.gameStates[index].paddleRight = 0;
          else
            this.gameStates[index].paddleRight -= paddleStep;
          // this.gameStates[index].paddleLeft -= paddleStep;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  moveDown(socketId: number) {
    try {
      const index = this.map1.get(socketId);
      if (index !== undefined) {
        if (this.gameStates[index].socketLeft === socketId) {
          if (this.gameStates[index].paddleLeft + paddleHeight + paddleStep > heightGameboard)
            this.gameStates[index].paddleLeft = heightGameboard - paddleHeight;
          else
            this.gameStates[index].paddleLeft += paddleStep;
        }
        else {
          if (this.gameStates[index].paddleRight + paddleHeight + paddleStep > heightGameboard)
            this.gameStates[index].paddleRight = heightGameboard - paddleHeight;
          else
            this.gameStates[index].paddleRight += paddleStep;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  checkPaddleCollision(ballX: number, ballY: number, paddleX: number, paddleY: number) {
    const ballLeft = ballX;
    const ballRight = ballX + squareSize;
    const ballTop = ballY;
    const ballBottom = ballY + squareSize;

    const paddleLeft = paddleX;
    const paddleRight = paddleX + paddleWidth;
    const paddleTop = paddleY;
    const paddleBottom = paddleY + paddleHeight;

    // Check if ball and paddle are colliding
    if (ballRight > paddleLeft && ballLeft < paddleRight && ballBottom > paddleTop && ballTop < paddleBottom) {
      return true;
    }
    return false;
  }

  gameLogicClassic(index: number) {
    let gameState = this.gameStates[index];

    const newX = gameState.x + gameState.dx * speedMultiplier;
    const newY = gameState.y + gameState.dy * speedMultiplier;
    const lpc = this.checkPaddleCollision(newX, newY, paddleGap, gameState.paddleLeft);
    const rpc = this.checkPaddleCollision(newX, newY, widthGameboard - paddleGap - paddleWidth, gameState.paddleRight);
    if (lpc == true && gameState.prevLpc == false) {
      const dirX = -gameState.dx;
      const dirY = (gameState.y + squareSize / 2 - gameState.paddleLeft - paddleMid) / paddleMid;
      const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
      gameState.dx = dirX / magnitude;
      gameState.dy = dirY / magnitude;
    }
    else if (rpc == true && gameState.prevRpc == false) {
      const dirX = -gameState.dx;
      const dirY = (gameState.y + squareSize / 2 - gameState.paddleRight - paddleMid) / paddleMid;
      const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
      gameState.dx = dirX / magnitude;
      gameState.dy = dirY / magnitude;
    }
    else if (newY < 0 || newY + squareSize > heightGameboard) {
      gameState.dy = -gameState.dy;
    }
    else if (newX < 0) {
      const dirX = Math.random() * 2 - 1;
      const dirY = Math.random() * 2 - 1;
      const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
      gameState.rightScore++;
      gameState.x = widthGameboardMid - midSquare;
      gameState.y = heightGameboardMid - midSquare;
      gameState.dx = dirX / magnitude;
      gameState.dy = dirY / magnitude;
    }
    else if (newX + squareSize > widthGameboard) {
      const dirX = Math.random() * 2 - 1;
      const dirY = Math.random() * 2 - 1;
      const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
      gameState.leftScore++;
      gameState.x = widthGameboardMid - midSquare;
      gameState.y = heightGameboardMid - midSquare;
      gameState.dx = dirX / magnitude;
      gameState.dy = dirY / magnitude;
    }
    else {
      gameState.x = newX;
      gameState.y = newY;
    }
    gameState.prevLpc = lpc;
    gameState.prevRpc = rpc;
  }

  getGameState(socketId: number): { success: boolean, gameState?: { x: number, y: number, dx: number, dy: number, paddleLeft: number, paddleRight: number, leftScore: number, rightScore: number } } {
    try {
      const index = this.map1.get(socketId);
      if (this.gameStates[index].socketLeft === 0 || this.gameStates[index].socketRight === 0) {
        return { success: false };
      }
      if (index !== undefined) {
        this.gameLogicClassic(index);
        return { success: true, gameState: { x: this.gameStates[index].x, y: this.gameStates[index].y, dx: this.gameStates[index].dx, dy: this.gameStates[index].dy, paddleLeft: this.gameStates[index].paddleLeft, paddleRight: this.gameStates[index].paddleRight, leftScore: this.gameStates[index].leftScore, rightScore: this.gameStates[index].rightScore } };
      }
    } catch (e) {
      console.log(e);
    }
    return { success: false };
  }

  gameStartClassic(index: number) {
    let gameState = this.gameStates[index];

    gameState.x = widthGameboardMid - (squareSize / 2);
    gameState.y = heightGameboardMid - (squareSize / 2);
    gameState.dx = Math.random() < 0.5 ? -1 : 1;
    gameState.dy = Math.random() * 2 - 1;
    let magnitude = Math.sqrt(gameState.dx ** 2) + Math.sqrt(gameState.dy ** 2);
    gameState.dx /= magnitude;
    gameState.dy /= magnitude;
    gameState.paddleLeft = heightGameboardMid - paddleMid;
    gameState.paddleRight = heightGameboardMid - paddleMid;
  }

  async changeSocketClassic(socketId: number, login: string): Promise<{ success: boolean }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { login: login } });
      const index = this.gameStates.findIndex((gameState) => gameState.id1 === user.id || gameState.id2 === user.id);
      if (index !== -1) {
        if (this.gameStates[index].id1 === user.id && this.gameStates[index].socketLeft === 0) {
          this.gameStates[index].socketLeft = socketId;
          this.map1.set(socketId, index);
          if (this.gameStates[index].socketRight !== 0 && this.gameStates[index].socketLeft !== 0)
            this.gameStartClassic(index);
        }
        else {
          this.gameStates[index].socketRight = socketId;
          this.map1.set(socketId, index);
          if (this.gameStates[index].socketRight !== 0 && this.gameStates[index].socketLeft !== 0)
            this.gameStartClassic(index);
        }
        console.log('gameStates in classic', this.gameStates);
        return { success: true };
      }
    } catch (e) {
      console.log(e);
    }
    return { success: false };
  }

  async queueStatusCustomPong(login: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string, queueStatus?: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { login: login } });
      const ret = await this.authService.checkToken(user, refreshToken, accessToken);
      if (ret.success) {
        if (user.status === "playing custom")
          return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken, queueStatus: "found" };
        else
          return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken, queueStatus: "waiting" };
      }
    } catch (e) {
      console.log(e);
    }
    return { success: false };
  }

  async checkQueueCustom(): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
    // console.log('custom', this.queueCustom)
    try {
      if (this.queueCustom.length >= 2) {
        const user1 = await this.prismaService.user.findUniqueOrThrow({ where: { id: this.queueCustom[0] } });
        const user2 = await this.prismaService.user.findUniqueOrThrow({ where: { id: this.queueCustom[1] } });
        this.gameStates.push({ id1: 0, id2: 0, socketLeft: 0, socketRight: 0, x: 0, y: 0, dx: 0, dy: 0, paddleLeft: 0, paddleRight: 0, leftScore: 0, rightScore: 0, prevLpc: false, prevRpc: false });
        this.queueCustom.splice(0, 2);
        console.log('gameStates in custom', this.gameStates);
        await this.prismaService.user.update({ where: { id: user1.id }, data: { status: 'playing custom' } });
        await this.prismaService.user.update({ where: { id: user2.id }, data: { status: 'playing custom' } });
        return { success: true };
      }
    }
    catch (e) {
      console.log(e);
    }
    return { success: false };
  }

  async queueDownCustomPong(login: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { login: login } });
      const ret = await this.authService.checkToken(user, refreshToken, accessToken);
      if (ret.success) {
        const index = this.queueCustom.indexOf(user.id);
        if (index > -1) {
          this.queueCustom.splice(index, 1);
          return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
        }
      }
    } catch (e) {
      console.log(e);
    }
    return { success: false };
  }

  async queueUpCustomPong(login: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { login: login } });
      const ret = await this.authService.checkToken(user, refreshToken, accessToken);
      if (ret.success) {
        this.queueCustom.push(user.id);
        return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
      }
    } catch (e) {
      console.log(e);
    }
    return { success: false };
  }

  async queueStatusClassicPong(login: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string, queueStatus?: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { login: login } });
      const ret = await this.authService.checkToken(user, refreshToken, accessToken);
      if (ret.success) {
        if (user.status === "playing classic")
          return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken, queueStatus: "found" };
        else
          return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken, queueStatus: "waiting" };
      }
    } catch (e) {
      console.log(e);
    }
    return { success: false };
  }

  async checkQueueClassic(): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
    // console.log('classic', this.queueClassic)
    try {
      if (this.queueClassic.length >= 2) {
        const user1 = await this.prismaService.user.findUniqueOrThrow({ where: { id: this.queueClassic[0] } });
        const user2 = await this.prismaService.user.findUniqueOrThrow({ where: { id: this.queueClassic[1] } });
        this.gameStates.push({ id1: 0, id2: 0, socketLeft: 0, socketRight: 0, x: 0, y: 0, dx: 0, dy: 0, paddleLeft: 0, paddleRight: 0, leftScore: 0, rightScore: 0, prevLpc: false, prevRpc: false });
        this.queueClassic.splice(0, 2);
        console.log('gameStates in classic', this.gameStates);
        await this.prismaService.user.update({ where: { id: user1.id }, data: { status: 'playing classic' } });
        await this.prismaService.user.update({ where: { id: user2.id }, data: { status: 'playing classic' } });
        return { success: true };
      }
    }
    catch (e) {
      console.log(e);
    }
    return { success: false };
  }


  async queueDownClassicPong(login: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { login: login } });
      const ret = await this.authService.checkToken(user, refreshToken, accessToken);
      if (ret.success) {
        const index = this.queueClassic.indexOf(user.id);
        if (index > -1) {
          this.queueClassic.splice(index, 1);
          return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
        }
      }
    } catch (e) {
      console.log(e);
    }
    return { success: false };
  }

  async queueUpClassicPong(login: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { login: login } });
      const ret = await this.authService.checkToken(user, refreshToken, accessToken);
      if (ret.success) {
        this.queueClassic.push(user.id);
        return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
      }
    } catch (e) {
      console.log(e);
    }
    return { success: false };
  }

  create(createPongDto: CreatePongDto) {
    return 'This action adds a new pong';
  }

  findAll() {
    return `This action returns all pong`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pong`;
  }

  update(id: number, updatePongDto: UpdatePongDto) {
    return `This action updates a #${id} pong`;
  }

  remove(id: number) {
    return `This action removes a #${id} pong`;
  }
}

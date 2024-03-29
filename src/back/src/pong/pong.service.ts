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
const speedMultiplier: number = 10;
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
  gameStates: Array<any> = [];
  //[{ id1: number, id2: number, socketLeft: number, socketRight: number, x: number, y: number, dx: number, dy: number, paddleLeft: number, paddleRight: number, leftScore: number, rightScore: number, prevLpc: boolean, prevRpc: boolean, onOff: boolean}]
  map1 = new Map();

  constructor(private prismaService: PrismaService, private authService: AuthService) {
    setInterval(() => {
      this.checkQueueClassic();
    }, 1000);
    setInterval(() => {
      this.checkQueueCustom();
    }, 1000);
  }


  async userIngame(username: string, refreshToken: string, accessToken: string) {
    const user = await this.prismaService.user.findUnique({ where: { username: username } });
    if (!user) {
      return ({ success: false, message: "User not found" });
    }
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == false) {
      return ({ success: false, message: "Invalid token" });
    }
    // check in gameStates if user.id is equals to id1 or id2
    for (let i = 0; i < this.gameStates.length; i++) {
      if (this.gameStates[i].id1 == user.id || this.gameStates[i].id2 == user.id) {
        return ({ success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken, inGame: true });
      }
    }
    return ({ success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken, inGame: false });
  }

  async createClassic(username: string, opponentUsername: string, usernameId: number, opponentUsernameId: number) {
    this.gameStates.push({ mode: "classic", id1: usernameId, id2: opponentUsernameId, socketLeft: 0, socketRight: 0, x: 0, y: 0, dx: 0, dy: 0, paddleLeft: 0, paddleRight: 0, leftScore: 0, rightScore: 0, prevLpc: false, prevRpc: false, onOff: false, started: false, speedMultiplier: 10, statsAttributed: false });

    await this.prismaService.user.update({ where: { id: usernameId }, data: { status: 'playing classic' } });
    await this.prismaService.user.update({ where: { id: opponentUsernameId }, data: { status: 'playing classic' } });
    return { success: true };
  }

  gameStatus(socketId: any, io: any) {
    try {
      const index = this.map1.get(socketId);
      if (index !== undefined) {
        if (this.gameStates[index]?.socketLeft === 0 || this.gameStates[index]?.socketRight === 0) {
          return 0;
        }
        if (this.gameStates[index]?.socketLeft !== 0 && this.gameStates[index]?.socketRight !== 0) {
          return 1;
        }
      }
    } catch (e) {
      console.log(e);
    }
    return 0;
  }

  async disconnectSocket(socketId: any, io: any) {
    const index = this.map1.get(socketId);
    if (index !== undefined) {
      if (this.gameStates[index]?.socketLeft === socketId) {
        this.gameStates[index].socketLeft = 0;
        io.to(this.gameStates[index].socketRight).emit('opponentDisconnected', { message: "Your opponent disconnected" });
        setTimeout(async () => {
          if (this.gameStates[index]) {
            if (this.gameStates[index]?.socketLeft === 0 && this.gameStates[index]?.socketRight === 0) {
              await this.prismaService.user.update({ where: { id: this.gameStates[index].id1 }, data: { status: "online" } });
              await this.prismaService.user.update({ where: { id: this.gameStates[index].id2 }, data: { status: "online" } });
              this.gameStates.splice(index, 1);
            }
          }
        }, 10800);
      }
      else {
        this.gameStates[index].socketRight = 0;
        io.to(this.gameStates[index].socketLeft).emit('opponentDisconnected', { message: "Your opponent disconnected" });
        setTimeout(async () => {
          if (this.gameStates[index]) {
            if (this.gameStates[index]?.socketRight === 0 && this.gameStates[index]?.socketLeft === 0) {
              await this.prismaService.user.update({ where: { id: this.gameStates[index].id1 }, data: { status: "online" } });
              await this.prismaService.user.update({ where: { id: this.gameStates[index].id2 }, data: { status: "online" } });
              this.gameStates.splice(index, 1);
            }
          }
        }, 10800);
      }
    }
    this.map1.delete(socketId);
  }

  moveUp(socketId: string, key: string) {
    try {
      const index = this.map1.get(socketId);
      if (index !== undefined) {
        if (this.gameStates[index].mode == "classic") {
          if (this.gameStates[index].socketLeft === socketId) {
            if (this.gameStates[index].paddleLeft - paddleStep < 0)
              this.gameStates[index].paddleLeft = 0;
            else
              this.gameStates[index].paddleLeft -= paddleStep;
          }
          else if (this.gameStates[index].socketRight === socketId) {
            if (this.gameStates[index].paddleRight - paddleStep < 0)
              this.gameStates[index].paddleRight = 0;
            else
              this.gameStates[index].paddleRight -= paddleStep;
          }
        }
        else if (this.gameStates[index].mode == "custom") {
          if (this.gameStates[index].socketLeft === socketId) {
            if (key == "Z") {
              if (this.gameStates[index].secondPaddleLeft - paddleStep < 0)
                this.gameStates[index].secondPaddleLeft = 0;
              else
                this.gameStates[index].secondPaddleLeft -= paddleStep;
            }
            else if (key == "up") {
              if (this.gameStates[index].paddleLeft - paddleStep < 0)
                this.gameStates[index].paddleLeft = 0;
              else
                this.gameStates[index].paddleLeft -= paddleStep;
            }
          }
          else if (this.gameStates[index].socketRight === socketId) {
            if (key == "Z") {
              if (this.gameStates[index].secondPaddleRight - paddleStep < 0)
                this.gameStates[index].secondPaddleRight = 0;
              else
                this.gameStates[index].secondPaddleRight -= paddleStep;
            }
            else if (key == "up") {
              if (this.gameStates[index].paddleRight - paddleStep < 0)
                this.gameStates[index].paddleRight = 0;
              else
                this.gameStates[index].paddleRight -= paddleStep;
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  moveDown(socketId: string, key: string) {
    try {
      const index = this.map1.get(socketId);
      if (index !== undefined) {
        if (this.gameStates[index].mode == "classic") {
          if (this.gameStates[index].socketLeft === socketId) {
            if (this.gameStates[index].paddleLeft + paddleHeight + paddleStep > heightGameboard)
              this.gameStates[index].paddleLeft = heightGameboard - paddleHeight;
            else
              this.gameStates[index].paddleLeft += paddleStep;
          }
          else if (this.gameStates[index].socketRight === socketId) {
            if (this.gameStates[index].paddleRight + paddleHeight + paddleStep > heightGameboard)
              this.gameStates[index].paddleRight = heightGameboard - paddleHeight;
            else
              this.gameStates[index].paddleRight += paddleStep;
          }
        } else if (this.gameStates[index].mode == "custom") {
          if (this.gameStates[index].socketLeft === socketId) {
            if (key == "S") {
              if (this.gameStates[index].secondPaddleLeft + paddleHeight + paddleStep > heightGameboard)
                this.gameStates[index].secondPaddleLeft = heightGameboard - paddleHeight;
              else
                this.gameStates[index].secondPaddleLeft += paddleStep;
            }
            else if (key == "down") {
              if (this.gameStates[index].paddleLeft + paddleHeight + paddleStep > heightGameboard)
                this.gameStates[index].paddleLeft = heightGameboard - paddleHeight;
              else
                this.gameStates[index].paddleLeft += paddleStep;
            }
          }
          else if (this.gameStates[index].socketRight === socketId) {
            if (key == "S") {
              if (this.gameStates[index].secondPaddleRight + paddleHeight + paddleStep > heightGameboard)
                this.gameStates[index].secondPaddleRight = heightGameboard - paddleHeight;
              else
                this.gameStates[index].secondPaddleRight += paddleStep;
            }
            else if (key == "down") {
              if (this.gameStates[index].paddleRight + paddleHeight + paddleStep > heightGameboard)
                this.gameStates[index].paddleRight = heightGameboard - paddleHeight;
              else
                this.gameStates[index].paddleRight += paddleStep;
            }
          }
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

  async gameLogicCustom(index: any, io: any) {
    let gameState = this.gameStates[index];

    if (gameState.socketLeft == 0 || gameState.socketRight == 0) {
      return;
    }

    if (gameState.leftScore == 11 || gameState.rightScore == 11) {
      if (gameState.statsAttributed == false) {
        gameState.statsAttributed = true;
        let historyWinnerString = "";
        let historyLoserString = "";
        if (gameState.leftScore == 11) {
          await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { wins: { increment: 1 }, xpBar: { increment: 100 } } });
          await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { losses: { increment: 1 }, xpBar: { increment: 50 } } });
          const user1 = await this.prismaService.user.findUnique({ where: { id: gameState.id1 } });
          const user2 = await this.prismaService.user.findUnique({ where: { id: gameState.id2 } });
          if (user1.xpBar >= user1.ladderLevel * 100) {
            await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { ladderLevel: { increment: 1 } } });
            await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { xpBar: { decrement: user1.ladderLevel * 100 } } });
          }
          if (user2.xpBar >= user2.ladderLevel * 100) {
            await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { ladderLevel: { increment: 1 } } });
            await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { xpBar: { decrement: user2.ladderLevel * 100 } } });
          }
          historyWinnerString = 'W:' + user1.username + ' L:' + user2.username + ' ' + gameState.leftScore + ' - ' + gameState.rightScore;
          historyLoserString = 'L:' + user1.username + ' W:' + user2.username + ' ' + gameState.leftScore + ' - ' + gameState.rightScore;
          await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { matchHistory: { push: historyWinnerString } } });
          await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { matchHistory: { push: historyLoserString } } });
        }
        else {
          await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { losses: { increment: 1 }, xpBar: { increment: 50 } } });
          await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { wins: { increment: 1 }, xpBar: { increment: 100 } } });
          const user1 = await this.prismaService.user.findUnique({ where: { id: gameState.id1 } });
          const user2 = await this.prismaService.user.findUnique({ where: { id: gameState.id2 } });
          if (user1.xpBar >= user1.ladderLevel * 100) {
            await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { ladderLevel: { increment: 1 } } });
            await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { xpBar: { decrement: user1.ladderLevel * 100 } } });
          }
          if (user2.xpBar >= user2.ladderLevel * 100) {
            await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { ladderLevel: { increment: 1 } } });
            await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { xpBar: { decrement: user2.ladderLevel * 100 } } });
          }
          historyWinnerString = 'W:' + user2.username + ' L:' + user1.username + ' ' + gameState.rightScore + ' - ' + gameState.leftScore;
          historyLoserString = 'L:' + user2.username + ' W:' + user1.username + ' ' + gameState.rightScore + ' - ' + gameState.leftScore;
          await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { matchHistory: { push: historyLoserString } } });
          await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { matchHistory: { push: historyWinnerString } } });
        }
        const user1 = await this.prismaService.user.findUnique({ where: { id: gameState.id1 } });
        const user2 = await this.prismaService.user.findUnique({ where: { id: gameState.id2 } });
        if (gameState.leftScore == 11) {
          io.to(this.gameStates[index].socketLeft).emit('gameOver', { message: "You won " + this.gameStates[index].leftScore + " - " + this.gameStates[index].rightScore + " against " + user2.username });
          io.to(this.gameStates[index].socketRight).emit('gameOver', { message: "You lost " + this.gameStates[index].leftScore + " - " + this.gameStates[index].rightScore + " against " + user1.username });
        }
        else {
          io.to(this.gameStates[index].socketLeft).emit('gameOver', { message: "You lost " + this.gameStates[index].leftScore + " - " + this.gameStates[index].rightScore + " against " + user2.username });
          io.to(this.gameStates[index].socketRight).emit('gameOver', { message: "You won " + this.gameStates[index].leftScore + " - " + this.gameStates[index].rightScore + " against " + user1.username });
        }
        await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { status: "online" } });
        await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { status: "online" } });

        this.gameStates.splice(index, 1);
        return;
      }
    }

    let newX = gameState.x + gameState.dx * this.gameStates[index].speedMultiplier;
    const newY = gameState.y + gameState.dy * this.gameStates[index].speedMultiplier;
    const lpc = this.checkPaddleCollision(newX, newY, paddleGap, gameState.paddleLeft);
    const rpc = this.checkPaddleCollision(newX, newY, widthGameboard - paddleGap - paddleWidth, gameState.paddleRight);
    const lpc2 = this.checkPaddleCollision(newX, newY, paddleGap + (275 - (paddleWidth * 2)), gameState.secondPaddleLeft);
    const rpc2 = this.checkPaddleCollision(newX, newY, widthGameboard - paddleGap - paddleWidth - (275 - (2 * paddleWidth)), gameState.secondPaddleRight);
    if (lpc == true && gameState.prevLpc == false) {
      const dirX = -gameState.dx;
      let dirY = (gameState.y + squareSize / 2 - gameState.paddleLeft - paddleMid) / paddleMid;
      if (dirY / dirX > 2)
        dirY = 2 * dirX;
      else if (dirY / dirX < -2)
        dirY = -2 * dirX;
      this.gameStates[index].speedMultiplier += 1;
      const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
      gameState.dx = dirX / magnitude;
      gameState.dy = dirY / magnitude;
      newX = 71;
    }
    else if (lpc2 == true && gameState.prevLpc2 == false) {
      const dirX = -gameState.dx;
      let dirY = (gameState.y + squareSize / 2 - gameState.paddleLeft - paddleMid) / paddleMid;
      if (dirY / dirX > 2)
        dirY = 2 * dirX;
      else if (dirY / dirX < -2)
        dirY = -2 * dirX;
      this.gameStates[index].speedMultiplier += 1;
      const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
      gameState.dx = dirX / magnitude;
      gameState.dy = dirY / magnitude;
      newX = 346;
    }
    else if (rpc == true && gameState.prevRpc == false) {
      const dirX = -gameState.dx;
      let dirY = (gameState.y + squareSize / 2 - gameState.paddleRight - paddleMid) / paddleMid;
      if (dirY / dirX > 2)
        dirY = 2 * dirX;
      else if (dirY / dirX < -2)
        dirY = -2 * dirX;
      this.gameStates[index].speedMultiplier += 1;
      const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
      gameState.dx = dirX / magnitude;
      gameState.dy = dirY / magnitude;
      newX = 929;
    }
    else if (rpc2 == true && gameState.prevRpc2 == false) {
      const dirX = -gameState.dx;
      let dirY = (gameState.y + squareSize / 2 - gameState.paddleRight - paddleMid) / paddleMid;
      if (dirY / dirX > 2)
        dirY = 2 * dirX;
      else if (dirY / dirX < -2)
        dirY = -2 * dirX;
      this.gameStates[index].speedMultiplier += 1;
      const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
      gameState.dx = dirX / magnitude;
      gameState.dy = dirY / magnitude;
      newX = 654;
    }
    else if (newY < 0 || newY + squareSize > heightGameboard) {
      gameState.dy = -gameState.dy;
    }
    else if (newX < 0) {
      this.gameStates[index].speedMultiplier = 10;
      const dirX = Math.random() * 2 - 1;
      let dirY = Math.random() * 2 - 1;
      if (dirY / dirX > 2)
        dirY = 2 * dirX;
      else if (dirY / dirX < -2)
        dirY = -2 * dirX;
      const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
      gameState.rightScore++;
      gameState.x = widthGameboardMid - midSquare;
      gameState.y = heightGameboardMid - midSquare;
      gameState.dx = dirX / magnitude;
      gameState.dy = dirY / magnitude;
    }
    else if (newX + squareSize > widthGameboard) {
      this.gameStates[index].speedMultiplier = 10;
      const dirX = Math.random() * 2 - 1;
      let dirY = Math.random() * 2 - 1;
      if (dirY / dirX > 2)
        dirY = 2 * dirX;
      else if (dirY / dirX < -2)
        dirY = -2 * dirX;
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
    gameState.prevLpc2 = lpc2;
    gameState.prevRpc2 = rpc2;
  }

  async gameLogicClassic(index: number, io: any) {
    let gameState = this.gameStates[index];

    if (gameState.socketLeft == 0 || gameState.socketRight == 0) {
      return;
    }

    if (gameState.leftScore == 11 || gameState.rightScore == 11) {
      if (gameState.statsAttributed == false) {
        gameState.statsAttributed = true;
        let historyWinnerString = "";
        let historyLoserString = "";
        if (gameState.leftScore == 11) {
          await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { wins: { increment: 1 }, xpBar: { increment: 100 } } });
          await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { losses: { increment: 1 }, xpBar: { increment: 50 } } });
          const user1 = await this.prismaService.user.findUnique({ where: { id: gameState.id1 } });
          const user2 = await this.prismaService.user.findUnique({ where: { id: gameState.id2 } });
          if (user1.xpBar >= user1.ladderLevel * 100) {
            await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { ladderLevel: { increment: 1 } } });
            await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { xpBar: { decrement: user1.ladderLevel * 100 } } });
          }
          if (user2.xpBar >= user2.ladderLevel * 100) {
            await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { ladderLevel: { increment: 1 } } });
            await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { xpBar: { decrement: user2.ladderLevel * 100 } } });
          }
          historyWinnerString = 'W:' + user1.username + ' L:' + user2.username + ' ' + gameState.leftScore + ' - ' + gameState.rightScore;
          historyLoserString = 'L:' + user1.username + ' W:' + user2.username + ' ' + gameState.leftScore + ' - ' + gameState.rightScore;
          await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { matchHistory: { push: historyWinnerString } } });
          await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { matchHistory: { push: historyLoserString } } });
        }
        else {
          await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { losses: { increment: 1 }, xpBar: { increment: 50 } } });
          await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { wins: { increment: 1 }, xpBar: { increment: 100 } } });
          const user1 = await this.prismaService.user.findUnique({ where: { id: gameState.id1 } });
          const user2 = await this.prismaService.user.findUnique({ where: { id: gameState.id2 } });
          if (user1.xpBar >= user1.ladderLevel * 100) {
            await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { ladderLevel: { increment: 1 } } });
            await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { xpBar: { decrement: user1.ladderLevel * 100 } } });
          }
          if (user2.xpBar >= user2.ladderLevel * 100) {
            await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { ladderLevel: { increment: 1 } } });
            await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { xpBar: { decrement: user2.ladderLevel * 100 } } });
          }
          historyWinnerString = 'W:' + user2.username + ' L:' + user1.username + ' ' + gameState.rightScore + ' - ' + gameState.leftScore;
          historyLoserString = 'L:' + user2.username + ' W:' + user1.username + ' ' + gameState.rightScore + ' - ' + gameState.leftScore;
          await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { matchHistory: { push: historyLoserString } } });
          await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { matchHistory: { push: historyWinnerString } } });
        }
        const user1 = await this.prismaService.user.findUnique({ where: { id: gameState.id1 } });
        const user2 = await this.prismaService.user.findUnique({ where: { id: gameState.id2 } });
        if (gameState.leftScore == 11) {
          io.to(this.gameStates[index].socketLeft).emit('gameOver', { message: "You won " + this.gameStates[index].leftScore + " - " + this.gameStates[index].rightScore + " against " + user2.username });
          io.to(this.gameStates[index].socketRight).emit('gameOver', { message: "You lost " + this.gameStates[index].leftScore + " - " + this.gameStates[index].rightScore + " against " + user1.username });
        }
        else {
          io.to(this.gameStates[index].socketLeft).emit('gameOver', { message: "You lost " + this.gameStates[index].leftScore + " - " + this.gameStates[index].rightScore + " against " + user2.username });
          io.to(this.gameStates[index].socketRight).emit('gameOver', { message: "You won " + this.gameStates[index].leftScore + " - " + this.gameStates[index].rightScore + " against " + user1.username });
        }
        await this.prismaService.user.update({ where: { id: gameState.id1 }, data: { status: "online" } });
        await this.prismaService.user.update({ where: { id: gameState.id2 }, data: { status: "online" } });

        this.gameStates.splice(index, 1);
        return;
      }
    }

    let newX = gameState.x + gameState.dx * this.gameStates[index].speedMultiplier;
    const newY = gameState.y + gameState.dy * this.gameStates[index].speedMultiplier;
    const lpc = this.checkPaddleCollision(newX, newY, paddleGap, gameState.paddleLeft);
    const rpc = this.checkPaddleCollision(newX, newY, widthGameboard - paddleGap - paddleWidth, gameState.paddleRight);
    if (lpc == true && gameState.prevLpc == false) {
      const dirX = -gameState.dx;
      let dirY = (gameState.y + squareSize / 2 - gameState.paddleLeft - paddleMid) / paddleMid;
      if (dirY / dirX > 2)
        dirY = 2 * dirX;
      else if (dirY / dirX < -2)
        dirY = -2 * dirX;
      this.gameStates[index].speedMultiplier += 1;
      const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
      gameState.dx = dirX / magnitude;
      gameState.dy = dirY / magnitude;
      newX = 71;
    }
    else if (rpc == true && gameState.prevRpc == false) {
      const dirX = -gameState.dx;
      let dirY = (gameState.y + squareSize / 2 - gameState.paddleRight - paddleMid) / paddleMid;
      if (dirY / dirX > 2)
        dirY = 2 * dirX;
      else if (dirY / dirX < -2)
        dirY = -2 * dirX;
      this.gameStates[index].speedMultiplier += 1;
      const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
      gameState.dx = dirX / magnitude;
      gameState.dy = dirY / magnitude;
      newX = 929;
    }
    else if (newY < 0 || newY + squareSize > heightGameboard) {
      gameState.dy = -gameState.dy;
    }
    else if (newX < 0) {
      this.gameStates[index].speedMultiplier = 10;
      const dirX = Math.random() * 2 - 1;
      let dirY = Math.random() * 2 - 1;
      if (dirY / dirX > 2)
        dirY = 2 * dirX;
      else if (dirY / dirX < -2)
        dirY = -2 * dirX;
      const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
      gameState.rightScore++;
      gameState.x = widthGameboardMid - midSquare;
      gameState.y = heightGameboardMid - midSquare;
      gameState.dx = dirX / magnitude;
      gameState.dy = dirY / magnitude;
    }
    else if (newX + squareSize > widthGameboard) {
      this.gameStates[index].speedMultiplier = 10;
      const dirX = Math.random() * 2 - 1;
      let dirY = Math.random() * 2 - 1;
      if (dirY / dirX > 2)
        dirY = 2 * dirX;
      else if (dirY / dirX < -2)
        dirY = -2 * dirX;
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

  getGameState(socketId: string, io: any): { success: boolean, gameState?: { x: number, y: number, dx: number, dy: number, paddleLeft: number, paddleRight: number, secondPaddleLeft?: number, secondPaddleRight?: number, leftScore: number, rightScore: number } } {
    try {
      const index = this.map1.get(socketId);
      if (this.gameStates[index]?.socketLeft === 0 || this.gameStates[index]?.socketRight === 0) {
        return { success: false };
      }
      if (index !== undefined) {
        if (this.gameStates[index].onOff === false) {
          this.gameStates[index].onOff = true;
          if (this.gameStates[index].mode === "classic")
            this.gameLogicClassic(index, io);
          else
            this.gameLogicCustom(index, io);
        }
        else
          this.gameStates[index].onOff = false;
        if (this.gameStates[index].mode === "classic")
          return { success: true, gameState: { x: this.gameStates[index].x, y: this.gameStates[index].y, dx: this.gameStates[index].dx, dy: this.gameStates[index].dy, paddleLeft: this.gameStates[index].paddleLeft, paddleRight: this.gameStates[index].paddleRight, leftScore: this.gameStates[index].leftScore, rightScore: this.gameStates[index].rightScore } };
        else
          return { success: true, gameState: { x: this.gameStates[index].x, y: this.gameStates[index].y, dx: this.gameStates[index].dx, dy: this.gameStates[index].dy, paddleLeft: this.gameStates[index].paddleLeft, paddleRight: this.gameStates[index].paddleRight, secondPaddleLeft: this.gameStates[index].secondPaddleLeft, secondPaddleRight: this.gameStates[index].secondPaddleRight, leftScore: this.gameStates[index].leftScore, rightScore: this.gameStates[index].rightScore } };
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
    gameState.dx = Math.random() * 2 - 1;
    gameState.dy = Math.random() * 2 - 1;
    if (gameState.dy / gameState.dx > 2)
      gameState.dy = 2 * gameState.dx;
    else if (gameState.dy / gameState.dx < -2)
      gameState.dy = -2 * gameState.dx;
    let magnitude = Math.sqrt(gameState.dx ** 2) + Math.sqrt(gameState.dy ** 2);
    gameState.dx /= magnitude;
    gameState.dy /= magnitude;
    gameState.paddleLeft = heightGameboardMid - paddleMid;
    gameState.paddleRight = heightGameboardMid - paddleMid;
  }


  async changeSocketCustom(id: any, login: any, io: any) {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: login } });
      const index = this.gameStates.findIndex((gameState) => gameState.id1 === user.id || gameState.id2 === user.id);
      if (index !== -1) {
        if (this.gameStates[index].id1 === user.id && this.gameStates[index].socketLeft === 0) {
          this.gameStates[index].socketLeft = id;
          this.map1.set(id, index);
          if (this.gameStates[index].socketRight !== 0 && this.gameStates[index].socketLeft !== 0) {
            const username1 = await this.prismaService.user.findUnique({ where: { id: this.gameStates[index].id1 } });
            const username2 = await this.prismaService.user.findUnique({ where: { id: this.gameStates[index].id2 } });
            io.to('').emit('usernames', { leftUser: username1.username, rightUser: username2.username });
            io.to(this.gameStates[index].socketLeft).emit('usernames', { leftUser: username1.username, rightUser: username2.username });
            io.to(this.gameStates[index].socketRight).emit('usernames', { leftUser: username1.username, rightUser: username2.username });
            if (this.gameStates[index].started === false) {
              this.gameStartCustom(index);
              this.gameStates[index].started = true;
            }
            else {
              io.to(this.gameStates[index].socketRight).emit('opponentReconnected', {});
            }
          }
        }
        else {
          this.gameStates[index].socketRight = id;
          this.map1.set(id, index);
          if (this.gameStates[index].socketRight !== 0 && this.gameStates[index].socketLeft !== 0) {
            const username1 = await this.prismaService.user.findUnique({ where: { id: this.gameStates[index].id1 } });
            const username2 = await this.prismaService.user.findUnique({ where: { id: this.gameStates[index].id2 } });
            io.to(this.gameStates[index].socketLeft).emit('usernames', { leftUser: username1.username, rightUser: username2.username });
            io.to(this.gameStates[index].socketRight).emit('usernames', { leftUser: username1.username, rightUser: username2.username });
            if (this.gameStates[index].started === false) {
              this.gameStartCustom(index);
              this.gameStates[index].started = true;
            }
            else {
              io.to(this.gameStates[index].socketLeft).emit('opponentReconnected', {});
            }
          }
        }
        return { success: true };
      }
    } catch (e) {
      console.log(e);
    }
    return { success: false };
  }
  async gameStartCustom(index: number) {
    let gameState = this.gameStates[index];
    gameState.x = widthGameboardMid - (squareSize / 2);
    gameState.y = heightGameboardMid - (squareSize / 2);
    gameState.dx = Math.random() * 2 - 1;
    gameState.dy = Math.random() * 2 - 1;
    if (gameState.dy / gameState.dx > 2)
      gameState.dy = 2 * gameState.dx;
    else if (gameState.dy / gameState.dx < -2)
      gameState.dy = -2 * gameState.dx;
    let magnitude = Math.sqrt(gameState.dx ** 2) + Math.sqrt(gameState.dy ** 2);
    gameState.dx /= magnitude;
    gameState.dy /= magnitude;
    gameState.paddleLeft = heightGameboardMid - paddleMid;
    gameState.paddleRight = heightGameboardMid - paddleMid;
    gameState.secondPaddleLeft = heightGameboardMid - paddleMid;
    gameState.secondPaddleRight = heightGameboardMid - paddleMid;
  }


  async changeSocketClassic(socketId: string, username: string, io: any): Promise<{ success: boolean }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
      const index = this.gameStates.findIndex((gameState) => gameState.id1 === user.id || gameState.id2 === user.id);
      if (index !== -1 && this.gameStates[index].socketLeft !== 0 && this.gameStates[index].socketRight !== 0) {
        return;
      }
      if (index !== -1) {
        if (this.gameStates[index].id1 === user.id && this.gameStates[index].socketLeft === 0) {
          this.gameStates[index].socketLeft = socketId;
          this.map1.set(socketId, index);
          if (this.gameStates[index].socketRight !== 0 && this.gameStates[index].socketLeft !== 0) {
            const username1 = await this.prismaService.user.findUnique({ where: { id: this.gameStates[index].id1 } });
            const username2 = await this.prismaService.user.findUnique({ where: { id: this.gameStates[index].id2 } });
            io.to('').emit('usernames', { leftUser: username1.username, rightUser: username2.username });
            io.to(this.gameStates[index].socketLeft).emit('usernames', { leftUser: username1.username, rightUser: username2.username });
            io.to(this.gameStates[index].socketRight).emit('usernames', { leftUser: username1.username, rightUser: username2.username });
            if (this.gameStates[index].started === false) {
              this.gameStartClassic(index);
              this.gameStates[index].started = true;
            }
            else {
              io.to(this.gameStates[index].socketRight).emit('opponentReconnected', {});
            }
          }
        }
        else {
          this.gameStates[index].socketRight = socketId;
          this.map1.set(socketId, index);
          if (this.gameStates[index].socketRight !== 0 && this.gameStates[index].socketLeft !== 0) {
            const username1 = await this.prismaService.user.findUnique({ where: { id: this.gameStates[index].id1 } });
            const username2 = await this.prismaService.user.findUnique({ where: { id: this.gameStates[index].id2 } });
            io.to(this.gameStates[index].socketLeft).emit('usernames', { leftUser: username1.username, rightUser: username2.username });
            io.to(this.gameStates[index].socketRight).emit('usernames', { leftUser: username1.username, rightUser: username2.username });
            if (this.gameStates[index].started === false) {
              this.gameStartClassic(index);
              this.gameStates[index].started = true;
            }
            else {
              io.to(this.gameStates[index].socketLeft).emit('opponentReconnected', {});
            }
          }
        }
        return { success: true };
      }
    } catch (e) {
      console.log(e);
    }
    return { success: false };
  }

  async queueStatusCustomPong(username: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string, queueStatus?: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
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
    try {
      if (this.queueCustom.length >= 2) {
        const user1 = await this.prismaService.user.findUniqueOrThrow({ where: { id: this.queueCustom[0] } });
        const user2 = await this.prismaService.user.findUniqueOrThrow({ where: { id: this.queueCustom[1] } });
        this.gameStates.push({ mode: "custom", secondPaddleLeft: 0, secondPaddleRight: 0, statsAttributed: false, started: false, id1: this.queueCustom[0], id2: this.queueCustom[1], socketLeft: 0, socketRight: 0, x: 0, y: 0, dx: 0, dy: 0, paddleLeft: 0, paddleRight: 0, leftScore: 0, rightScore: 0, prevLpc: false, prevRpc: false, prevLpc2: false, prevRpc2: false, onOff: false, speedMultiplier: 10 });
        this.queueCustom.splice(0, 2);
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

  async queueDownCustomPong(username: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
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

  async queueUpCustomPong(username: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
      const ret = await this.authService.checkToken(user, refreshToken, accessToken);
      if (ret.success) {
        if (!this.queueCustom.includes(user.id))
          this.queueCustom.push(user.id);
        return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
      }
    } catch (e) {
      console.log(e);
    }
    return { success: false };
  }

  async queueStatusClassicPong(username: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string, queueStatus?: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
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
    try {
      if (this.queueClassic.length >= 2) {
        const user1 = await this.prismaService.user.findUniqueOrThrow({ where: { id: this.queueClassic[0] } });
        const user2 = await this.prismaService.user.findUniqueOrThrow({ where: { id: this.queueClassic[1] } });
        this.gameStates.push({ mode: "classic", statsAttributed: false, started: false, id1: this.queueClassic[0], id2: this.queueClassic[1], socketLeft: 0, socketRight: 0, x: 0, y: 0, dx: 0, dy: 0, paddleLeft: 0, paddleRight: 0, leftScore: 0, rightScore: 0, prevLpc: false, prevRpc: false, onOff: false, speedMultiplier: 10 });
        this.queueClassic.splice(0, 2);
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


  async queueDownClassicPong(username: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
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

  async queueUpClassicPong(username: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
      const ret = await this.authService.checkToken(user, refreshToken, accessToken);
      if (ret.success) {
        if (!this.queueClassic.includes(user.id))
          this.queueClassic.push(user.id);
        return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
      }
    } catch (e) {
      console.log(e);
    }
    return { success: false };
  }
}

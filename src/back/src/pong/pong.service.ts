import { Injectable } from '@nestjs/common';
import { CreatePongDto } from './dto/create-pong.dto';
import { UpdatePongDto } from './dto/update-pong.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class PongService {
  private queueClassic: number[] = [];
  private queueCustom: number[] = [];
  private gameStates: { [id: number]: { user1: string, user2: string } } = {};

  constructor(private prismaService: PrismaService, private authService: AuthService) {
    setInterval(() => {
      this.checkQueueClassic();
    }, 1000);
    setInterval(() => {
      this.checkQueueCustom();
    }, 1000);
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

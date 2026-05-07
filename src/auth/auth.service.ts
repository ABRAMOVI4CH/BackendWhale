import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { UserSeedService } from '../me/user-seed.service';
import type { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>,
    private readonly userSeed: UserSeedService,
  ) {}

  private signAccessToken(user: UserEntity): string {
    // Per product requirement: “bessrochny” access token (no exp).
    return this.jwt.sign({
      sub: user.id,
      role: user.role,
      login: user.login,
    });
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({ where: { login: dto.login } });
    if (existing) throw new ConflictException('login_taken');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const saved = await this.usersRepo.save(
      this.usersRepo.create({
        login: dto.login,
        passwordHash,
        role: dto.role ?? 'employee',
        fullName: dto.fullName ?? '',
        team: dto.team ?? '',
      }),
    );

    if (saved.role === 'employee') await this.userSeed.seedDemoIfNeeded(saved.id);
    const user = await this.usersRepo.findOne({ where: { id: saved.id } });
    if (!user) throw new InternalServerErrorException('persist_failed');

    return {
      accessToken: this.signAccessToken(user),
      user: this.toPublicUser(user),
    };
  }

  async login(login: string, password: string) {
    const found = await this.usersRepo.findOne({ where: { login } });
    if (!found) throw new UnauthorizedException('invalid_credentials');

    const ok = await bcrypt.compare(password, found.passwordHash);
    if (!ok) throw new UnauthorizedException('invalid_credentials');

    await this.userSeed.seedDemoIfNeeded(found.id);
    const user = await this.usersRepo.findOne({ where: { id: found.id } });
    if (!user) throw new InternalServerErrorException('persist_failed');

    return {
      accessToken: this.signAccessToken(user),
      user: this.toPublicUser(user),
    };
  }

  private toPublicUser(user: UserEntity) {
    return {
      id: user.id,
      login: user.login,
      role: user.role,
      createdAt: user.createdAt,
      totalXp: user.totalXp,
      fullName: user.fullName,
      team: user.team,
    };
  }
}


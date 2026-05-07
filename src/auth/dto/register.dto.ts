import { IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  login!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}


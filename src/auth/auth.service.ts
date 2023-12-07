import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedError } from './error/unauthorized.error';
import { User } from 'src/module/user/entities/user.entity';
import { UserService } from 'src/module/user/user.service';
import { UserPlayload } from './models/UserPlayload';
import { UserToken } from './models/UserToken';

@Injectable()
export class AuthService {
  bcrypt = require('bcrypt');
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(user: User): Promise<UserToken> {
    // Transformar o user em um JWT
    const payload: UserPlayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };

    return {
      acess_token: this.jwtService.sign(payload),
      id_user: user.id,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.userService.findByEmail(email);

      if (user) {
        // verificar a senha informada com a hash que está no banco
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
          return {
            ...user,
            password: undefined,
          };
        }
      }
    } catch (error) {
      console.log('HTTP status code:', error.response.status);
      throw new UnauthorizedError(
        'Email address or password provided is incorrect.',
      );
    }
  }
}

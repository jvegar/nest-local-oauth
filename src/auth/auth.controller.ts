import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express-serve-static-core';
import { isUndefined } from 'src/common/utils/validation.util';
import { Public } from './decorators/public.decorator';
import { Origin } from './decorators/origin.decorator';
import { SignUpDto } from './dtos/sign-up.dto';
import { IMessage } from 'src/common/interfaces/message.interface';
import { SignInDto } from './dtos/sign-in.dto';
import { AuthResponseMapper } from './mappers/auth-response.mapper';
import { EmailDto } from './dtos/email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { IAuthResponseUser } from './interfaces/auth-response-user.interface';
import { AuthResponseUserMapper } from './mappers/auth-response-user.mapper';
import { ApiTags } from '@nestjs/swagger';
import { ExpressThrottlerGuard } from './guards/express-throttler.guard';

@ApiTags('Auth')
@Controller('api/auth')
@UseGuards(ExpressThrottlerGuard)
export class AuthController {
  private readonly cookiePath = '/api/auth';
  private readonly cookieName: string;
  private readonly refreshTime: number;
  private readonly testing: boolean;
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.get<string>('REFRESH_COOKIE');
    this.refreshTime = this.configService.get<number>('jwt.refresh.time');
    this.testing = this.configService.get<string>('NODE_ENV') !== 'production';
  }

  private refreshTokenFromReq(req: Request): string {
    const token: string | undefined = req.signedCookies[this.cookieName];

    if (isUndefined(token)) {
      throw new UnauthorizedException();
    }

    return token;
  }

  private saveRefreshCookie(res: Response, refreshToken: string): Response {
    return res.cookie(this.cookieName, refreshToken, {
      secure: !this.testing,
      httpOnly: true,
      signed: true,
      path: this.cookiePath,
      expires: new Date(Date.now() + this.refreshTime * 1000),
    });
  }

  @Public()
  @Post('/sign-up')
  public async signUp(
    @Origin() origin: string | undefined,
    @Body() signUpDto: SignUpDto,
  ): Promise<IMessage> {
    return this.authService.signUp(signUpDto, origin);
  }

  @Public()
  @Post('/sign-in')
  public async signIn(
    @Res() res: Response,
    @Origin() origin: string | undefined,
    @Body() singInDto: SignInDto,
  ): Promise<void> {
    const result = await this.authService.signIn(singInDto, origin);
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Public()
  @Post('/refresh-access')
  public async refreshAccess(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const token = this.refreshTokenFromReq(req);
    const result = await this.authService.refreshTokenAccess(
      token,
      req.headers.origin,
    );
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const token = this.refreshTokenFromReq(req);
    const message = await this.authService.logout(token);
    res
      .clearCookie(this.cookieName, { path: this.cookiePath })
      .status(HttpStatus.OK)
      .json(message);
  }

  @Public()
  @Get('/confirm-email/:token')
  public async confirmEmail(
    @Param() params: any,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.confirmEmail({
      confirmationToken: params.token,
    });
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Post('/forgot-password')
  @HttpCode(HttpStatus.OK)
  public async forgotPassword(
    @Origin() origin: string | undefined,
    @Body() emailDto: EmailDto,
  ): Promise<IMessage> {
    return this.authService.resetPasswordEmail(emailDto, origin);
  }

  @Public()
  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<IMessage> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Patch('/update-password')
  public async updatePassword(
    @CurrentUser() userId: number,
    @Origin() origin: string | undefined,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.changePassword(
      userId,
      changePasswordDto,
      origin,
    );
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Get('/me')
  public async getMe(@CurrentUser() id: number): Promise<IAuthResponseUser> {
    const user = await this.usersService.findOneById(id);
    return AuthResponseUserMapper.map(user);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, MinLength } from 'class-validator';
import { PASSWORD_REGEX } from '../../common/consts/regex.const';

export abstract class PasswordsDto {
  @ApiProperty({
    description: 'Password (required)',
    example: 'P@ssw0rd',
  })
  @IsString()
  @Length(8, 35)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password requires a lowercase letter, an uppercase letter, and a number or symbol',
  })
  public password1!: string;

  @ApiProperty({
    description: 'Confirm password (required)',
    example: 'P@ssw0rd',
  })
  @IsString()
  @MinLength(1)
  public password2!: string;
}

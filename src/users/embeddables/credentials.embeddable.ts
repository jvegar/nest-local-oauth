import { Embeddable, Property } from '@mikro-orm/core';
import { ICredentials } from '../interfaces/credentials.interface';
import dayjs from 'dayjs';

@Embeddable()
export class CredentialsEmbeddable implements ICredentials {
  @Property({ default: 0 })
  public version = 0;

  @Property({ default: '' })
  public lastPassword = '';

  @Property({ default: dayjs().unix() })
  public passwordUpdatedAt: number;

  @Property({ default: dayjs().unix() })
  public updatedAt: number;

  public updatePassword(password: string): void {
    this.version++;
    this.lastPassword = password;
    const now = dayjs().unix();
    this.passwordUpdatedAt = now;
    this.updatedAt = now;
  }

  public updateVersion(): void {
    this.version++;
    this.updatedAt = dayjs().unix();
  }
}

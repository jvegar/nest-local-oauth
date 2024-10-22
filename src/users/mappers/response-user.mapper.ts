import { IResponseUser } from '../interfaces/response-user.interface';
import { IUser } from '../interfaces/user.interface';

export class ResponseUserMapper implements IResponseUser {
  public id: number;
  public name: string;
  public username: string;
  public createdAt: string;
  public updatedAt: string;

  constructor(values: IResponseUser) {
    Object.assign(this, values);
  }

  public static map(user: IUser): ResponseUserMapper {
    return new ResponseUserMapper({
      id: user.id,
      name: user.name,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  }
}

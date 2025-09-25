import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Cache } from '@nestjs/cache-manager';

@Injectable()
export class UsersService {
  constructor(@Inject('CACHE_MANAGER') private cacheManager: Cache) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    console.log('Finding all users');
    return `This action returns all users`;
  }

  async findOne(id: number) {
    const cached = await this.cacheManager.get(`user:${id}`);
    if (cached) {
      return { data: cached, fromCache: true };
    }

    const user = { id, name: 'Mohamed', email: 'mohamed@example.com' };
    await this.cacheManager.set(`user:${id}`, user); // cache for 5 min
    return { data: user, fromCache: false };

    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

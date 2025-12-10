import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Cache } from '@nestjs/cache-manager';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    @Inject(UserRepository) private readonly userRepository: UserRepository,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return this.userRepository.find();
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

  async findByKeycloakId(keycloakId: string) {
    return this.userRepository.findOne({ where: { keycloakId } });
  }

  async createFromKeycloak(keycloakUser: any) {
    const entity = this.userRepository.create({
      keycloakId: keycloakUser.sub,
      email: keycloakUser.email,
      username: keycloakUser.preferred_username ?? '',
      firstName: keycloakUser.given_name ?? '',
      lastName: keycloakUser.family_name ?? '',
    });

    const save = await this.userRepository.save(entity);

    return this.userRepository.findOne({ where: { id: save.id } });
  }
}

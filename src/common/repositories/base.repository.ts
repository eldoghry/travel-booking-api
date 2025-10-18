import { DeepPartial, Repository } from 'typeorm';
import { IBaseRepository } from './bsae-repository.interface';

export abstract class BaseRepository<T extends { id: string }>
  implements IBaseRepository<T>
{
  protected constructor(protected readonly repository: Repository<T>) {}

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id, data as any);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return !!result?.affected && result.affected > 0;
  }
}

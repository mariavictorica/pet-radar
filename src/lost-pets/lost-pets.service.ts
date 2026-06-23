import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostPet } from 'src/core/db/entities/lost-pet.entity';
import { CreateLostPetDto } from 'src/core/interfaces/lost-pet.interface';

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPet)
    private readonly lostPetRepository: Repository<LostPet>,
  ) {}

  async getLostPets(filters: {
    species?: string;
    isActive?: string;
  }): Promise<LostPet[]> {
    const query = this.lostPetRepository
      .createQueryBuilder('lp')
      .select([
        'lp.id',
        'lp.name',
        'lp.species',
        'lp.breed',
        'lp.color',
        'lp.size',
        'lp.description',
        'lp.photo_url',
        'lp.owner_name',
        'lp.owner_phone',
        'lp.address',
        'lp.lost_date',
        'lp.is_active',
        'lp.created_at',
      ])
      .orderBy('lp.created_at', 'DESC');

    if (filters.species) {
      query.andWhere('LOWER(lp.species) = LOWER(:species)', {
        species: filters.species,
      });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('lp.is_active = :isActive', {
        isActive: filters.isActive !== 'false',
      });
    }

    return query.getMany();
  }

  async createLostPet(dto: CreateLostPetDto): Promise<LostPet> {
    const newLostPet = this.lostPetRepository.create({
      name: dto.name,
      species: dto.species,
      breed: dto.breed,
      color: dto.color,
      size: dto.size,
      description: dto.description,
      photo_url: dto.photo_url,
      owner_name: dto.owner_name,
      owner_email: dto.owner_email,
      owner_phone: dto.owner_phone,
      location: {
        type: 'Point',
        coordinates: [dto.lon, dto.lat],
      },
      address: dto.address,
      lost_date: new Date(dto.lost_date),
      is_active: true,
    });

    return this.lostPetRepository.save(newLostPet);
  }
}

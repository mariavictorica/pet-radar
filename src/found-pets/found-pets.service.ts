import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoundPet } from 'src/core/db/entities/found-pet.entity';
import { LostPet } from 'src/core/db/entities/lost-pet.entity';
import { CreateFoundPetDto } from 'src/core/interfaces/found-pet.interface';
import { EmailService } from 'src/email/email.service';
import { EmailOptions } from 'src/core/interfaces/mail-options.interface';
import { generateFoundPetEmailTemplate } from './templates/found-pet-email.template';
import { envs } from 'src/config/envs';

const SEARCH_RADIUS_METERS = 500;

@Injectable()
export class FoundPetsService {
  constructor(
    @InjectRepository(FoundPet)
    private readonly foundPetRepository: Repository<FoundPet>,

    @InjectRepository(LostPet)
    private readonly lostPetRepository: Repository<LostPet>,

    private readonly emailService: EmailService,
  ) {}

  async getFoundPets(): Promise<FoundPet[]> {
    return this.foundPetRepository.find({
      select: [
        'id',
        'species',
        'breed',
        'color',
        'size',
        'description',
        'photo_url',
        'finder_name',
        'finder_phone',
        'address',
        'found_date',
        'created_at',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async createFoundPet(dto: CreateFoundPetDto): Promise<{
    foundPet: FoundPet;
    matchesFound: number;
    notificationsSent: number;
  }> {
    // 1. Save the found pet
    const newFoundPet = this.foundPetRepository.create({
      species: dto.species,
      breed: dto.breed,
      color: dto.color,
      size: dto.size,
      description: dto.description,
      photo_url: dto.photo_url,
      finder_name: dto.finder_name,
      finder_email: dto.finder_email,
      finder_phone: dto.finder_phone,
      location: {
        type: 'Point',
        coordinates: [dto.lon, dto.lat],
      },
      address: dto.address,
      found_date: new Date(dto.found_date),
    });

    const savedFoundPet = await this.foundPetRepository.save(newFoundPet);

    // 2. Search for lost pets within 500m using PostGIS ST_DWithin
    const nearbyLostPets: (LostPet & { distance: number })[] =
      await this.lostPetRepository.query(
        `
        SELECT *,
          ST_Distance(
            location,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          ) AS distance
        FROM lost_pets
        WHERE is_active = true
          AND ST_DWithin(
            location,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            $3
          )
        ORDER BY distance ASC
      `,
        [dto.lon, dto.lat, SEARCH_RADIUS_METERS],
      );

    // 3. Send email to each owner of a nearby lost pet
    let notificationsSent = 0;

    for (const lostPet of nearbyLostPets) {
      const htmlTemplate = generateFoundPetEmailTemplate(
        savedFoundPet,
        lostPet,
        lostPet.distance,
      );

      const options: EmailOptions = {
        to: envs.NOTIFICATION_EMAIL,
        subject: `🐾 PetRadar: Posible coincidencia para ${lostPet.name} a ${Math.round(lostPet.distance)}m`,
        html: htmlTemplate,
      };

      const sent = await this.emailService.sendEmail(options);
      if (sent) notificationsSent++;
    }

    return {
      foundPet: savedFoundPet,
      matchesFound: nearbyLostPets.length,
      notificationsSent,
    };
  }
}

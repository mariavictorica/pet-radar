import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LostPetsService } from './lost-pets.service';
import type { CreateLostPetDto } from 'src/core/interfaces/lost-pet.interface';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly lostPetsService: LostPetsService) {}

  @Get()
  async getLostPets(
    @Query('species') species?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.lostPetsService.getLostPets({ species, isActive });
  }

  @Post()
  async createLostPet(@Body() dto: CreateLostPetDto) {
    return this.lostPetsService.createLostPet(dto);
  }
}

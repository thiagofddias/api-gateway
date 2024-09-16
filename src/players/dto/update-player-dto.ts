import { IsOptional } from 'class-validator';

export class UpdatePlayerDto {
  // @IsNotEmpty()
  // readonly name: string;

  // @IsNotEmpty()
  // readonly phoneNumber: string;

  @IsOptional()
  category?: string;

  @IsOptional()
  urlPhotoPlayer?: string;
}

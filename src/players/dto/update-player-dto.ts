import { IsNotEmpty } from 'class-validator';

export class UpdatePlayerDto {
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsNotEmpty()
  category: string;
}

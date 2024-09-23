import { IsOptional } from 'class-validator';
import { ChallengeStatus } from '../challenge-status.enum';

export class UpdateChallengeDto {
  @IsOptional()
  status: ChallengeStatus;
}

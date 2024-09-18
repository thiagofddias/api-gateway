import { IsNotEmpty } from 'class-validator';
import { Player } from 'src/players/interface/player.interface';
import { Result } from '../interface/match.interface';

export class AsignChallengeToMatchDto {
  @IsNotEmpty()
  def: Player;

  @IsNotEmpty()
  result: Array<Result>;
}

import { Player } from 'src/players/interface/player.interface';
import { ChallengeStatus } from '../challenge-status.enum';

export interface Challenge {
  dateHourChallenge: Date;
  status: ChallengeStatus;
  dateTimeRequest: Date;
  dateTimeResponse: Date;
  requester: string;
  category: string;
  match?: string;
  players: Array<Player>;
}

import { Player } from 'src/players/interface/player.interface';

export interface Match {
  category?: string;
  challenge?: string;
  players?: Player[];
  def?: Player;
  result?: Result[];
}

export interface Result {
  set: string;
}

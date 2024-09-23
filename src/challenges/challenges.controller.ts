import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { Player } from '../players/interface/player.interface';
import { firstValueFrom } from 'rxjs';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeStatusValidatorPipe } from './pipes/challenge-status-validation.pipe';
import { Challenge } from './interface/challenge.interface';
import { ChallengeStatus } from './challenge-status.enum';
import { ValidatorParamnsPipe } from 'src/common/pipes/validator-paramns.pipe';
import { AsignChallengeToMatchDto } from './dto/assign-challenge-match.dto';
import { Match } from './interface/match.interface';

@Controller('api/v1/challenges')
export class ChallengesController {
  private logger = new Logger(ChallengesController.name);

  constructor(private clientProxySmartRanking: ClientProxySmartRanking) {}

  private clientChallenges =
    this.clientProxySmartRanking.getClientProxyChallengesInstance();

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  @Post()
  @UsePipes(ValidationPipe)
  async createChallenge(@Body() createChallengeDto: CreateChallengeDto) {
    this.logger.log(
      `createChallengeDto: ${JSON.stringify(createChallengeDto)}`,
    );

    const players: Player[] = await firstValueFrom(
      this.clientAdminBackend.send('consult-player', ''),
    );

    createChallengeDto.players.map((playerDto) => {
      const playerFilter: Player[] = players.filter(
        (player) => player._id == playerDto._id,
      );

      this.logger.log(`playerFilter: ${JSON.stringify(playerFilter)}`);

      console.log('serase');
      if (playerFilter.length == 0) {
        throw new BadRequestException(
          `The id ${playerDto._id} not is a player!`,
        );
      }

      console.log('empiness machine');

      if (playerFilter[0].category != createChallengeDto.category) {
        throw new BadRequestException(
          `The player ${playerFilter[0]._id} not play in the same category!`,
        );
      }

      console.log('nerdei');
    });

    console.log('Aqui eu chego');

    const requesterItsPlayerInMatch: Player[] =
      createChallengeDto.players.filter(
        (player) => player._id == createChallengeDto.requester,
      );

    this.logger.log(
      `requesterItsPlayerInMatch: ${JSON.stringify(requesterItsPlayerInMatch)}`,
    );

    if (requesterItsPlayerInMatch.length == 0) {
      throw new BadRequestException(
        `The requester nedds to be a player in the match!`,
      );
    }

    const category = this.clientAdminBackend.send(
      'consult-categories',
      createChallengeDto.category,
    );

    this.logger.log(`category: ${JSON.stringify(category)}`);

    if (!category) {
      throw new BadRequestException(`The category is invalid!`);
    }

    console.log('Aqui eu chego categoria');

    console.log('dto CreateChallenge', createChallengeDto);

    this.clientChallenges.emit('create-challenge', createChallengeDto);

    console.log('criei');
    return this.clientAdminBackend.send('create-challenge', createChallengeDto);
  }

  @Get()
  async getChallenges(@Query('idPlayer') idPlayer: string): Promise<any> {
    if (idPlayer) {
      const player: Player = await firstValueFrom(
        this.clientAdminBackend.send<Player>('consult-player', idPlayer),
      );
      this.logger.log(`player: ${JSON.stringify(player)}`);

      if (!idPlayer) {
        throw new BadRequestException('Player not found!');
      }
    }

    return this.clientChallenges.send('consult-challenges', { idPlayer });
  }

  @Put('/:challenge')
  async updateChalllenge(
    @Body(ChallengeStatusValidatorPipe) udpateChallengeDto: UpdateChallengeDto,
    @Param('challenges') _id: string,
  ) {
    const challenge: Challenge = await firstValueFrom(
      this.clientChallenges.send('consult-challenge', { _id: _id }),
    );

    this.logger.log(`challenge: ${JSON.stringify(challenge)}`);

    if (!challenge) {
      throw new BadRequestException('Challenge not found');
    }

    if (challenge.status != ChallengeStatus.PENDING) {
      throw new BadRequestException('The challenge is not pending');
    }

    this.clientChallenges.emit('update-challenge', {
      id: _id,
      challenge: udpateChallengeDto,
    });
  }

  @Post('/:challenge/match')
  async AssignMatchChallenge(
    @Body(ValidationPipe) asignChallengeToMatchDto: AsignChallengeToMatchDto,
    @Param('challenges') _id: string,
  ) {
    const challenge: Challenge = await firstValueFrom(
      this.clientChallenges.send('consult-challenge', { _id }),
    );

    this.logger.log(`challenge: ${JSON.stringify(challenge)}`);

    if (!challenge) {
      throw new BadRequestException('Challenge not found');
    }

    if (challenge.status == ChallengeStatus.REALIZED) {
      throw new BadRequestException('The challenge is already realized');
    }

    if (challenge.status != ChallengeStatus.ACCEPTED) {
      throw new BadRequestException('The challenge is not accepted');
    }

    if (!challenge.players.includes(asignChallengeToMatchDto.def)) {
      throw new BadRequestException('The player is not part of the challenge');
    }

    const match: Match = {};
    match.category = challenge.category;
    match.def = asignChallengeToMatchDto.def;
    match.challenge = _id;
    match.players = challenge.players;
    match.result = asignChallengeToMatchDto.result;

    this.clientChallenges.emit('create-match', match);
  }

  @Delete('/:challenge')
  async deleteChallenge(
    @Param('challenges', ValidatorParamnsPipe) _id: string,
  ) {
    const challengeExists: Challenge = await firstValueFrom(
      this.clientChallenges.send('consult-challenge', { _id }),
    );

    if (!challengeExists) {
      throw new BadRequestException('Challenge not found');
    }

    return this.clientChallenges.emit('delete-challenge', challengeExists);
  }
}

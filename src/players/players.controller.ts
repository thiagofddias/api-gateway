import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Logger,
  Query,
  Get,
  Put,
  Param,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { defaultIfEmpty, Observable } from 'rxjs';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player-dto';
import { ValidatorParamnsPipe } from 'src/common/pipes/validator-paramns.pipe';

@Controller('api/v1/players')
export class PlayersController {
  private logger = new Logger(PlayersController.name);

  private clientAdminBackend: ClientProxy;

  constructor() {
    this.clientAdminBackend = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://dev:devpass@localhost:5672'],
        queue: 'admin-backend',
      },
    });
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    this.logger.log(`createPlayerDto: ${JSON.stringify(createPlayerDto)}`);

    const category = await this.clientAdminBackend.send(
      'consult-category',
      createPlayerDto.category,
    );

    if (category) {
      return this.clientAdminBackend.emit('create-player', createPlayerDto);
    } else {
      throw new BadRequestException('Category not found');
    }
  }

  @Get()
  consultPlayer(@Query('idPlayer') _id: string): Observable<any> {
    return this.clientAdminBackend
      .send('consult-player', _id ? _id : '')
      .pipe(defaultIfEmpty({ message: 'No players found' }));
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async updatePlayer(
    @Body() updatePlayerDto: UpdatePlayerDto,
    @Param('_id') _id: string,
  ) {
    const category = await this.clientAdminBackend.send(
      'consult-category',
      updatePlayerDto.category,
    );

    if (category) {
      return this.clientAdminBackend.emit('update-player', {
        id: _id,
        player: updatePlayerDto,
      });
    } else {
      throw new BadRequestException('Category not found');
    }
  }

  @Delete('/:_id')
  async deletePlayer(@Param('_id', ValidatorParamnsPipe) _id: string) {
    return this.clientAdminBackend.emit('delete-player', { _id });
  }
}

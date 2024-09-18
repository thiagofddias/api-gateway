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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player-dto';
import { ValidatorParamnsPipe } from 'src/common/pipes/validator-paramns.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { AwsService } from 'src/aws/aws.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Controller('api/v1/players')
export class PlayersController {
  private logger = new Logger(PlayersController.name);

  constructor(
    private clientProxySmartRanking: ClientProxySmartRanking,
    private awsService: AwsService,
  ) {
    this.clientAdminBackend = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://dev:devpass@localhost:5672'],
        queue: 'admin-backend',
      },
    });
  }

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

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

  @Post('/:_id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhotoPlayer(@UploadedFile() file, @Param('_id') _id: string) {
    const player = this.clientAdminBackend.send('consult-player', _id);

    if (!player) {
      throw new BadRequestException('Player not found');
    }

    const urlPhotoPlayer = await this.awsService.uploadFile(file, _id);

    const updatePlayerDto: UpdatePlayerDto = {};
    updatePlayerDto.urlPhotoPlayer = urlPhotoPlayer.url;

    console.log('updatePlayerDto: ', updatePlayerDto.urlPhotoPlayer);

    this.clientAdminBackend.emit('update-player', {
      id: _id,
      player: updatePlayerDto,
    });

    return this.clientAdminBackend.send('consult-player', _id);
  }

  @Get()
  consultPlayer(@Query('idPlayer') _id: string): Observable<any> {
    return this.clientAdminBackend.send('consult-player', _id ? _id : '');
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

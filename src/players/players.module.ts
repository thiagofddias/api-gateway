import { Module } from '@nestjs/common';
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module';
import { PlayersController } from './players.controller';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [ProxyRMQModule, AwsModule],
  controllers: [PlayersController],
})
export class PlayersModule {}

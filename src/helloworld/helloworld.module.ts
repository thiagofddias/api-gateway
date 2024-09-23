import { Module } from '@nestjs/common';
import { HelloWorldController } from './helloworld.controller';
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module';

@Module({
  imports: [ProxyRMQModule],
  controllers: [HelloWorldController],
})
export class HelloWorldModule {}

import {
  Controller,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';

@Controller('api/v1/helloworld')
export class HelloWorldController {
  private logger = new Logger(HelloWorldController.name);

  constructor(private clientProxySmartRanking: ClientProxySmartRanking) {}

  private clientChallenges =
    this.clientProxySmartRanking.getClientProxyChallengesInstance();

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  @Post()
  @UsePipes(ValidationPipe)
  async helloWorld() {
    console.log('Hello World');
    this.clientAdminBackend.emit('consult-player', '66ec38d7ee853c516ad35f68');
    return 'Hello World';
  }
}

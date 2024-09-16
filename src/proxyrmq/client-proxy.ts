import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'aws-sdk';

@Injectable()
export class ClientProxySmartRanking {
  constructor(private configService: ConfigService) {}

  static getClientProxyAdminBackendInstance() {
    throw new Error('Method not implemented.');
  }
  getClientProxyAdminBackendInstance(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://user:q7W2UQk249gR@18.210.17.173:5672/smartranking`],
        queue: 'admin-backend',
      },
    });
  }
}

import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';

@Module({
  controllers: [ChallengesController],
})
export class ChallengesModule {}

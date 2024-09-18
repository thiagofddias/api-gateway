import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ChallengeStatus } from '../challenge-status.enum';

export class ChallengeStatusValidatorPipe implements PipeTransform {
  readonly AllowedStatus = [
    ChallengeStatus.ACCEPTED,
    ChallengeStatus.DENIED,
    ChallengeStatus.CANCELED,
  ];

  transform(value: any) {
    const status = value.status.toUpperCase();

    if (!this.ItsValidStatus(status)) {
      throw new BadRequestException(`${status} its a valid status`);
    }

    return value;
  }

  private ItsValidStatus(status: any) {
    const idx = this.AllowedStatus.indexOf(status);
    return idx !== -1;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  private logger = new Logger(AwsService.name);
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    const AWS_REGION = this.configService.get('AWS_REGION');
    const AWS_ACCESS_KEY_ID = this.configService.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACESS_KEY = this.configService.get('AWS_SECRET_ACESS_KEY');

    this.s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACESS_KEY,
      },
    });
  }

  public async uploadFile(file: any, id: string): Promise<any> {
    const AWS_REGION = this.configService.get('AWS_REGION');
    const AWS_S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME');

    const fileExtension = file.originalname.split('.')[1];
    const urlKey = `${id}.${fileExtension}`;
    this.logger.log(`urlKey: ${urlKey}`);

    const params = {
      Body: file.buffer,
      Bucket: AWS_S3_BUCKET_NAME,
      Key: urlKey,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(params));
      return {
        url: `https://${AWS_S3_BUCKET_NAME}.s3-${AWS_REGION}.amazonaws.com/${urlKey}`,
      };
    } catch (err) {
      this.logger.error(err);
      return err;
    }
  }
}

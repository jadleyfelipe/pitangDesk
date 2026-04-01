import { Controller, Get } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Controller()
export class AppController {
  constructor(private readonly logger: Logger) {}

  @Get()
  getHello() {
    this.logger.log('something');
    return `Hello world`;
  }
}

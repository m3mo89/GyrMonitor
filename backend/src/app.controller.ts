import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  availability() {
    return {
      success: true,
      data: {
        status: 'ok',
        service: 'gyrmonitor-backend'
      }
    };
  }
}

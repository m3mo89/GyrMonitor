import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('availability')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Public runtime availability check (no auth, no seed data required).' })
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

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  health() {
    return {
      statusCode: 200,
      message: 'Emergy API is running',
      data: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  }
}

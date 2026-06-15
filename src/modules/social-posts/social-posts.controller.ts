import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { SocialPostsService } from './social-posts.service';
import { CreateSocialPostDto, UpdateSocialPostDto, CreateCommentDto, CreateReplyDto } from './social-posts.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Social Posts')
@Controller('social-posts')
@UseGuards(JwtAuthGuard)
export class SocialPostsController {
  constructor(private socialPostsService: SocialPostsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List social posts', description: 'Filter: institution, type' })
  @ApiQuery({ name: 'institutionId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ['WARNING', 'UPDATE', 'BROADCAST', 'INFO', 'NEWS', 'TIPS', 'ALERT', 'THANK_YOU'] })
  async findAll(
    @Query('institutionId') institutionId?: string,
    @Query('type') type?: string,
  ) {
    return this.socialPostsService.findAll({ institutionId, type });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail post + comments' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.socialPostsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create social post' })
  @ApiBody({ type: CreateSocialPostDto })
  async create(@Body() dto: CreateSocialPostDto, @CurrentUser() user: any) {
    return this.socialPostsService.create(dto, user.id, user.institutionId, user.username);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update social post' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateSocialPostDto })
  async update(@Param('id') id: string, @Body() dto: UpdateSocialPostDto) {
    return this.socialPostsService.update(id, dto);
  }

  @Post(':id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like' })
  @ApiParam({ name: 'id', type: String })
  async toggleLike(@Param('id') id: string, @CurrentUser() user: any) {
    return this.socialPostsService.toggleLike(id, user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete social post' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    await this.socialPostsService.remove(id);
    return { message: 'Post deleted' };
  }

  @Post(':postId/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to social post' })
  @ApiParam({ name: 'postId', type: String })
  @ApiBody({ type: CreateCommentDto })
  async addComment(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.socialPostsService.addComment(postId, dto, user.id, user.username);
  }

  @Post(':postId/comments/:commentId/replies')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to comment' })
  @ApiParam({ name: 'postId', type: String })
  @ApiParam({ name: 'commentId', type: String })
  @ApiBody({ type: CreateReplyDto })
  async replyToComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: CreateReplyDto,
    @CurrentUser() user: any,
  ) {
    return this.socialPostsService.replyToComment(postId, commentId, dto, user.id, user.username);
  }

  @Delete(':postId/comments/:commentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment' })
  @ApiParam({ name: 'postId', type: String })
  @ApiParam({ name: 'commentId', type: String })
  async deleteComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    await this.socialPostsService.deleteComment(postId, commentId);
    return { message: 'Comment deleted' };
  }
}

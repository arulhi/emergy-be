import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CitizenPostsService } from './citizen-posts.service';
import { CreateCitizenPostDto, UpdateCitizenPostDto, ReportPostDto, CreateCommentDto, UpdateCommentDto, CreateReplyDto } from './citizen-posts.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Citizen Posts')
@Controller('citizen-posts')
export class CitizenPostsController {
  constructor(private citizenPostsService: CitizenPostsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public feed', description: 'Paginated, filter by category, urgency, city' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'category', required: false, type: String, example: 'flood' })
  @ApiQuery({ name: 'urgency', required: false, type: String, example: 'urgent' })
  @ApiQuery({ name: 'city', required: false, type: String, example: 'Jakarta Pusat' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('urgency') urgency?: string,
    @Query('city') city?: string,
  ) {
    return this.citizenPostsService.findAll({ page, limit, category, urgency, city });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Detail post + comments + replies' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Post found' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('id') id: string) {
    return this.citizenPostsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create post → auto-assign incident ke institusi' })
  @ApiBody({ type: CreateCitizenPostDto })
  @ApiResponse({ status: 201, description: 'Post + incident created' })
  async create(@Body() dto: CreateCitizenPostDto, @CurrentUser() user: any) {
    return this.citizenPostsService.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post (owner only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCitizenPostDto })
  async update(@Param('id') id: string, @Body() dto: UpdateCitizenPostDto, @CurrentUser() user: any) {
    return this.citizenPostsService.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post (owner or admin)' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.citizenPostsService.remove(id, user.id, user.role);
    return { message: 'Post deleted' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/upvote')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle upvote' })
  @ApiParam({ name: 'id', type: String })
  async toggleUpvote(@Param('id') id: string, @CurrentUser() user: any) {
    return this.citizenPostsService.toggleUpvote(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/urgent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle urgent vote' })
  @ApiParam({ name: 'id', type: String })
  async toggleUrgent(@Param('id') id: string, @CurrentUser() user: any) {
    return this.citizenPostsService.toggleUrgent(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report as hoax' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: ReportPostDto })
  async report(@Param('id') id: string, @Body() dto: ReportPostDto, @CurrentUser() user: any) {
    return this.citizenPostsService.report(id, dto, user.id);
  }

  @Public()
  @Get(':id/comments')
  @ApiOperation({ summary: 'List comments of a post' })
  @ApiParam({ name: 'id', type: String })
  async getComments(@Param('id') id: string) {
    return this.citizenPostsService.getComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CreateCommentDto })
  async addComment(@Param('id') id: string, @Body() dto: CreateCommentDto, @CurrentUser() user: any) {
    return this.citizenPostsService.addComment(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':postId/comments/:commentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit comment (owner only)' })
  @ApiParam({ name: 'postId', type: String })
  @ApiParam({ name: 'commentId', type: String })
  @ApiBody({ type: UpdateCommentDto })
  async updateComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.citizenPostsService.updateComment(postId, commentId, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId/comments/:commentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment (owner or admin)' })
  @ApiParam({ name: 'postId', type: String })
  @ApiParam({ name: 'commentId', type: String })
  async deleteComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
  ) {
    await this.citizenPostsService.deleteComment(postId, commentId, user.id, user.role);
    return { message: 'Comment deleted' };
  }

  @UseGuards(JwtAuthGuard)
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
    return this.citizenPostsService.replyToComment(postId, commentId, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId/comments/:commentId/replies/:replyId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete reply' })
  @ApiParam({ name: 'postId', type: String })
  @ApiParam({ name: 'commentId', type: String })
  @ApiParam({ name: 'replyId', type: String })
  async deleteReply(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Param('replyId') replyId: string,
    @CurrentUser() user: any,
  ) {
    await this.citizenPostsService.deleteReply(postId, commentId, replyId, user.id, user.role);
    return { message: 'Reply deleted' };
  }
}

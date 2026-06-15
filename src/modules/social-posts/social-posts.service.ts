import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSocialPostDto, UpdateSocialPostDto, CreateCommentDto, CreateReplyDto } from './social-posts.dto';

@Injectable()
export class SocialPostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { institutionId?: string; type?: string }) {
    const where: any = {};
    if (query.institutionId) where.institutionId = query.institutionId;
    if (query.type) where.type = query.type;

    return this.prisma.socialPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        institution: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.socialPost.findUnique({
      where: { id },
      include: {
        institution: { select: { id: true, name: true } },
        comments: {
          include: {
            replies: { orderBy: { createdAt: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!post) throw new NotFoundException('Social post not found');
    return post;
  }

  async create(dto: CreateSocialPostDto, userId: string, institutionId: string, institutionName: string) {
    return this.prisma.socialPost.create({
      data: {
        ...dto as any,
        author: institutionName,
        institutionName: institutionName,
        createdBy: userId,
        institutionId,
      },
    });
  }

  async update(id: string, dto: UpdateSocialPostDto) {
    await this.findOne(id);
    return this.prisma.socialPost.update({ where: { id }, data: dto as any });
  }

  async toggleLike(id: string, userId: string) {
    const post = await this.findOne(id);
    const likes: string[] = post.likes as string[];
    const idx = likes.indexOf(userId);
    if (idx > -1) likes.splice(idx, 1);
    else likes.push(userId);
    return this.prisma.socialPost.update({ where: { id }, data: { likes } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.socialPost.delete({ where: { id } });
  }

  async addComment(postId: string, dto: CreateCommentDto, userId: string, userName: string) {
    await this.findOne(postId);
    return this.prisma.socialComment.create({
      data: { postId, content: dto.content, author: userName, createdBy: userId },
    });
  }

  async replyToComment(postId: string, commentId: string, dto: CreateReplyDto, userId: string, userName: string) {
    const comment = await this.prisma.socialComment.findFirst({
      where: { id: commentId, postId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return this.prisma.socialReply.create({
      data: { commentId, content: dto.content, author: userName, createdBy: userId },
    });
  }

  async deleteComment(postId: string, commentId: string) {
    const comment = await this.prisma.socialComment.findFirst({
      where: { id: commentId, postId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.prisma.socialComment.delete({ where: { id: commentId } });
  }
}

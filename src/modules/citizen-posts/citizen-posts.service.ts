import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCitizenPostDto, UpdateCitizenPostDto, ReportPostDto, CreateCommentDto, UpdateCommentDto, CreateReplyDto } from './citizen-posts.dto';

@Injectable()
export class CitizenPostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number; limit?: number; category?: string; urgency?: string; city?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.urgency) where.urgency = query.urgency;
    if (query.city) {
      where.location = { path: ['city'], equals: query.city };
    }

    const [data, total] = await Promise.all([
      this.prisma.citizenPost.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.citizenPost.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.citizenPost.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        comments: {
          include: {
            createdBy: { select: { id: true, name: true, avatar: true } },
            replies: {
              include: { createdBy: { select: { id: true, name: true, avatar: true } } },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        incident: {
          include: { institution: { select: { id: true, name: true } } },
        },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async create(dto: CreateCitizenPostDto, userId: string) {
    const post = await this.prisma.citizenPost.create({
      data: {
        caption: dto.caption,
        category: dto.category,
        location: dto.location as any,
        media: dto.media as any,
        createdById: userId,
      },
    });

    await this.prisma.citizenProfile.update({
      where: { id: userId },
      data: { postsCount: { increment: 1 } },
    });

    await this.autoAssignIncident(post);

    return this.findOne(post.id);
  }

  private async autoAssignIncident(post: any) {
    try {
      const location = post.location as any;
      if (!location || !location.city) return;

      const coverageAreas = await this.prisma.coverageArea.findMany({
        where: { status: 'active' },
        include: { institution: { select: { id: true, name: true } } },
      });

      const matchedArea = coverageAreas.find((area) => {
        const coverage = area.coverage as any[];
        if (!coverage) return false;
        return coverage.some(
          (c) =>
            c.cityName?.toLowerCase() === location.city?.toLowerCase() &&
            c.provinceName?.toLowerCase() === location.province?.toLowerCase(),
        );
      });

      if (matchedArea) {
        await this.prisma.incident.create({
          data: {
            type: post.category || 'other',
            location: location.address || location.city || 'Unknown',
            reporter: 'Citizen Report',
            description: post.caption,
            media: post.media,
            source: 'CITIZEN',
            status: 'PENDING',
            severity: 'MEDIUM',
            institutionId: matchedArea.institutionId,
            citizenPostId: post.id,
          },
        });

        await this.prisma.citizenPost.update({
          where: { id: post.id },
          data: { assignedInstitution: matchedArea.institution.name },
        });
      }
    } catch (error) {
      console.error('Auto-assign error:', error);
    }
  }

  async update(id: string, dto: UpdateCitizenPostDto, userId: string) {
    const post = await this.findOne(id);
    if (post.createdById !== userId) {
      throw new ForbiddenException('Not your post');
    }
    return this.prisma.citizenPost.update({ where: { id }, data: dto as any });
  }

  async remove(id: string, userId: string, userRole: string) {
    const post = await this.findOne(id);
    if (post.createdById !== userId && userRole === 'CITIZEN') {
      throw new ForbiddenException('Not your post');
    }
    await this.prisma.citizenPost.delete({ where: { id } });
  }

  async toggleUpvote(id: string, userId: string) {
    const post = await this.findOne(id);
    const upvotes: string[] = post.upvotes as string[];
    const idx = upvotes.indexOf(userId);
    if (idx > -1) upvotes.splice(idx, 1);
    else upvotes.push(userId);
    return this.prisma.citizenPost.update({ where: { id }, data: { upvotes } });
  }

  async toggleUrgent(id: string, userId: string) {
    const post = await this.findOne(id);
    const urgentVotes: string[] = post.urgentVotes as string[];
    const idx = urgentVotes.indexOf(userId);
    if (idx > -1) urgentVotes.splice(idx, 1);
    else urgentVotes.push(userId);
    return this.prisma.citizenPost.update({ where: { id }, data: { urgentVotes } });
  }

  async report(id: string, dto: ReportPostDto, userId: string) {
    await this.findOne(id);
    return this.prisma.hoaxReport.create({
      data: { postId: id, reason: dto.reason, reportedBy: userId },
    });
  }

  async getComments(postId: string) {
    await this.findOne(postId);
    return this.prisma.citizenComment.findMany({
      where: { postId },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        replies: {
          include: { createdBy: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addComment(postId: string, dto: CreateCommentDto, userId: string) {
    await this.findOne(postId);
    return this.prisma.citizenComment.create({
      data: { postId, content: dto.content, createdById: userId },
      include: { createdBy: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async updateComment(postId: string, commentId: string, dto: UpdateCommentDto, userId: string) {
    const comment = await this.prisma.citizenComment.findFirst({
      where: { id: commentId, postId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.createdById !== userId) throw new ForbiddenException('Not your comment');
    return this.prisma.citizenComment.update({
      where: { id: commentId },
      data: { content: dto.content },
    });
  }

  async deleteComment(postId: string, commentId: string, userId: string, userRole: string) {
    const comment = await this.prisma.citizenComment.findFirst({
      where: { id: commentId, postId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.createdById !== userId && userRole === 'CITIZEN') {
      throw new ForbiddenException('Not your comment');
    }
    await this.prisma.citizenComment.delete({ where: { id: commentId } });
  }

  async replyToComment(postId: string, commentId: string, dto: CreateReplyDto, userId: string) {
    const comment = await this.prisma.citizenComment.findFirst({
      where: { id: commentId, postId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return this.prisma.citizenReply.create({
      data: { commentId, content: dto.content, createdById: userId },
      include: { createdBy: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async deleteReply(postId: string, commentId: string, replyId: string, userId: string, userRole: string) {
    const reply = await this.prisma.citizenReply.findFirst({
      where: { id: replyId, commentId },
    });
    if (!reply) throw new NotFoundException('Reply not found');
    if (reply.createdById !== userId && userRole === 'CITIZEN') {
      throw new ForbiddenException('Not your reply');
    }
    await this.prisma.citizenReply.delete({ where: { id: replyId } });
  }
}

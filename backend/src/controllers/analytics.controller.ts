import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { LinkRepository } from '../repositories/link.repository';

const analyticsService = new AnalyticsService();
const linkRepository = new LinkRepository();

export class AnalyticsController {
  async getGlobalStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const period = (req.query.period as any) || '7d';

      if (!['24h', '7d', '30d', 'all'].includes(period)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid period parameter. Allowed values: 24h, 7d, 30d, all',
        });
      }

      const stats = await analyticsService.getGlobalStats(userId, period);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  async getLinkStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { linkId } = req.params;
      const period = (req.query.period as any) || '7d';

      if (!['24h', '7d', '30d', 'all'].includes(period)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid period parameter. Allowed values: 24h, 7d, 30d, all',
        });
      }

      const stats = await analyticsService.getLinkStats(linkId, userId, period);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  async getPublicStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { shortCode } = req.params;

      const link = await linkRepository.findByShortCode(shortCode);
      if (!link) {
        return res.status(404).json({
          success: false,
          error: 'Link not found or has been deleted',
        });
      }

      // Query analytics stats (restricted metadata: clicks and timeline trend only)
      const fullStats = await analyticsService.getLinkStats(link.id, link.userId, 'all');

      return res.status(200).json({
        success: true,
        data: {
          link: {
            shortCode: link.shortCode,
            originalUrl: link.originalUrl,
            createdAt: link.createdAt,
          },
          stats: {
            totalClicks: fullStats.totalClicks,
            timeline: fullStats.timeline,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

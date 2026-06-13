import { Request, Response, NextFunction } from 'express';
import { LinkService } from '../services/link.service';

const linkService = new LinkService();

export class LinkController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { originalUrl, customAlias, categoryId, expiresAt } = req.body;
      const link = await linkService.shortenLink(userId, originalUrl, customAlias, categoryId, expiresAt);
      
      return res.status(201).json({
        success: true,
        data: link,
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      
      // Query parameters are pre-parsed/coerced by validation middleware
      const { page, limit, search, categoryId, isArchived, isActive, isFavorite, sortBy, sortOrder } = req.query as any;

      const filters = { userId, search, categoryId, isArchived, isActive, isFavorite };
      const pagination = { page, limit };
      const sort = { sortBy, sortOrder };

      const result = await linkService.getLinks(filters, pagination, sort);

      return res.status(200).json({
        success: true,
        data: result.links,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const link = await linkService.getLinkById(id, userId);

      return res.status(200).json({
        success: true,
        data: link,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      
      const link = await linkService.updateLink(id, userId, req.body);

      return res.status(200).json({
        success: true,
        data: link,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      
      await linkService.deleteLink(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Link soft-deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await linkService.toggleFavorite(userId, id);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async exportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      // Resolve running host or use client base URL
      const hostUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
      
      const csvContent = await linkService.exportToCSV(userId, hostUrl);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=linkforge_links.csv');
      return res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  async importCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { csvText } = req.body;

      if (!csvText) {
        return res.status(400).json({
          success: false,
          error: 'csvText parameter containing raw CSV string is required',
        });
      }

      const result = await linkService.importFromCSV(userId, csvText);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

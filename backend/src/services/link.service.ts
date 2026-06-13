import { LinkRepository, LinkFilters, PaginationParams, SortParams } from '../repositories/link.repository';
import { FavoriteRepository } from '../repositories/favorite.repository';
import { generateRandomCode, isValidAlias } from '../utils/shortcode';
import { parseCSV, generateCSV } from '../utils/csv';

export class LinkService {
  private linkRepository = new LinkRepository();
  private favoriteRepository = new FavoriteRepository();

  async shortenLink(
    userId: string,
    originalUrl: string,
    customAlias?: string,
    categoryId?: string | null,
    expiresAt?: Date | null
  ) {
    // 1. Clean and validate URL
    let formattedUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'http://' + formattedUrl;
    }

    try {
      new URL(formattedUrl);
    } catch {
      throw new Error('Invalid URL format');
    }

    let shortCode = '';

    // 2. Custom Alias check or generate random code
    if (customAlias) {
      const alias = customAlias.trim();
      if (!isValidAlias(alias)) {
        throw new Error('Alias must be 3-30 characters long and contain only letters, numbers, dashes, and underscores');
      }

      // Check collision
      const existing = await this.linkRepository.findByShortCode(alias);
      if (existing) {
        throw new Error('This custom alias is already taken');
      }
      shortCode = alias;
    } else {
      // Retries logic for random base62 conflicts
      let attempts = 0;
      const maxAttempts = 5;
      while (attempts < maxAttempts) {
        const candidate = generateRandomCode(6);
        const existing = await this.linkRepository.findByShortCode(candidate);
        if (!existing) {
          shortCode = candidate;
          break;
        }
        attempts++;
      }

      if (!shortCode) {
        throw new Error('Server busy, failed to generate unique short code. Please try again.');
      }
    }

    // 3. Create the database record
    return this.linkRepository.create({
      originalUrl: formattedUrl,
      shortCode,
      userId,
      categoryId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
  }

  async getLinks(filters: LinkFilters, pagination: PaginationParams, sort: SortParams) {
    return this.linkRepository.findAll(filters, pagination, sort);
  }

  async getLinkById(id: string, userId: string) {
    const link = await this.linkRepository.findById(id, userId);
    if (!link) {
      throw new Error('Link not found');
    }
    return link;
  }

  async updateLink(
    id: string,
    userId: string,
    data: {
      originalUrl?: string;
      title?: string;
      description?: string;
      categoryId?: string | null;
      expiresAt?: Date | null;
      isActive?: boolean;
      isArchived?: boolean;
    }
  ) {
    // Check ownership
    const link = await this.linkRepository.findById(id, userId);
    if (!link) {
      throw new Error('Link not found or permission denied');
    }

    const updateData: any = { ...data };

    if (data.originalUrl) {
      let formattedUrl = data.originalUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'http://' + formattedUrl;
      }
      try {
        new URL(formattedUrl);
        updateData.originalUrl = formattedUrl;
      } catch {
        throw new Error('Invalid URL format');
      }
    }

    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    }

    return this.linkRepository.update(id, userId, updateData);
  }

  async deleteLink(id: string, userId: string) {
    // Check ownership
    const link = await this.linkRepository.findById(id, userId);
    if (!link) {
      throw new Error('Link not found or permission denied');
    }
    await this.linkRepository.softDelete(id, userId);
    return true;
  }

  async toggleFavorite(userId: string, linkId: string) {
    const link = await this.linkRepository.findById(linkId, userId);
    if (!link) {
      throw new Error('Link not found');
    }

    const isFav = await this.favoriteRepository.isFavorite(userId, linkId);
    if (isFav) {
      await this.favoriteRepository.remove(userId, linkId);
      return { favorited: false };
    } else {
      await this.favoriteRepository.add(userId, linkId);
      return { favorited: true };
    }
  }

  async exportToCSV(userId: string, hostUrl: string): Promise<string> {
    const { links } = await this.linkRepository.findAll(
      { userId },
      { page: 1, limit: 10000 },
      { sortBy: 'createdAt', sortOrder: 'desc' }
    );

    const exportRows = links.map(link => {
      const isFav = link.favorites.length > 0;
      return {
        'Original URL': link.originalUrl,
        'Short URL': `${hostUrl}/${link.shortCode}`,
        'Short Code': link.shortCode,
        'Title': link.title || '',
        'Description': link.description || '',
        'Category': link.category ? link.category.name : '',
        'Total Clicks': link._count.analytics,
        'Active': link.isActive ? 'Yes' : 'No',
        'Archived': link.isArchived ? 'Yes' : 'No',
        'Favorite': isFav ? 'Yes' : 'No',
        'Expires At': link.expiresAt ? link.expiresAt.toISOString() : 'Never',
        'Created Date': link.createdAt.toISOString(),
      };
    });

    return generateCSV(exportRows);
  }

  async importFromCSV(userId: string, csvText: string) {
    const rows = parseCSV(csvText);
    const results: { imported: number; failures: { row: number; url: string; reason: string }[] } = {
      imported: 0,
      failures: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const url = row['originalUrl'] || row['Original URL'] || row['url'] || row['URL'];
      const customAlias = row['customAlias'] || row['Custom Alias'] || row['alias'] || row['Alias'];
      const categoryId = row['categoryId'] || row['Category ID'];

      if (!url) {
        results.failures.push({
          row: i + 2, // 1-indexed, skipping header
          url: '',
          reason: 'Missing URL column (expected: originalUrl or Original URL)',
        });
        continue;
      }

      try {
        await this.shortenLink(
          userId,
          url,
          customAlias ? customAlias : undefined,
          categoryId ? categoryId : null,
          null
        );
        results.imported++;
      } catch (err: any) {
        results.failures.push({
          row: i + 2,
          url,
          reason: err.message || 'Unknown error',
        });
      }
    }

    return results;
  }
}

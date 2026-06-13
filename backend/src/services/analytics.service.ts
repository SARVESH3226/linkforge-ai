import { AnalyticsRepository } from '../repositories/analytics.repository';
import { parseRequestDetails } from '../utils/geo';

export class AnalyticsService {
  private analyticsRepository = new AnalyticsRepository();

  async logRedirect(linkId: string, userAgent: string, ipAddress: string, referrer?: string) {
    try {
      const parsedDetails = parseRequestDetails(userAgent || '', ipAddress || '127.0.0.1');

      await this.analyticsRepository.logClick({
        linkId,
        device: parsedDetails.device,
        browser: parsedDetails.browser,
        os: parsedDetails.os,
        referrer: referrer || null,
        country: parsedDetails.country,
        city: parsedDetails.city,
        ipHash: parsedDetails.ipHash,
      });
    } catch (err) {
      // Background analytics fail should never crash the core application or redirect flow
      console.error('Failed to log redirection analytics:', err);
    }
  }

  async getGlobalStats(userId: string, period: '24h' | '7d' | '30d' | 'all') {
    return this.analyticsRepository.getGlobalStats(userId, period);
  }

  async getLinkStats(linkId: string, userId: string, period: '24h' | '7d' | '30d' | 'all') {
    return this.analyticsRepository.getLinkStats(linkId, userId, period);
  }
}

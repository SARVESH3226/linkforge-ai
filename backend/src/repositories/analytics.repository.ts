import prisma from '../config/db';

export interface LogClickData {
  linkId: string;
  device: string;
  browser: string;
  os: string;
  referrer?: string | null;
  country?: string | null;
  city?: string | null;
  ipHash: string;
}

export class AnalyticsRepository {
  async logClick(data: LogClickData) {
    return prisma.analytics.create({
      data,
    });
  }

  async getGlobalStats(userId: string, period: '24h' | '7d' | '30d' | 'all') {
    const dateLimit = this.getDateLimit(period);

    // Dynamic where clause matching user links
    const whereClause: any = {
      link: {
        userId,
        deletedAt: null,
      },
      deletedAt: null,
    };

    if (dateLimit) {
      whereClause.timestamp = {
        gte: dateLimit,
      };
    }

    return this.aggregateStats(whereClause);
  }

  async getLinkStats(linkId: string, userId: string, period: '24h' | '7d' | '30d' | 'all') {
    const dateLimit = this.getDateLimit(period);

    const whereClause: any = {
      linkId,
      link: {
        userId,
        deletedAt: null,
      },
      deletedAt: null,
    };

    if (dateLimit) {
      whereClause.timestamp = {
        gte: dateLimit,
      };
    }

    return this.aggregateStats(whereClause);
  }

  private getDateLimit(period: '24h' | '7d' | '30d' | 'all'): Date | null {
    const now = new Date();
    switch (period) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'all':
      default:
        return null;
    }
  }

  private async aggregateStats(where: any) {
    // 1. Fetch total click count
    const totalClicks = await prisma.analytics.count({ where });

    // 2. Fetch unique visitors
    const uniqueVisitorsResult = await prisma.analytics.groupBy({
      by: ['ipHash'],
      where,
      _count: true,
    });
    const uniqueVisitors = uniqueVisitorsResult.length;

    // 3. Last visit timestamp
    const lastVisitResult = await prisma.analytics.findFirst({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        timestamp: true,
      },
    });
    const lastVisited = lastVisitResult ? lastVisitResult.timestamp : null;

    // 4. Group by Country
    const countries = await prisma.analytics.groupBy({
      by: ['country'],
      where,
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          country: 'desc',
        },
      },
      take: 10,
    });

    // 5. Group by Browser
    const browsers = await prisma.analytics.groupBy({
      by: ['browser'],
      where,
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          browser: 'desc',
        },
      },
      take: 10,
    });

    // 6. Group by Device
    const devices = await prisma.analytics.groupBy({
      by: ['device'],
      where,
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          device: 'desc',
        },
      },
      take: 10,
    });

    // 7. Group by OS
    const osBreakdown = await prisma.analytics.groupBy({
      by: ['os'],
      where,
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          os: 'desc',
        },
      },
      take: 10,
    });

    // 8. Recent visits table
    const recentVisits = await prisma.analytics.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: 15,
      include: {
        link: {
          select: {
            shortCode: true,
            originalUrl: true,
          },
        },
      },
    });

    // 9. Clicks timeline (Trends)
    // To make it highly database-independent, we load timestamps of the matching clicks
    // and group them in JavaScript, since Neon (Serverless Postgres) and local DB versions might have zone formats.
    // However, loading millions of records is bad. But since this is a 30d/7d period, it's efficient enough.
    // For large volumes, we fetch count grouped by day-month.
    // Let's query date truncation or custom DB query fallback.
    // Let's do raw aggregation by fetching count grouped by timestamp. To keep it fast, we can select timestamp.
    const clicksTimeline = await prisma.analytics.findMany({
      where,
      select: {
        timestamp: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return {
      totalClicks,
      uniqueVisitors,
      lastVisited,
      countries: countries.map((c) => ({ name: c.country || 'Unknown', value: c._count._all })),
      browsers: browsers.map((b) => ({ name: b.browser || 'Unknown', value: b._count._all })),
      devices: devices.map((d) => ({ name: d.device || 'Unknown', value: d._count._all })),
      osBreakdown: osBreakdown.map((o) => ({ name: o.os || 'Unknown', value: o._count._all })),
      recentVisits,
      timeline: this.formatTimeline(clicksTimeline),
    };
  }

  private formatTimeline(records: { timestamp: Date }[]) {
    const counts: { [key: string]: number } = {};

    records.forEach((rec) => {
      // Format to YYYY-MM-DD
      const dateStr = rec.timestamp.toISOString().split('T')[0];
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });

    return Object.keys(counts).map((date) => ({
      date,
      clicks: counts[date],
    }));
  }
}

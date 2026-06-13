import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records (in reverse order of foreign keys)
  await prisma.session.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.link.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create default user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'dev@linkforge.ai',
      fullName: 'Dev Sandbox',
      passwordHash,
    },
  });
  console.log(`👤 Created user: ${user.email}`);

  // 3. Create categories
  const catMarketing = await prisma.category.create({
    data: {
      name: 'Marketing Campaigns',
      color: '#8b5cf6', // Violet
      userId: user.id,
    },
  });

  const catSocial = await prisma.category.create({
    data: {
      name: 'Social Sharing',
      color: '#10b981', // Emerald
      userId: user.id,
    },
  });

  const catInternal = await prisma.category.create({
    data: {
      name: 'Internal Tools',
      color: '#3b82f6', // Blue
      userId: user.id,
    },
  });
  console.log('🏷️ Created categories');

  // 4. Create links
  const linksData = [
    {
      originalUrl: 'https://github.com/google/antigravity',
      shortCode: 'antigrav',
      title: 'Google Antigravity GitHub',
      description: 'Main open-source repository for antigravity frameworks.',
      categoryId: catInternal.id,
    },
    {
      originalUrl: 'https://news.ycombinator.com',
      shortCode: 'hn-top',
      title: 'Hacker News Homepage',
      description: 'Tech startup news aggregator aggregator link.',
      categoryId: catSocial.id,
    },
    {
      originalUrl: 'https://stripe.com/docs/billing',
      shortCode: 'stripe-bill',
      title: 'Stripe Billing API Docs',
      description: 'Official API integration references for checkout subscriptions.',
      categoryId: catMarketing.id,
    },
    {
      originalUrl: 'https://vercel.com/dashboard',
      shortCode: 'v-dash',
      title: 'Vercel Deployment Dashboard',
      description: 'Hosting dashboard for Next.js and Vite builds.',
      categoryId: catInternal.id,
    },
    {
      originalUrl: 'https://linear.app',
      shortCode: 'linear',
      title: 'Linear Issue Tracking',
      description: 'High performance task management tool used by teams.',
      categoryId: null,
    },
  ];

  const createdLinks = [];
  for (const item of linksData) {
    const link = await prisma.link.create({
      data: {
        originalUrl: item.originalUrl,
        shortCode: item.shortCode,
        title: item.title,
        description: item.description,
        userId: user.id,
        categoryId: item.categoryId,
      },
    });
    createdLinks.push(link);
    console.log(`🔗 Created shortlink: /${link.shortCode}`);
  }

  // 5. Generate mock analytics logs
  const devices = ['Mobile', 'Desktop', 'Tablet', 'Smart TV'];
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Brave'];
  const operatingSystems = ['iOS', 'Android', 'macOS', 'Windows', 'Linux'];
  const countries = ['United States', 'India', 'United Kingdom', 'Germany', 'Canada', 'Singapore', 'Australia', 'Japan'];
  const cities: Record<string, string[]> = {
    'United States': ['San Francisco', 'New York', 'Seattle', 'Austin'],
    'India': ['Bengaluru', 'Mumbai', 'New Delhi', 'Hyderabad'],
    'United Kingdom': ['London', 'Manchester', 'Edinburgh'],
    'Germany': ['Berlin', 'Munich', 'Frankfurt'],
    'Canada': ['Toronto', 'Vancouver', 'Montreal'],
    'Singapore': ['Singapore'],
    'Australia': ['Sydney', 'Melbourne'],
    'Japan': ['Tokyo', 'Osaka'],
  };
  const referrers = ['https://t.co', 'https://linkedin.com', 'https://github.com', 'https://news.ycombinator.com', 'Direct', 'https://google.com'];

  // Add random analytics spread across 30 days
  const now = new Date();
  let clicksCounter = 0;

  for (const link of createdLinks) {
    // Determine target clicks based on link popularity
    const baseClicks = link.shortCode === 'antigrav' ? 80 : link.shortCode === 'hn-top' ? 45 : 20;

    for (let day = 0; day < 30; day++) {
      // Days ago
      const dayDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
      
      // Random click volume for this day
      const dailyClicksCount = Math.floor(Math.random() * (baseClicks / 5)) + 1;

      for (let c = 0; c < dailyClicksCount; c++) {
        // Random hour of the day
        const timestamp = new Date(dayDate.getTime());
        timestamp.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

        const country = countries[Math.floor(Math.random() * countries.length)];
        const countryCities = cities[country] || ['Unknown'];
        const city = countryCities[Math.floor(Math.random() * countryCities.length)];
        const device = devices[Math.floor(Math.random() * devices.length)];
        const browser = browsers[Math.floor(Math.random() * browsers.length)];
        const os = operatingSystems[Math.floor(Math.random() * operatingSystems.length)];
        const referrer = referrers[Math.floor(Math.random() * referrers.length)];

        // Generate fake IP hash
        const fakeIp = `192.168.1.${Math.floor(Math.random() * 254)}`;
        const ipHash = crypto.createHash('sha256').update(fakeIp + 'salt').digest('hex');

        await prisma.analytics.create({
          data: {
            linkId: link.id,
            timestamp,
            device,
            browser,
            os,
            referrer: referrer === 'Direct' ? null : referrer,
            country,
            city,
            ipHash,
          },
        });
        clicksCounter++;
      }
    }
  }

  // 6. Create a favorite record
  await prisma.favorite.create({
    data: {
      userId: user.id,
      linkId: createdLinks[0].id,
    },
  });

  console.log(`✅ DB Seeding successfully completed. Injected ${createdLinks.length} URLs and ${clicksCounter} analytic log items.`);
}

import crypto from 'crypto';

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

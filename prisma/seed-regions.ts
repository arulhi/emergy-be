import { PrismaClient } from '@prisma/client';
import * as http from 'http';
import * as https from 'https';

const prisma = new PrismaClient();

const API_BASE = 'http://www.emsifa.com/api-wilayah-indonesia/api';

interface ApiCity {
  id: string;
  province_id: string;
  name: string;
}

interface ApiDistrict {
  id: string;
  regency_id: string;
  name: string;
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function fetchJson(url: string): Promise<any> {
  const mod = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    mod
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
          const loc = res.headers.location;
          if (loc) {
            fetchJson(loc).then(resolve).catch(reject);
            return;
          }
        }
        let data = '';
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        });
      })
      .on('error', reject);
  });
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchJson(url);
    } catch {
      if (i === retries - 1) return null;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return null;
}

async function main() {
  console.log('Fetching and seeding cities & districts...\n');

  const provinces = await prisma.province.findMany({ orderBy: { id: 'asc' } });
  console.log(`Found ${provinces.length} provinces\n`);

  let totalCities = 0;
  let totalDistricts = 0;

  for (const province of provinces) {
    const cities = await fetchWithRetry(
      `${API_BASE}/regencies/${province.id}.json`,
    );

    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      console.log(`  ${province.id} ${province.name}: SKIP (no data from API)`);
      continue;
    }

    for (const city of cities) {
      await prisma.city.upsert({
        where: { id: city.id },
        update: { name: toTitleCase(city.name), provinceId: city.province_id },
        create: { id: city.id, name: toTitleCase(city.name), provinceId: city.province_id },
      });
      totalCities++;

      const districts = await fetchWithRetry(
        `${API_BASE}/districts/${city.id}.json`,
      );

      if (!districts || !Array.isArray(districts)) continue;

      for (const district of districts) {
        await prisma.district.upsert({
          where: { id: district.id },
          update: { name: toTitleCase(district.name), cityId: district.regency_id },
          create: { id: district.id, name: toTitleCase(district.name), cityId: district.regency_id },
        });
        totalDistricts++;
      }
    }

    console.log(`  ${province.id} ${province.name}: ${cities.length} cities`);
  }

  console.log(`\nDone! ${totalCities} cities, ${totalDistricts} districts seeded.`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

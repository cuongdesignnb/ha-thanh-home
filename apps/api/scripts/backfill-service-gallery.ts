import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany({
    where: { contentHtml: { not: null } },
    select: { id: true, title: true, contentHtml: true, galleryMediaIds: true, thumbnailMediaId: true },
  });

  console.log(`Found ${services.length} services with contentHtml`);

  let updated = 0;
  for (const svc of services) {
    if (svc.galleryMediaIds && Array.isArray(svc.galleryMediaIds) && (svc.galleryMediaIds as unknown[]).length > 0) continue;

    const html = svc.contentHtml || "";
    const urls = new Set<string>();
    const re = /<img[^>]+src=["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      if (m[1]) urls.add(m[1]);
    }
    if (!urls.size) continue;

    const medias = await prisma.mediaFile.findMany({
      where: { OR: Array.from(urls).map((u) => ({ webpUrl: u })) },
      select: { id: true, webpUrl: true },
    });

    const ids = medias.map((m) => m.id);
    if (!ids.length) continue;

    await prisma.service.update({
      where: { id: svc.id },
      data: { galleryMediaIds: ids },
    });
    updated++;
    if (updated % 20 === 0) console.log(`  updated ${updated} so far...`);
  }

  console.log(`Done. Updated ${updated} services with gallery IDs.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });

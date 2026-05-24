import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting cleanup of duplicate ProjectFilterOption rows...");

  // 1. Fetch all project filter options
  const allOptions = await prisma.projectFilterOption.findMany({
    orderBy: { id: "asc" },
  });

  console.log(`Total options in DB: ${allOptions.length}`);

  // 2. Identify duplicates
  // Group by key: `${module}-${group}-${type}-${name.toLowerCase().trim()}`
  const groups = new Map<string, typeof allOptions>();

  for (const option of allOptions) {
    const key = `${option.module || "project"}-${option.group}-${option.type}-${option.name.trim().toLowerCase()}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(option);
  }

  let deletedCount = 0;
  
  // 3. For each group with more than 1 option, keep the first one and delete the rest
  for (const [key, list] of groups.entries()) {
    if (list.length > 1) {
      const keep = list[0];
      const duplicates = list.slice(1);
      
      console.log(`Duplicate found for key "${key}":`);
      console.log(`  Keeping ID: ${keep.id} (Name: "${keep.name}", Slug: "${keep.slug}")`);
      
      for (const dup of duplicates) {
        console.log(`  Deleting ID: ${dup.id} (Name: "${dup.name}", Slug: "${dup.slug}")`);
        await prisma.projectFilterOption.delete({
          where: { id: dup.id },
        });
        deletedCount++;
      }
    }
  }

  console.log(`Cleanup complete! Deleted ${deletedCount} duplicate option(s).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Cleanup failed:", e);
  process.exit(1);
});

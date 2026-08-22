import { seedDemoData } from "../lib/seed-data";
import { db } from "../lib/db";

async function main() {
  console.log("Seeding demo data for CareerCopilot AI...");
  const user = await seedDemoData();
  console.log(`Successfully seeded demo data for user: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

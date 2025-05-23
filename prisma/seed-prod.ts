import { prisma } from '#app/utils/db.server.ts'

async function seed() {
  console.log('🌱 Seeding...')
  console.time(`🌱 Prod database has been seeded`)

  console.time("👤 Creating roles")

  await prisma.role.createMany({
    data: [
      { name: "user" },
      { name: "admin" },
    ]
  })

  console.timeEnd("👤 Creating roles")


  console.timeEnd(`🌱 Prod database has been seeded`)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// we're ok to import from the test directory in this file
/*
eslint
  no-restricted-imports: "off",
*/

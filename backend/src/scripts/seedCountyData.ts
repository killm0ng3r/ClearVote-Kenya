import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface CountyData {
  county_code: number
  county_name: string
  constituencies: {
    constituency_name: string
    wards: string[]
  }[]
}

async function seedCountyData() {
  try {
    console.log('Starting county data seeding...')
    
    // Read the county data from the JSON file
    const countyDataPath = path.join(__dirname, '../../../county.json')
    const countyDataRaw = fs.readFileSync(countyDataPath, 'utf-8')
    const countyData: CountyData[] = JSON.parse(countyDataRaw)
    
    console.log(`Found ${countyData.length} counties to seed`)
    
    for (const county of countyData) {
      console.log(`Seeding county: ${county.county_name}`)
      
      // Create county
      const createdCounty = await prisma.county.upsert({
        where: { id: county.county_code },
        update: {
          name: county.county_name,
          code: county.county_code
        },
        create: {
          id: county.county_code,
          name: county.county_name,
          code: county.county_code
        }
      })
      
      // Create constituencies and wards
      for (const constituency of county.constituencies) {
        console.log(`  Seeding constituency: ${constituency.constituency_name}`)
        
        const createdConstituency = await prisma.constituency.upsert({
          where: {
            name_countyId: {
              name: constituency.constituency_name,
              countyId: createdCounty.id
            }
          },
          update: {
            name: constituency.constituency_name,
            countyId: createdCounty.id
          },
          create: {
            name: constituency.constituency_name,
            countyId: createdCounty.id
          }
        })
        
        // Create wards
        for (const wardName of constituency.wards) {
          const cleanWardName = wardName.trim()
          if (cleanWardName) {
            console.log(`    Seeding ward: ${cleanWardName}`)
            
            await prisma.ward.upsert({
              where: {
                name_constituencyId: {
                  name: cleanWardName,
                  constituencyId: createdConstituency.id
                }
              },
              update: {
                name: cleanWardName,
                constituencyId: createdConstituency.id
              },
              create: {
                name: cleanWardName,
                constituencyId: createdConstituency.id
              }
            })
          }
        }
      }
    }
    
    console.log('County data seeding completed successfully!')
    
    // Print summary
    const countyCount = await prisma.county.count()
    const constituencyCount = await prisma.constituency.count()
    const wardCount = await prisma.ward.count()
    
    console.log(`Summary:`)
    console.log(`- Counties: ${countyCount}`)
    console.log(`- Constituencies: ${constituencyCount}`)
    console.log(`- Wards: ${wardCount}`)
    
  } catch (error) {
    console.error('Error seeding county data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedCountyData()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}

export default seedCountyData
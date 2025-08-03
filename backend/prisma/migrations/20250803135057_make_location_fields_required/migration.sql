/*
  Warnings:

  - Made the column `constituencyId` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `countyId` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `wardId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- First, update any NULL values with default location data
-- Get the first constituency and ward from Nairobi County (ID: 47)
UPDATE "User" SET
  "countyId" = 47
WHERE "countyId" IS NULL;

UPDATE "User" SET
  "constituencyId" = (
    SELECT "id" FROM "Constituency"
    WHERE "countyId" = 47
    LIMIT 1
  )
WHERE "constituencyId" IS NULL;

UPDATE "User" SET
  "wardId" = (
    SELECT "Ward"."id" FROM "Ward"
    INNER JOIN "Constituency" ON "Ward"."constituencyId" = "Constituency"."id"
    WHERE "Constituency"."countyId" = 47
    LIMIT 1
  )
WHERE "wardId" IS NULL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VOTER',
    "countyId" INTEGER NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "wardId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "Constituency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("constituencyId", "countyId", "createdAt", "email", "id", "name", "password", "role", "updatedAt", "wardId") SELECT "constituencyId", "countyId", "createdAt", "email", "id", "name", "password", "role", "updatedAt", "wardId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

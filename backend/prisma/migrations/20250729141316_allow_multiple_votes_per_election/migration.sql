-- DropIndex
DROP INDEX "Vote_voterId_electionId_key";

-- CreateIndex
CREATE INDEX "Vote_voterId_electionId_idx" ON "Vote"("voterId", "electionId");

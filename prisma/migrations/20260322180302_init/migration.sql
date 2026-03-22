/*
  Warnings:

  - You are about to drop the column `navigationId` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `placementId` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Navigation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Placement` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `x` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `y` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `z` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
CREATE EXTENSION IF NOT EXISTS postgis;

-- DropForeignKey
ALTER TABLE "Navigation" DROP CONSTRAINT "Navigation_placementId_fkey";

-- DropForeignKey
ALTER TABLE "Navigation" DROP CONSTRAINT "Navigation_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_navigationId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_placementId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_adminId_fkey";

-- DropIndex
DROP INDEX "Node_navigationId_idx";

-- DropIndex
DROP INDEX "Node_placementId_idx";

-- DropIndex
DROP INDEX "Node_placementId_key";

-- DropIndex
DROP INDEX "Room_adminId_idx";

-- AlterTable
ALTER TABLE "Node" DROP COLUMN "navigationId",
DROP COLUMN "placementId",
ADD COLUMN     "x" INTEGER NOT NULL,
ADD COLUMN     "y" INTEGER NOT NULL,
ADD COLUMN     "z" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "adminId";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Navigation";

-- DropTable
DROP TABLE "Placement";

-- DropEnum
DROP TYPE "NavigationPreference";

-- CreateIndex
CREATE INDEX "Node_x_y_z_idx" ON "Node"("x", "y", "z");

-- Spatial indexes
CREATE INDEX "Room_pointZ_gist"
ON "Room"
USING GIST ("pointZ");

CREATE INDEX "Room_polygon_gist"
ON "Room"
USING GIST ("polygon");

CREATE INDEX "Room_multiPolygon_gist"
ON "Room"
USING GIST ("multiPolygon");
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('DEFAULT');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('DEFAULT');

-- CreateEnum
CREATE TYPE "NavigationPreference" AS ENUM ('DEFAULT', 'HANDICAP_FRIENDLY', 'SIMPLEST_ROUTE');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "z" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "isActivated" BOOLEAN NOT NULL DEFAULT true,
    "semanticNames" TEXT[],
    "type" "RoomType" NOT NULL,
    "pointZ" geometry(PointZ, 4326),
    "polygon" geometry(Polygon, 4326),
    "multiPolygon" geometry(MultiPolygon, 4326),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminId" INTEGER NOT NULL,
    "sectionId" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "type" "NodeType" NOT NULL,
    "isActivated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "placementId" TEXT,
    "roomId" TEXT,
    "navigationId" TEXT,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edge" (
    "id" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "doors" BOOLEAN NOT NULL DEFAULT false,
    "stairs" BOOLEAN NOT NULL DEFAULT false,
    "elevators" BOOLEAN NOT NULL DEFAULT false,
    "isActivated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Navigation" (
    "id" TEXT NOT NULL,
    "preference" "NavigationPreference" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roomId" TEXT NOT NULL,
    "placementId" TEXT,

    CONSTRAINT "Navigation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Section_name_key" ON "Section"("name");

-- CreateIndex
CREATE INDEX "Room_adminId_idx" ON "Room"("adminId");

-- CreateIndex
CREATE INDEX "Room_sectionId_idx" ON "Room"("sectionId");

-- CreateIndex
CREATE INDEX "Room_type_idx" ON "Room"("type");

-- CreateIndex
CREATE INDEX "Room_isActivated_idx" ON "Room"("isActivated");

-- CreateIndex
CREATE UNIQUE INDEX "Node_placementId_key" ON "Node"("placementId");

-- CreateIndex
CREATE INDEX "Node_placementId_idx" ON "Node"("placementId");

-- CreateIndex
CREATE INDEX "Node_roomId_idx" ON "Node"("roomId");

-- CreateIndex
CREATE INDEX "Node_navigationId_idx" ON "Node"("navigationId");

-- CreateIndex
CREATE INDEX "Node_type_idx" ON "Node"("type");

-- CreateIndex
CREATE INDEX "Node_isActivated_idx" ON "Node"("isActivated");

-- CreateIndex
CREATE INDEX "Edge_fromNodeId_idx" ON "Edge"("fromNodeId");

-- CreateIndex
CREATE INDEX "Edge_toNodeId_idx" ON "Edge"("toNodeId");

-- CreateIndex
CREATE INDEX "Edge_isActivated_idx" ON "Edge"("isActivated");

-- CreateIndex
CREATE UNIQUE INDEX "Edge_fromNodeId_toNodeId_key" ON "Edge"("fromNodeId", "toNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Navigation_placementId_key" ON "Navigation"("placementId");

-- CreateIndex
CREATE INDEX "Navigation_roomId_idx" ON "Navigation"("roomId");

-- CreateIndex
CREATE INDEX "Navigation_preference_idx" ON "Navigation"("preference");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_navigationId_fkey" FOREIGN KEY ("navigationId") REFERENCES "Navigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Navigation" ADD CONSTRAINT "Navigation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Navigation" ADD CONSTRAINT "Navigation_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Prevent self-loop edges
ALTER TABLE "Edge"
ADD CONSTRAINT "Edge_no_self_loop"
CHECK ("fromNodeId" <> "toNodeId");

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
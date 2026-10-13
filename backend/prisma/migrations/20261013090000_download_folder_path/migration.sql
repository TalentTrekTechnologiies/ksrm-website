-- A logical, slash-separated folder path for hierarchical document browsing.
-- Nullable so existing downloads retain their current page/group rendering
-- until an administrator files them into a folder.
ALTER TABLE "Download" ADD COLUMN "folderPath" TEXT;

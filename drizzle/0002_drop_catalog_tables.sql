-- Drop the foreign key constraints first
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_template_id_templates_id_fk";
ALTER TABLE "project_objects" DROP CONSTRAINT IF EXISTS "project_objects_object_id_object_catalog_id_fk";

-- Drop the tables (child tables first due to FK constraints)
DROP TABLE IF EXISTS "template_images";
DROP TABLE IF EXISTS "object_images";
DROP TABLE IF EXISTS "templates";
DROP TABLE IF EXISTS "object_catalog";

-- Drop the enums that are no longer used
DROP TYPE IF EXISTS "template_type";
DROP TYPE IF EXISTS "object_type";


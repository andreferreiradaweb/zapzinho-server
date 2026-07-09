-- AlterTable: add slug column (nullable first for backfill)
ALTER TABLE "Quiz" ADD COLUMN "slug" TEXT;

-- Backfill existing quizzes: slugify(name) + '-' + first 5 chars of publicToken (no hyphens)
UPDATE "Quiz" SET "slug" = (
  COALESCE(
    NULLIF(
      TRIM(BOTH '-' FROM
        REGEXP_REPLACE(
          LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9 ]', '', 'g')),
          '\s+', '-', 'g'
        )
      ),
    ''),
    'quiz'
  ) || '-' || SUBSTRING(REPLACE("publicToken", '-', ''), 1, 5)
);

-- Make not-null and unique
ALTER TABLE "Quiz" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_slug_key" UNIQUE ("slug");

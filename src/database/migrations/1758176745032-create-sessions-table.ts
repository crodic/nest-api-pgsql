import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionsTable1758176745032 implements MigrationInterface {
  name = 'CreateSessionsTable1758176745032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."sessions_user_enum" AS ENUM('AdminUserEntity', 'UserEntity')
        `);
    await queryRunner.query(`
            CREATE TABLE "sessions" (
                "id" BIGSERIAL NOT NULL,
                "hash" character varying(255) NOT NULL,
                "user_id" bigint NOT NULL,
                "user_type" "public"."sessions_user_enum" NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_by" character varying NOT NULL,
                CONSTRAINT "PK_session_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_sessions_user_id" ON "sessions" ("user_id")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_sessions_user_id"
        `);
    await queryRunner.query(`
            DROP TABLE "sessions"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."sessions_user_enum"
        `);
  }
}

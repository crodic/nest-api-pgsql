import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogTable1758254385488 implements MigrationInterface {
  name = 'CreateAuditLogTable1758254385488';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" BIGSERIAL NOT NULL,
        "entity" character varying NOT NULL,
        "entity_id" bigint,
        "action" character varying NOT NULL,
        "old_value" json,
        "new_value" json,
        "user_id" bigint,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_log_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_entity" ON "audit_logs" ("entity")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_entity_id" ON "audit_logs" ("entity_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_user_id" ON "audit_logs" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_entity_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_entity"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
  }
}

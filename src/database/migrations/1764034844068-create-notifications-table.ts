import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1764034844068
  implements MigrationInterface
{
  name = 'CreateNotificationsTable1764034844068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "notification-recipients" (
                "id" BIGSERIAL NOT NULL,
                "notification_id" bigint NOT NULL,
                "user_id" bigint NOT NULL,
                "is_read" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notification_recipient_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" BIGSERIAL NOT NULL,
                "actor_id" bigint,
                "title" character varying(255) NOT NULL,
                "message" text,
                "metadata" jsonb DEFAULT '{}',
                "type" character varying(50) NOT NULL DEFAULT 'system',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notification_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "notification-recipients"
            ADD CONSTRAINT "FK_recipient_notification_id" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "notification-recipients" DROP CONSTRAINT "FK_recipient_notification_id"
        `);
    await queryRunner.query(`
            DROP TABLE "notifications"
        `);
    await queryRunner.query(`
            DROP TABLE "notification-recipients"
        `);
  }
}

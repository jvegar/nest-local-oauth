import { MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';

export async function initializeSchema(orm: MikroORM) {
  const logger = new Logger('SchemaInitializer');

  try {
    const generator = orm.getSchemaGenerator();

    const updateDump = await generator.getUpdateSchemaSQL();

    if (updateDump.length > 0) {
      logger.log('Schema updates are needed. Checking existing schema...');

      const snapshot = await generator.getUpdateSchemaSQL({
        safe: true,
        wrap: true,
      });

      if (snapshot.length > 0) {
        logger.log('Applying safe schema updates...');

        await generator.updateSchema({
          safe: true,
          wrap: true,
          dropTables: false,
          dropDb: false,
        });

        logger.log('Schema has been updated successfully');
      }
    } else {
      logger.log('Schema is up to date');
    }
  } catch (error) {
    if (error.message.includes('already exists')) {
      logger.warn(
        'Some tables already exist. Continuing with application startup...',
      );
    } else {
      logger.error('Failed to initialize schema', error);
      throw error;
    }
  }
}

import { column, Schema, Table } from '@powersync/web';

export const users = new Table({
  name: column.text,
  createdAt: column.text,
  updatedAt: column.text
});

export const AppSchema = new Schema({
  users
});

export type Database = (typeof AppSchema)['types'];
export type User = Database['users'];

// src\lib\contactUsSchema.ts
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from "@vercel/postgres";
import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean
} from 'drizzle-orm/pg-core';

export const db = drizzle(sql);

export const ContactTable = pgTable(
  'contacts',
  {
    id: serial('id').primaryKey(),
    privacypolicy: boolean('privacypolicy').notNull(),
    createdat: timestamp('createdat', { withTimezone: false }).notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    firstname: text('firstname').notNull(),
    lastname: text('lastname').notNull(),
  }
);
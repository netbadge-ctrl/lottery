import { pgTable, serial, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// 彩票开奖数据表
export const lotteryResults = pgTable('lottery_results', {
  id: serial('id').primaryKey(),
  lotteryType: varchar('lottery_type', { length: 50 }).notNull(), // 'union_lotto' 或 'super_lotto'
  issueNumber: varchar('issue_number', { length: 20 }).notNull(),
  frontArea: jsonb('front_area').notNull(), // 前区号码数组
  backArea: jsonb('back_area').notNull(),   // 后区号码数组
  drawDate: timestamp('draw_date'),         // 开奖日期
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  // 创建复合索引以提高查询性能
  lotteryTypeIssueIdx: index('lottery_type_issue_idx').on(table.lotteryType, table.issueNumber),
  issueNumberIdx: index('issue_number_idx').on(table.issueNumber),
}));

// 导出类型
export type LotteryResult = typeof lotteryResults.$inferSelect;
export type InsertLotteryResult = typeof lotteryResults.$inferInsert;
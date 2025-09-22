import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../server/db';
import { lotteryResults, type LotteryResult, type InsertLotteryResult } from './schema';
import { LotteryType, type WinningNumbers } from '../../types';

// 数据库操作服务类
export class LotteryDatabaseService {
  
  // 保存开奖结果到数据库
  async saveLotteryResult(winningNumbers: WinningNumbers): Promise<LotteryResult> {
    const insertData: InsertLotteryResult = {
      lotteryType: winningNumbers.lotteryType,
      issueNumber: winningNumbers.issueNumber,
      frontArea: winningNumbers.front_area,
      backArea: winningNumbers.back_area,
      drawDate: new Date(),
      updatedAt: new Date()
    };

    // 先检查是否已存在
    const existing = await this.getLotteryResult(winningNumbers.lotteryType, winningNumbers.issueNumber);
    
    if (existing) {
      // 更新现有记录
      const [updated] = await db
        .update(lotteryResults)
        .set({
          frontArea: winningNumbers.front_area,
          backArea: winningNumbers.back_area,
          updatedAt: new Date()
        })
        .where(and(
          eq(lotteryResults.lotteryType, winningNumbers.lotteryType),
          eq(lotteryResults.issueNumber, winningNumbers.issueNumber)
        ))
        .returning();
      
      console.log(`🔄 更新数据库中${winningNumbers.lotteryType}第${winningNumbers.issueNumber}期数据`);
      return updated;
    } else {
      // 插入新记录
      const [inserted] = await db
        .insert(lotteryResults)
        .values(insertData)
        .returning();
      
      console.log(`✅ 新增数据库中${winningNumbers.lotteryType}第${winningNumbers.issueNumber}期数据`);
      return inserted;
    }
  }

  // 批量保存开奖结果
  async saveBatchLotteryResults(results: WinningNumbers[]): Promise<void> {
    console.log(`📦 开始批量保存${results.length}条开奖记录到数据库...`);
    
    for (const result of results) {
      await this.saveLotteryResult(result);
    }
    
    console.log(`✅ 批量保存完成，共处理${results.length}条记录`);
  }

  // 根据彩票类型和期号查询开奖结果
  async getLotteryResult(lotteryType: LotteryType, issueNumber: string): Promise<WinningNumbers | null> {
    const [result] = await db
      .select()
      .from(lotteryResults)
      .where(and(
        eq(lotteryResults.lotteryType, lotteryType),
        eq(lotteryResults.issueNumber, issueNumber)
      ));

    if (!result) {
      return null;
    }

    return {
      lotteryType: result.lotteryType as LotteryType,
      issueNumber: result.issueNumber,
      front_area: result.frontArea as string[],
      back_area: result.backArea as string[]
    };
  }

  // 获取指定彩票类型的最新开奖结果
  async getLatestLotteryResult(lotteryType: LotteryType): Promise<WinningNumbers | null> {
    const [result] = await db
      .select()
      .from(lotteryResults)
      .where(eq(lotteryResults.lotteryType, lotteryType))
      .orderBy(desc(lotteryResults.issueNumber))
      .limit(1);

    if (!result) {
      return null;
    }

    return {
      lotteryType: result.lotteryType as LotteryType,
      issueNumber: result.issueNumber,
      front_area: result.frontArea as string[],
      back_area: result.backArea as string[]
    };
  }

  // 获取指定彩票类型的历史开奖结果（按期号倒序）
  async getLotteryHistory(lotteryType: LotteryType, limit: number = 100): Promise<WinningNumbers[]> {
    const results = await db
      .select()
      .from(lotteryResults)
      .where(eq(lotteryResults.lotteryType, lotteryType))
      .orderBy(desc(lotteryResults.issueNumber))
      .limit(limit);

    return results.map(result => ({
      lotteryType: result.lotteryType as LotteryType,
      issueNumber: result.issueNumber,
      front_area: result.frontArea as string[],
      back_area: result.backArea as string[]
    }));
  }

  // 获取数据库统计信息
  async getDatabaseStats(): Promise<{ [key: string]: any }> {
    try {
      // 查询双色球数据数量
      const unionLottoCount = await db
        .select({ count: lotteryResults.id })
        .from(lotteryResults)
        .where(eq(lotteryResults.lotteryType, LotteryType.UNION_LOTTO));

      // 查询大乐透数据数量  
      const superLottoCount = await db
        .select({ count: lotteryResults.id })
        .from(lotteryResults)
        .where(eq(lotteryResults.lotteryType, LotteryType.SUPER_LOTTO));

      // 获取最新期号
      const latestUnionLotto = await this.getLatestLotteryResult(LotteryType.UNION_LOTTO);
      const latestSuperLotto = await this.getLatestLotteryResult(LotteryType.SUPER_LOTTO);

      return {
        database: 'PostgreSQL',
        unionLottoCount: unionLottoCount.length,
        superLottoCount: superLottoCount.length,
        totalRecords: unionLottoCount.length + superLottoCount.length,
        latestUnionLotto: latestUnionLotto?.issueNumber || '无',
        latestSuperLotto: latestSuperLotto?.issueNumber || '无',
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('获取数据库统计信息失败:', error);
      return {
        database: 'PostgreSQL',
        error: '无法连接到数据库'
      };
    }
  }

  // 清空数据库中的开奖数据
  async clearDatabase(): Promise<void> {
    try {
      await db.delete(lotteryResults);
      console.log('🗑️ 已清空数据库中的所有开奖数据');
    } catch (error) {
      console.error('清空数据库失败:', error);
      throw error;
    }
  }

  // 测试数据库连接
  async testConnection(): Promise<boolean> {
    try {
      await db.select().from(lotteryResults).limit(1);
      console.log('✅ 数据库连接测试成功');
      return true;
    } catch (error) {
      console.error('❌ 数据库连接测试失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const lotteryDB = new LotteryDatabaseService();
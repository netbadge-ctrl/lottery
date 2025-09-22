import { LotteryType, type WinningNumbers } from '../types';

// API基础URL - 在开发环境中使用localhost，在生产环境中使用环境变量
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? `https://${process.env.REPLIT_DOMAIN || window.location.hostname}:3001`
  : 'http://localhost:3001';

export class LotteryAPIClient {
  
  // 测试API连接
  async testConnection(): Promise<{ status: string; database: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API连接测试失败:', error);
      throw error;
    }
  }

  // 获取最新开奖数据
  async getLatestResults(): Promise<{ unionLotto: WinningNumbers | null, superLotto: WinningNumbers | null }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lottery/latest`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('获取最新开奖数据失败:', error);
      throw error;
    }
  }

  // 根据彩票类型和期号查询开奖结果
  async getLotteryResult(lotteryType: LotteryType, issueNumber: string): Promise<WinningNumbers | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lottery/${lotteryType}/${issueNumber}`);
      if (response.status === 404) {
        return null; // 未找到数据
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('查询开奖结果失败:', error);
      throw error;
    }
  }

  // 抓取历史数据
  async fetchHistoryData(count: number = 100): Promise<{ success: boolean; data: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lottery/fetch-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('抓取历史数据失败:', error);
      throw error;
    }
  }

  // 抓取最新数据
  async fetchLatestData(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lottery/fetch-latest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('抓取最新数据失败:', error);
      throw error;
    }
  }

  // 获取数据库统计信息
  async getDatabaseStats(): Promise<{ [key: string]: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lottery/stats`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('获取数据库统计信息失败:', error);
      throw error;
    }
  }

  // 清空数据库
  async clearDatabase(): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lottery/clear`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('清空数据库失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const lotteryAPI = new LotteryAPIClient();
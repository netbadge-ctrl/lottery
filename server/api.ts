import express from 'express';
import cors from 'cors';
import { lotteryDB } from '../services/db/database';
import { LotteryType, type WinningNumbers } from '../types';
import { fetchOfficialLotteryHistory, fetchOfficialLotteryData } from '../services/officialLotteryAPI';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 测试数据库连接的路由
app.get('/api/health', async (req, res) => {
  try {
    const isConnected = await lotteryDB.testConnection();
    res.json({ 
      status: 'ok', 
      database: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// 获取最新开奖结果
app.get('/api/lottery/latest', async (req, res) => {
  try {
    const [unionLotto, superLotto] = await Promise.all([
      lotteryDB.getLatestLotteryResult(LotteryType.UNION_LOTTO),
      lotteryDB.getLatestLotteryResult(LotteryType.SUPER_LOTTO)
    ]);
    
    res.json({
      unionLotto,
      superLotto
    });
  } catch (error) {
    console.error('获取最新开奖结果失败:', error);
    res.status(500).json({ 
      error: '获取最新开奖结果失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 根据彩票类型和期号查询开奖结果
app.get('/api/lottery/:lotteryType/:issueNumber', async (req, res) => {
  try {
    const { lotteryType, issueNumber } = req.params;
    
    if (!Object.values(LotteryType).includes(lotteryType as LotteryType)) {
      return res.status(400).json({ error: '无效的彩票类型' });
    }
    
    const result = await lotteryDB.getLotteryResult(lotteryType as LotteryType, issueNumber);
    
    if (!result) {
      return res.status(404).json({ error: '未找到对应期号的开奖数据' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('查询开奖结果失败:', error);
    res.status(500).json({ 
      error: '查询开奖结果失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 抓取历史数据
app.post('/api/lottery/fetch-history', async (req, res) => {
  try {
    const { count = 100 } = req.body;
    
    console.log(`🕐 开始从官网抓取过去${count}期开奖数据...`);
    
    // 抓取双色球历史数据
    console.log('🔴 正在从中国福彩网抓取双色球历史数据...');
    const unionLottoHistory = await fetchOfficialLotteryHistory(LotteryType.UNION_LOTTO, count);
    
    // 抓取大乐透历史数据  
    console.log('🔵 正在从中国体彩网抓取大乐透历史数据...');
    const superLottoHistory = await fetchOfficialLotteryHistory(LotteryType.SUPER_LOTTO, count);
    
    // 保存到PostgreSQL数据库
    await lotteryDB.saveBatchLotteryResults([...unionLottoHistory, ...superLottoHistory]);
    
    res.json({
      success: true,
      message: '历史数据抓取完成',
      data: {
        unionLotto: unionLottoHistory.length,
        superLotto: superLottoHistory.length,
        total: unionLottoHistory.length + superLottoHistory.length
      }
    });
  } catch (error) {
    console.error('抓取历史数据失败:', error);
    res.status(500).json({ 
      error: '抓取历史数据失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 抓取最新数据
app.post('/api/lottery/fetch-latest', async (req, res) => {
  try {
    console.log('🔄 正在从官网抓取最新开奖数据...');
    
    // 获取最新数据
    const latestUnionLotto = await fetchOfficialLotteryData(LotteryType.UNION_LOTTO);
    const latestSuperLotto = await fetchOfficialLotteryData(LotteryType.SUPER_LOTTO);
    
    const results = [];
    
    // 保存双色球数据到PostgreSQL
    if (latestUnionLotto) {
      await lotteryDB.saveLotteryResult(latestUnionLotto);
      results.push({ type: 'unionLotto', issueNumber: latestUnionLotto.issueNumber });
    }
    
    // 保存大乐透数据到PostgreSQL
    if (latestSuperLotto) {
      await lotteryDB.saveLotteryResult(latestSuperLotto);
      results.push({ type: 'superLotto', issueNumber: latestSuperLotto.issueNumber });
    }
    
    res.json({
      success: true,
      message: '最新数据抓取完成',
      data: results
    });
  } catch (error) {
    console.error('抓取最新数据失败:', error);
    res.status(500).json({ 
      error: '抓取最新数据失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取数据库统计信息
app.get('/api/lottery/stats', async (req, res) => {
  try {
    const stats = await lotteryDB.getDatabaseStats();
    res.json(stats);
  } catch (error) {
    console.error('获取数据库统计信息失败:', error);
    res.status(500).json({ 
      error: '获取数据库统计信息失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 清空数据库
app.delete('/api/lottery/clear', async (req, res) => {
  try {
    await lotteryDB.clearDatabase();
    res.json({
      success: true,
      message: '数据库已清空'
    });
  } catch (error) {
    console.error('清空数据库失败:', error);
    res.status(500).json({ 
      error: '清空数据库失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 API服务器启动在端口 ${PORT}`);
  console.log(`📊 数据库API地址: http://localhost:${PORT}/api`);
});

export default app;
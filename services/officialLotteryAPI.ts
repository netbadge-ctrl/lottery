import { LotteryType, type WinningNumbers } from '../types';
import { fetchChinaLotteryData, fetchHistoryLotteryData } from './chinaLotteryAPI';

// 极速数据API配置（免费版每天100次查询）
const JISU_API_CONFIG = {
    baseUrl: 'https://api.jisuapi.com/caipiao',
    // 这里需要申请极速数据的免费API Key
    apiKey: (import.meta as any).env?.VITE_JISU_API_KEY || 'your_jisu_api_key_here',
    endpoints: {
        query: '/query',
        history: '/history',
        types: '/type'
    },
    // 彩票ID映射（极速数据的彩票ID）
    lotteryIds: {
        [LotteryType.UNION_LOTTO]: 13,         // 双色球
        [LotteryType.SUPER_LOTTO]: 22          // 大乐透
    }
};

// 模拟开奖数据（当API不可用时的备选方案）
const MOCK_LOTTERY_DATA = {
    [LotteryType.UNION_LOTTO]: {
        '2024057': {
            issueNumber: '2024057',
            numbers: '07 10 16 18 23 35',
            refernumber: '12',
            opendate: '2024-05-19'
        },
        '2024056': {
            issueNumber: '2024056',
            numbers: '02 11 22 30 31 33',
            refernumber: '07',
            opendate: '2024-05-16'
        },
        '2024055': {
            issueNumber: '2024055',
            numbers: '01 11 14 21 28 30',
            refernumber: '10',
            opendate: '2024-05-14'
        }
    },
    [LotteryType.SUPER_LOTTO]: {
        '2024057': {
            issueNumber: '2024057',
            numbers: '09 11 13 16 33 03 11',
            refernumber: '',
            opendate: '2024-05-18'
        },
        '2024056': {
            issueNumber: '2024056',
            numbers: '02 06 14 22 35 01 12',
            refernumber: '',
            opendate: '2024-05-15'
        }
    }
};

// 使用模拟数据的备选方案
function getMockWinningNumbers(lotteryType: LotteryType, issueNumber: string): WinningNumbers | null {
    console.log(`🎭 使用模拟数据查询${lotteryType}第${issueNumber}期`);
    
    const mockData = MOCK_LOTTERY_DATA[lotteryType]?.[issueNumber];
    if (!mockData) {
        console.log(`⚠️ 模拟数据中未找到${lotteryType}第${issueNumber}期`);
        return null;
    }
    
    const numbers = mockData.numbers.trim().split(/\s+/).map((n: string) => n.padStart(2, '0'));
    let winningNumbers: WinningNumbers;
    
    if (lotteryType === LotteryType.UNION_LOTTO) {
        // 双色球：前6个是红球，参考号码是蓝球
        const blueBall = mockData.refernumber?.padStart(2, '0') || numbers[6];
        winningNumbers = {
            lotteryType,
            issueNumber: mockData.issueNumber,
            front_area: numbers.slice(0, 6),
            back_area: [blueBall]
        };
    } else if (lotteryType === LotteryType.SUPER_LOTTO) {
        // 大乐透：前5个是前区，后2个是后区
        winningNumbers = {
            lotteryType,
            issueNumber: mockData.issueNumber,
            front_area: numbers.slice(0, 5),
            back_area: numbers.slice(5, 7)
        };
    } else {
        return null;
    }
    
    console.log(`✅ 从模拟数据获取${lotteryType}第${winningNumbers.issueNumber}期开奖号码`);
    console.log(`   开奖日期: ${mockData.opendate}`);
    console.log(`   前区号码: ${winningNumbers.front_area.join(', ')}`);
    console.log(`   后区号码: ${winningNumbers.back_area.join(', ')}`);
    console.log(`   ⚠️ 注意：这是模拟数据，仅用于测试和演示`);
    
    return winningNumbers;
}

// 超时配置
const TIMEOUT_MS = 10000;

// 带超时的fetch请求
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ...options.headers
            }
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// 从极速数据API获取开奖数据（免费版）
export async function fetchOfficialWinningNumbers(lotteryType: LotteryType, issueNumber: string): Promise<WinningNumbers | null> {
    // 第一优先级：中国彩票官网最新数据
    try {
        console.log(`🌐 正在从中国彩票官网查询${lotteryType}第${issueNumber}期开奖号码...`);
        
        const result = await fetchChinaLotteryData(lotteryType, issueNumber);
        if (result) {
            console.log(`✅ 成功从官网最新数据获取${lotteryType}第${result.issueNumber}期开奖号码`);
            return result;
        }
    } catch (error) {
        console.log(`⚠️ 官网最新数据查询失败，尝试其他数据源:`, error.message);
    }
    
    // 第二优先级：中国彩票官网历史数据
    try {
        console.log(`📅 正在从中国彩票官网查询${lotteryType}第${issueNumber}期历史数据...`);
        
        const historyResult = await fetchHistoryLotteryData(lotteryType, issueNumber);
        if (historyResult) {
            console.log(`✅ 成功从官网历史数据获取${lotteryType}第${historyResult.issueNumber}期开奖号码`);
            return historyResult;
        }
    } catch (error) {
        console.log(`⚠️ 官网历史数据查询失败，尝试其他数据源:`, error.message);
    }
    
    // 备选方案：极速数据API
    try {
        const lotteryId = JISU_API_CONFIG.lotteryIds[lotteryType];
        if (!lotteryId) {
            console.error(`不支持的彩票类型: ${lotteryType}`);
            return null;
        }
        
        console.log(`🌐 正在从极速数据API查询${lotteryType}第${issueNumber}期开奖号码...`);
        
        // 构建请求URL和参数
        const url = `${JISU_API_CONFIG.baseUrl}${JISU_API_CONFIG.endpoints.query}`;
        const params = new URLSearchParams({
            appkey: JISU_API_CONFIG.apiKey,
            caipiaoid: lotteryId.toString(),
            issueno: issueNumber
        });
        
        const response = await fetchWithTimeout(`${url}?${params}`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 0) {
            console.error(`API返回错误: ${data.status} - ${data.msg}`);
            
            // 如果是密钥错误或API不可用，使用模拟数据
            if (data.status === 101 || data.status === 201 || JISU_API_CONFIG.apiKey === 'your_jisu_api_key_here') {
                console.log(`💡 API密钥未配置或无效，切换到模拟数据模式`);
                console.log(`📝 如需使用真实API，请申请极速数据API密钥: https://www.jisuapi.com/api/caipiao/`);
                return getMockWinningNumbers(lotteryType, issueNumber);
            }
            
            // 如果是期号不存在，返回null而不是抛出错误
            if (data.status === 202 || data.msg.includes('期号')) {
                console.log(`📅 期号${issueNumber}可能尚未开奖或不存在`);
                return null;
            }
            
            throw new Error(`API错误: ${data.msg}`);
        }
        
        const result = data.result;
        if (!result || !result.number) {
            console.error('API返回数据格式错误:', data);
            return null;
        }
        
        // 解析开奖号码（极速数据格式："05 07 10 18 19 21 27"）
        const numbersStr = result.number.trim();
        const numbers = numbersStr.split(/\s+/).map((n: string) => n.padStart(2, '0'));
        
        let winningNumbers: WinningNumbers;
        
        if (lotteryType === LotteryType.UNION_LOTTO) {
            // 双色球：前6个是红球，最后1个是蓝球
            if (numbers.length < 7) {
                // 如果没有蓝球，检查是否有参考号码（refernumber）
                const refernumber = result.refernumber;
                if (refernumber && numbers.length === 6) {
                    numbers.push(refernumber.padStart(2, '0'));
                } else {
                    throw new Error(`双色球开奖号码数量错误: ${numbers.length}`);
                }
            }
            
            winningNumbers = {
                lotteryType,
                issueNumber: result.issueno || issueNumber,
                front_area: numbers.slice(0, 6),
                back_area: [numbers[6]]
            };
        } else if (lotteryType === LotteryType.SUPER_LOTTO) {
            // 大乐透：前5个是前区，后2个是后区
            if (numbers.length !== 7) {
                throw new Error(`大乐透开奖号码数量错误: ${numbers.length}`);
            }
            
            winningNumbers = {
                lotteryType,
                issueNumber: result.issueno || issueNumber,
                front_area: numbers.slice(0, 5),
                back_area: numbers.slice(5, 7)
            };
        } else {
            throw new Error(`不支持的彩票类型: ${lotteryType}`);
        }
        
        console.log(`✅ 成功从极速数据API获取${lotteryType}第${winningNumbers.issueNumber}期开奖号码:`);
        console.log(`   开奖日期: ${result.opendate}`);
        console.log(`   前区号码: ${winningNumbers.front_area.join(', ')}`);
        console.log(`   后区号码: ${winningNumbers.back_area.join(', ')}`);
        
        if (result.saleamount) {
            console.log(`   销售额: ${result.saleamount}元`);
        }
        
        return winningNumbers;
        
    } catch (error) {
        console.error('极速数据API查询失败:', error);
        
        // API完全失败时，尝试使用模拟数据
        console.log(`💡 API查询失败，尝试使用模拟数据`);
        return getMockWinningNumbers(lotteryType, issueNumber);
    }
}

// 获取支持的彩票类型列表
export async function fetchSupportedLotteryTypes(): Promise<any> {
    try {
        console.log('🔍 正在获取支持的彩票类型列表...');
        
        const url = `${JISU_API_CONFIG.baseUrl}${JISU_API_CONFIG.endpoints.types}`;
        const params = new URLSearchParams({
            appkey: JISU_API_CONFIG.apiKey
        });
        
        const response = await fetchWithTimeout(`${url}?${params}`);
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 0) {
            throw new Error(`API错误: ${data.msg}`);
        }
        
        console.log('✅ 成功获取支持的彩票类型:', data.result?.length || 0, '种');
        return data.result;
        
    } catch (error) {
        console.error('获取彩票类型失败:', error);
        return null;
    }
}

// 验证开奖号码的合法性
export function validateLotteryNumbers(lotteryType: LotteryType, frontArea: string[], backArea: string[]): boolean {
    try {
        if (lotteryType === LotteryType.UNION_LOTTO) {
            // 双色球验证
            if (frontArea.length !== 6 || backArea.length !== 1) {
                return false;
            }
            
            // 前区号码范围：01-33
            const frontValid = frontArea.every(num => {
                const n = parseInt(num);
                return !isNaN(n) && n >= 1 && n <= 33;
            });
            
            // 后区号码范围：01-16
            const backValid = backArea.every(num => {
                const n = parseInt(num);
                return !isNaN(n) && n >= 1 && n <= 16;
            });
            
            // 检查前区号码是否有重复
            const frontSet = new Set(frontArea);
            
            return frontValid && backValid && frontSet.size === 6;
            
        } else if (lotteryType === LotteryType.SUPER_LOTTO) {
            // 大乐透验证
            if (frontArea.length !== 5 || backArea.length !== 2) {
                return false;
            }
            
            // 前区号码范围：01-35
            const frontValid = frontArea.every(num => {
                const n = parseInt(num);
                return !isNaN(n) && n >= 1 && n <= 35;
            });
            
            // 后区号码范围：01-12
            const backValid = backArea.every(num => {
                const n = parseInt(num);
                return !isNaN(n) && n >= 1 && n <= 12;
            });
            
            // 检查前区和后区号码是否有重复
            const frontSet = new Set(frontArea);
            const backSet = new Set(backArea);
            
            return frontValid && backValid && frontSet.size === 5 && backSet.size === 2;
        }
        
        return false;
    } catch (error) {
        console.error('验证彩票号码时出错:', error);
        return false;
    }
}
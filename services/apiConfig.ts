// API配置文件
export const API_CONFIG = {
    // 彩票API配置
    LOTTERY_APIS: {
        // 主要API源
        PRIMARY: {
            SSQ_URL: 'http://f.apiplus.net/ssq-{issue}.json', // 双色球
            DLT_URL: 'https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry', // 大乐透
        },
        
        // 备用API源
        BACKUP: {
            SPORTTERY_URL: 'https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry',
            JUHE_URL: 'https://apis.juhe.cn/lottery/query', // 需要API key
        },
        
        // 代理服务（解决跨域问题）
        PROXY: {
            ALLORIGINS: 'https://api.allorigins.win/raw?url=',
            CORS_ANYWHERE: 'https://cors-anywhere.herokuapp.com/',
        }
    },
    
    // 游戏编号映射
    GAME_CODES: {
        SSQ: '85', // 双色球在体彩API中的编号
        DLT: '29', // 大乐透在体彩API中的编号
    },
    
    // API超时设置
    TIMEOUT: 10000, // 10秒超时
    
    // 重试配置
    RETRY: {
        MAX_ATTEMPTS: 3,
        DELAY: 1000, // 1秒延迟
    }
};

// API响应数据格式接口
export interface APIResponse {
    success: boolean;
    data?: any;
    error?: string;
}

// 统一的API请求函数
export const fetchWithTimeout = async (url: string, timeout = API_CONFIG.TIMEOUT): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};
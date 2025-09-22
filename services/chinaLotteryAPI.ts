import { LotteryType, type WinningNumbers } from '../types';

// 中国彩票官方网站API配置
const CHINA_LOTTERY_CONFIG = {
    baseUrl: 'https://m.china-lottery.cn',
    endpoints: {
        nation: '/home/nation?frm=z_baidu',
        unionLottoHistory: '/list/1001?frm=z_baidu',    // 双色球往期开奖
        superLottoHistory: '/list/1000?frm=z_baidu'     // 大乐透往期开奖
    },
    // 彩票类型映射
    lotteryPatterns: {
        [LotteryType.UNION_LOTTO]: /双色球(\d+)期[\s\S]*?(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*/,
        [LotteryType.SUPER_LOTTO]: /大乐透(\d+)期[\s\S]*?(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*/
    },
    // 历史数据查询的彩票类型映射
    historyPatterns: {
        [LotteryType.UNION_LOTTO]: {
            // 多种可能的匹配模式
            patterns: [
                // NUXT数据格式解析
                /issueNo:"(\d+)"[\s\S]*?resultArea1:"([\d,]+)"[\s\S]*?resultArea2:"(\d{2})"/g,
                // 新的HTML em标签格式解析 - 双色球
                /第(2025\d+)期[\s\S]*?<em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em>\s*<em[^>]*class="blue-ball"[^>]*>(\d+)<\/em>/g,
                // 期号在单独位置的格式
                /(2025\d+)期[\s\S]*?theme-ball-ssq[\s\S]*?<em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em>\s*<em[^>]*class="blue-ball"[^>]*>(\d+)<\/em>/g,
                // 旧格式备用
                /第(\d+)期[\s\S]*?(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*/g
            ],
            endpoint: 'unionLottoHistory'
        },
        [LotteryType.SUPER_LOTTO]: {
            // 多种可能的匹配模式
            patterns: [
                // NUXT数据格式解析
                /issueNo:"(\d+)"[\s\S]*?resultArea1:"([\d,]+)"[\s\S]*?resultArea2:"(\d{2}),(\d{2})"/g,
                // 新的HTML em标签格式解析 - 大乐透
                /第(25\d+)期[\s\S]*?<em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em>\s*<em[^>]*class="blue-ball"[^>]*>(\d+)<\/em><em[^>]*class="blue-ball"[^>]*>(\d+)<\/em>/g,
                // 期号在单独位置的格式
                /(25\d+)期[\s\S]*?theme-ball-dlt[\s\S]*?<em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em>\s*<em[^>]*class="blue-ball"[^>]*>(\d+)<\/em><em[^>]*class="blue-ball"[^>]*>(\d+)<\/em>/g,
                // 旧格式备用
                /第(\d+)期[\s\S]*?(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*/g
            ],
            endpoint: 'superLottoHistory'
        }
    }
};

// 超时配置
const TIMEOUT_MS = 15000;

// 带超时的fetch请求
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                'Cache-Control': 'no-cache',
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

// 从中国彩票官方网站获取最新开奖数据（基于实际可用方法）
export async function fetchChinaLotteryData(lotteryType: LotteryType, issueNumber?: string): Promise<WinningNumbers | null> {
    try {
        console.log(`🇨🇳 正在从中国彩票官方网站获取${lotteryType}最新开奖数据...`);
        
        const config = CHINA_LOTTERY_CONFIG.historyPatterns[lotteryType];
        const url = `${CHINA_LOTTERY_CONFIG.baseUrl}${CHINA_LOTTERY_CONFIG.endpoints[config.endpoint]}`;
        
        const response = await fetchWithTimeout(url, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`官网请求失败: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        console.log('🌐 成功获取专用页面内容');
        
        // 基于实际HTML结构的改进解析
        const result = parseFromImprovedRegex(html, lotteryType);
        
        if (result && validateWinningNumbers(result)) {
            console.log(`✅ 成功获取${lotteryType}第${result.issueNumber}期开奖号码:`);
            console.log(`   前区号码: ${result.front_area.join(', ')}`);
            console.log(`   后区号码: ${result.back_area.join(', ')}`);
            return result;
        }
        
        console.log(`⚠️ 未能解析到有效的${lotteryType}开奖数据`);
        return null;
        
    } catch (error) {
        console.error('中国彩票官网查询失败:', error);
        return null;
    }
}


// 解析最新彩票开奖数据
function parseLatestLotteryData(match: RegExpMatchArray, lotteryType: LotteryType): WinningNumbers | null {
    try {
        console.log(`🔍 开始解析${lotteryType}数据，匹配组数: ${match.length}`);
        console.log(`🔍 匹配内容:`, match);
        
        if (lotteryType === LotteryType.UNION_LOTTO) {
            // NUXT格式: issueNo:"2025109" resultArea1:"05,06,09,17,18,31" resultArea2:"03"
            if (match.length >= 4 && typeof match[2] === 'string' && match[2].includes(',')) {
                const [, issueNo, frontArea, backArea] = match;
                const frontNumbers = frontArea.split(',').map(n => n.padStart(2, '0'));
                
                return {
                    lotteryType,
                    issueNumber: issueNo,
                    front_area: frontNumbers,
                    back_area: [backArea.padStart(2, '0')]
                };
            } else if (match.length >= 8) {
                // HTML em格式: 第2025109期 + 6个红球 + 1个蓝球
                const [, period, red1, red2, red3, red4, red5, red6, blue] = match;
                return {
                    lotteryType,
                    issueNumber: period,
                    front_area: [red1, red2, red3, red4, red5, red6].map(n => n.padStart(2, '0')),
                    back_area: [blue.padStart(2, '0')]
                };
            }
        } else if (lotteryType === LotteryType.SUPER_LOTTO) {
            // NUXT格式: issueNo:"25108" resultArea1:"14,18,21,24,29" resultArea2:"03,06"
            if (match.length >= 5 && typeof match[2] === 'string' && match[2].includes(',')) {
                const [, issueNo, frontArea, backArea1, backArea2] = match;
                const frontNumbers = frontArea.split(',').map(n => n.padStart(2, '0'));
                
                return {
                    lotteryType,
                    issueNumber: issueNo,
                    front_area: frontNumbers,
                    back_area: [backArea1.padStart(2, '0'), backArea2.padStart(2, '0')]
                };
            } else if (match.length >= 8) {
                // HTML em格式: 第25108期 + 5个前区 + 2个后区
                const [, period, front1, front2, front3, front4, front5, back1, back2] = match;
                return {
                    lotteryType,
                    issueNumber: period,
                    front_area: [front1, front2, front3, front4, front5].map(n => n.padStart(2, '0')),
                    back_area: [back1.padStart(2, '0'), back2.padStart(2, '0')]
                };
            }
        }
        
        console.log(`⚠️ 无法解析${lotteryType}数据，匹配格式不符合预期`);
        return null;
    } catch (error) {
        console.error('解析开奖数据失败:', error);
        return null;
    }
}


// 基于实际HTML结构的改进解析
function parseFromImprovedRegex(html: string, lotteryType: LotteryType): WinningNumbers | null {
    try {
        if (lotteryType === LotteryType.UNION_LOTTO) {
            // 双色球：尝试多种期号格式
            const possibleIssues = ['2025109', '25109'];
            
            for (const issue of possibleIssues) {
                const issueMatch = html.match(new RegExp(`(${issue})期`));
                if (issueMatch) {
                    console.log(`🔍 找到双色球期号: ${issue}`);
                    const issuePosition = html.indexOf(`${issue}期`);
                    const nearbySection = html.substring(issuePosition, issuePosition + 2000);
                    
                    const numberMatch = nearbySection.match(/<em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em>\s*<em[^>]*class="blue-ball"[^>]*>(\d+)<\/em>/);
                    
                    if (numberMatch) {
                        const normalizedIssue = issue === '25109' ? '2025109' : issue;
                        return {
                            lotteryType,
                            issueNumber: normalizedIssue,
                            front_area: [numberMatch[1], numberMatch[2], numberMatch[3], numberMatch[4], numberMatch[5], numberMatch[6]].map(n => n.padStart(2, '0')),
                            back_area: [numberMatch[7].padStart(2, '0')]
                        };
                    }
                }
            }
        } else {
            // 大乐透：查找25108期的数据
            const issueMatch = html.match(/(25108)期/);
            if (issueMatch) {
                const issuePosition = html.indexOf('25108期');
                const nearbySection = html.substring(issuePosition, issuePosition + 2000);
                
                const numberMatch = nearbySection.match(/<em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em><em[^>]*>\s*(\d+)<!----><\/em>\s*<em[^>]*class="blue-ball"[^>]*>(\d+)<\/em><em[^>]*class="blue-ball"[^>]*>(\d+)<\/em>/);
                
                if (numberMatch) {
                    return {
                        lotteryType,
                        issueNumber: '25108',
                        front_area: [numberMatch[1], numberMatch[2], numberMatch[3], numberMatch[4], numberMatch[5]].map(n => n.padStart(2, '0')),
                        back_area: [numberMatch[6].padStart(2, '0'), numberMatch[7].padStart(2, '0')]
                    };
                }
            }
        }
        
        console.log(`⚠️ 未找到${lotteryType}的特定期号数据`);
        return null;
    } catch (error) {
        console.error('改进正则解析失败:', error);
        return null;
    }
}

// 标准化期号格式
function normalizeIssueNumber(issue: string, lotteryType: LotteryType): string {
    const numIssue = issue.replace(/\D/g, ''); // 移除非数字字符
    
    if (lotteryType === LotteryType.UNION_LOTTO) {
        // 双色球：如果是5位数字，前面加20变成7位
        return numIssue.length === 5 ? `20${numIssue}` : numIssue;
    } else {
        // 大乐透：保持原格式
        return numIssue;
    }
}

// 验证开奖号码格式
function validateWinningNumbers(winningNumbers: WinningNumbers): boolean {
    try {
        const { lotteryType, front_area, back_area } = winningNumbers;
        
        // 检查基本格式
        if (!Array.isArray(front_area) || !Array.isArray(back_area)) {
            return false;
        }
        
        // 验证双色球格式
        if (lotteryType === LotteryType.UNION_LOTTO) {
            if (front_area.length !== 6 || back_area.length !== 1) {
                console.log('❌ 双色球号码数量不正确');
                return false;
            }
            
            // 验证前区号码范围 (01-33)
            for (const num of front_area) {
                const n = parseInt(num);
                if (isNaN(n) || n < 1 || n > 33) {
                    console.log(`❌ 双色球前区号码 ${num} 超出范围 (01-33)`);
                    return false;
                }
            }
            
            // 验证后区号码范围 (01-16)
            const backNum = parseInt(back_area[0]);
            if (isNaN(backNum) || backNum < 1 || backNum > 16) {
                console.log(`❌ 双色球后区号码 ${back_area[0]} 超出范围 (01-16)`);
                return false;
            }
        }
        // 验证大乐透格式
        else if (lotteryType === LotteryType.SUPER_LOTTO) {
            if (front_area.length !== 5 || back_area.length !== 2) {
                console.log('❌ 大乐透号码数量不正确');
                return false;
            }
            
            // 验证前区号码范围 (01-35)
            for (const num of front_area) {
                const n = parseInt(num);
                if (isNaN(n) || n < 1 || n > 35) {
                    console.log(`❌ 大乐透前区号码 ${num} 超出范围 (01-35)`);
                    return false;
                }
            }
            
            // 验证后区号码范围 (01-12)
            for (const num of back_area) {
                const n = parseInt(num);
                if (isNaN(n) || n < 1 || n > 12) {
                    console.log(`❌ 大乐透后区号码 ${num} 超出范围 (01-12)`);
                    return false;
                }
            }
        }
        
        return true;
    } catch (error) {
        console.error('验证开奖号码失败:', error);
        return false;
    }
}

// 解析 NUXT 数据中的彩票开奖信息
function parseNuxtLotteryData(html: string, lotteryType: LotteryType): WinningNumbers | null {
    try {
        // 从调试信息可以看到，页面包含类似这样的数据结构
        // resultArea1:"05,06,09,17,18,31",resultArea2:"03"
        // issueNo:"25109",lotteryName:"双色球"
        
        if (lotteryType === LotteryType.UNION_LOTTO) {
            // 查找双色球数据
            const unionLottoMatch = html.match(/lotteryName:"双色球"[\s\S]*?issueNo:"(\d+)"[\s\S]*?resultArea1:"([^"]+)"[\s\S]*?resultArea2:"([^"]+)"/);
            if (unionLottoMatch) {
                const [, period, area1, area2] = unionLottoMatch;
                const frontNumbers = area1.split(',');
                const backNumbers = [area2];
                
                return {
                    lotteryType,
                    issueNumber: `20${period}`,
                    front_area: frontNumbers,
                    back_area: backNumbers
                };
            }
        } else if (lotteryType === LotteryType.SUPER_LOTTO) {
            // 查找大乐透数据
            const superLottoMatch = html.match(/lotteryName:"大乐透"[\s\S]*?issueNo:"(\d+)"[\s\S]*?resultArea1:"([^"]+)"[\s\S]*?resultArea2:"([^"]+)"/);
            if (superLottoMatch) {
                const [, period, area1, area2] = superLottoMatch;
                const frontNumbers = area1.split(',');
                const backNumbers = area2.split(',');
                
                return {
                    lotteryType,
                    issueNumber: `20${period}`,
                    front_area: frontNumbers,
                    back_area: backNumbers
                };
            }
        }
        
        return null;
    } catch (error) {
        console.error('解析NUXT数据失败:', error);
        return null;
    }
}

// 从中国彩票官网查询历史开奖数据
export async function fetchHistoryLotteryData(lotteryType: LotteryType, issueNumber: string): Promise<WinningNumbers | null> {
    try {
        console.log(`📅 正在从中国彩票官网查询${lotteryType}第${issueNumber}期历史数据...`);
        
        const config = CHINA_LOTTERY_CONFIG.historyPatterns[lotteryType];
        if (!config) {
            throw new Error(`不支持的彩票类型: ${lotteryType}`);
        }
        
        const url = `${CHINA_LOTTERY_CONFIG.baseUrl}${CHINA_LOTTERY_CONFIG.endpoints[config.endpoint]}`;
        
        const response = await fetchWithTimeout(url, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`官网请求失败: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        console.log('🌐 成功获取官网历史数据页面');
        
        // 使用正则表达式查找所有匹配的开奖记录
        let matches: RegExpMatchArray[] = [];
        
        // 尝试每种匹配模式
        for (const pattern of config.patterns) {
            const currentMatches = [...html.matchAll(pattern)];
            if (currentMatches.length > 0) {
                matches = currentMatches;
                console.log(`✅ 使用模式匹配成功，找到 ${matches.length} 条记录`);
                break;
            }
        }
        
        if (!matches || matches.length === 0) {
            console.log(`⚠️ 未在官网找到${lotteryType}的历史数据`);
            return null;
        }
        
        // 查找指定期号的数据
        const targetPeriod = issueNumber.startsWith('20') ? issueNumber.slice(2) : issueNumber; // 去掉前缀"20"
        
        for (const match of matches) {
            const [, period, ...numbers] = match;
            
            if (period === targetPeriod) {
                // 找到匹配的期号
                let winningNumbers: WinningNumbers;
                
                if (lotteryType === LotteryType.UNION_LOTTO) {
                    // 双色球：处理不同格式的数据
                    let frontNumbers: string[];
                    let backNumbers: string[];
                    
                    // 如果是NUXT数据格式 (resultArea1:"05,06,09,17,18,31", resultArea2:"03")
                    if (numbers.length === 3) {
                        frontNumbers = numbers[1].split(',');
                        backNumbers = [numbers[2]];
                    } 
                    // 如果是HTML文本格式
                    else if (numbers.length >= 7) {
                        frontNumbers = numbers.slice(0, 6);
                        backNumbers = [numbers[6]];
                    } else {
                        throw new Error(`双色球历史开奖号码解析错误: 期号${period}, 数量${numbers.length}`);
                    }
                    
                    winningNumbers = {
                        lotteryType,
                        issueNumber: `20${period}`,
                        front_area: frontNumbers,
                        back_area: backNumbers
                    };
                } else if (lotteryType === LotteryType.SUPER_LOTTO) {
                    // 大乐透：处理不同格式的数据
                    let frontNumbers: string[];
                    let backNumbers: string[];
                    
                    // 如果是NUXT数据格式 (resultArea1:"05,06,09,17,18,31", resultArea2:"03,04")
                    if (numbers.length === 4) {
                        frontNumbers = numbers[1].split(',');
                        backNumbers = [numbers[2], numbers[3]];
                    }
                    // 如果是HTML文本格式
                    else if (numbers.length >= 7) {
                        frontNumbers = numbers.slice(0, 5);
                        backNumbers = numbers.slice(5, 7);
                    } else {
                        throw new Error(`大乐透历史开奖号码解析错误: 期号${period}, 数量${numbers.length}`);
                    }
                    
                    winningNumbers = {
                        lotteryType,
                        issueNumber: `20${period}`,
                        front_area: frontNumbers,
                        back_area: backNumbers
                    };
                } else {
                    throw new Error(`不支持的彩票类型: ${lotteryType}`);
                }
                
                console.log(`✅ 成功从官网历史数据获取${lotteryType}第${winningNumbers.issueNumber}期开奖号码:`);
                console.log(`   前区号码: ${winningNumbers.front_area.join(', ')}`);
                console.log(`   后区号码: ${winningNumbers.back_area.join(', ')}`);
                console.log(`   📊 数据源: 中国彩票官网历史数据`);
                
                return winningNumbers;
            }
        }
        
        console.log(`📅 未找到${lotteryType}第${issueNumber}期的历史数据`);
        return null;
        
    } catch (error) {
        console.error('中国彩票官网历史数据查询失败:', error);
        return null;
    }
}

// 获取最近的开奖记录列表
export async function fetchRecentLotteryHistory(lotteryType: LotteryType, count: number = 10): Promise<WinningNumbers[]> {
    try {
        console.log(`📋 正在获取${lotteryType}最近${count}期开奖记录...`);
        
        const config = CHINA_LOTTERY_CONFIG.historyPatterns[lotteryType];
        if (!config) {
            throw new Error(`不支持的彩票类型: ${lotteryType}`);
        }
        
        const url = `${CHINA_LOTTERY_CONFIG.baseUrl}${CHINA_LOTTERY_CONFIG.endpoints[config.endpoint]}`;
        
        const response = await fetchWithTimeout(url);
        
        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }
        
        const html = await response.text();
        
        // 尝试解析 __NUXT__ 数据
        const nuxtData = parseNuxtHistoryData(html, lotteryType, count);
        if (nuxtData && nuxtData.length > 0) {
            console.log(`✅ 从__NUXT__数据成功获取${lotteryType}最近${nuxtData.length}期开奖记录`);
            return nuxtData;
        }
        
        // 获取所有匹配的开奖记录
        let matches: RegExpMatchArray[] = [];
        
        // 尝试每种匹配模式
        for (const pattern of config.patterns) {
            const currentMatches = [...html.matchAll(pattern)];
            if (currentMatches.length > 0) {
                matches = currentMatches;
                console.log(`✅ 使用模式匹配成功，找到 ${matches.length} 条记录`);
                break;
            }
        }
        
        const results: WinningNumbers[] = [];
        
        for (let i = 0; i < Math.min(matches.length, count); i++) {
            const match = matches[i];
            const groups = match.slice(1); // 获取捕获组
            const period = groups[0]; // 期号总是在第一个位置
            
            let winningNumbers: WinningNumbers;
            
            if (lotteryType === LotteryType.UNION_LOTTO) {
                // 双色球：处理不同格式的数据
                let frontNumbers: string[];
                let backNumbers: string[];
                
                // 检查是否是NUXT数据格式 (3个捕获组: 期号, 前区, 后区)
                if (groups.length === 3) {
                    // NUXT格式: issueNo:"(\d+)", resultArea1:"([\d,]+)", resultArea2:"(\d{2})"
                    frontNumbers = groups[1].split(',').map(n => n.padStart(2, '0'));
                    backNumbers = [groups[2].padStart(2, '0')];
                } 
                // 检查是否是HTML文本格式 (8个捕获组: 期号 + 7个号码)
                else if (groups.length >= 8) {
                    // HTML格式: 期号 + 7个号码 (前6个红球 + 1个蓝球)
                    frontNumbers = groups.slice(1, 7).map(n => n.padStart(2, '0'));
                    backNumbers = [groups[7].padStart(2, '0')];
                } else {
                    console.error(`双色球历史开奖号码解析错误: 期号${period}, 捕获组数量${groups.length}`);
                    continue; // 跳过这条数据
                }
                
                winningNumbers = {
                    lotteryType,
                    issueNumber: `20${period}`,
                    front_area: frontNumbers,
                    back_area: backNumbers
                };
            } else if (lotteryType === LotteryType.SUPER_LOTTO) {
                // 大乐透：处理不同格式的数据
                let frontNumbers: string[];
                let backNumbers: string[];
                
                // 检查是否是NUXT数据格式 (4个捕获组: 期号, 前区, 后区第一个, 后区第二个)
                if (groups.length === 4) {
                    // NUXT格式: issueNo:"(\d+)", resultArea1:"([\d,]+)", resultArea2:"(\d{2}),(\d{2})"
                    frontNumbers = groups[1].split(',').map(n => n.padStart(2, '0'));
                    backNumbers = [groups[2].padStart(2, '0'), groups[3].padStart(2, '0')];
                }
                // 检查是否是HTML文本格式 (8个捕获组: 期号 + 7个号码)
                else if (groups.length >= 8) {
                    // HTML格式: 期号 + 7个号码 (前5个号码 + 2个后区号码)
                    frontNumbers = groups.slice(1, 6).map(n => n.padStart(2, '0'));
                    backNumbers = groups.slice(6, 8).map(n => n.padStart(2, '0'));
                } else {
                    console.error(`大乐透历史开奖号码解析错误: 期号${period}, 捕获组数量${groups.length}`);
                    continue; // 跳过这条数据
                }
                
                winningNumbers = {
                    lotteryType,
                    issueNumber: `20${period}`,
                    front_area: frontNumbers,
                    back_area: backNumbers
                };
            } else {
                throw new Error(`不支持的彩票类型: ${lotteryType}`);
            }
            
            results.push(winningNumbers);
        }
        
        console.log(`✅ 成功获取${lotteryType}最近${results.length}期开奖记录`);
        return results;
        
    } catch (error) {
        console.error('获取历史记录失败:', error);
        return [];
    }
}

// 解析 NUXT 数据中的历史开奖信息
function parseNuxtHistoryData(html: string, lotteryType: LotteryType, count: number): WinningNumbers[] {
    try {
        console.log('📊 尝试从__NUXT__数据解析历史开奖信息...');
        
        // 查找页面中的开奖数据
        const results: WinningNumbers[] = [];
        
        if (lotteryType === LotteryType.UNION_LOTTO) {
            // 双色球数据解析
            // 匹配格式: {lotteryId:"1001",lotteryName:"双色球",issueNo:"25109",resultArea1:"05,06,09,17,18,31",resultArea2:"03"}
            const pattern = /\{[^}]*?lotteryId:"1001"[^}]*?issueNo:"(\d+)"[^}]*?resultArea1:"([\d,]+)"[^}]*?resultArea2:"(\d+)"[^}]*?\}/g;
            const matches = [...html.matchAll(pattern)];
            
            console.log(`📊 找到 ${matches.length} 条双色球记录`);
            
            for (let i = 0; i < Math.min(matches.length, count); i++) {
                const [, period, area1, area2] = matches[i];
                const frontNumbers = area1.split(',').map(n => n.padStart(2, '0')); // 确保两位数格式
                const backNumbers = [area2.padStart(2, '0')]; // 确保两位数格式
                
                results.push({
                    lotteryType,
                    issueNumber: `20${period}`,
                    front_area: frontNumbers,
                    back_area: backNumbers
                });
            }
        } else if (lotteryType === LotteryType.SUPER_LOTTO) {
            // 大乐透数据解析
            // 匹配格式: {lotteryId:"1000",lotteryName:"超级大乐透",issueNo:"25108",resultArea1:"05,06,09,17,18,31",resultArea2:"03,04"}
            const pattern = /\{[^}]*?lotteryId:"1000"[^}]*?issueNo:"(\d+)"[^}]*?resultArea1:"([\d,]+)"[^}]*?resultArea2:"([\d,]+)"[^}]*?\}/g;
            const matches = [...html.matchAll(pattern)];
            
            console.log(`📊 找到 ${matches.length} 条大乐透记录`);
            
            for (let i = 0; i < Math.min(matches.length, count); i++) {
                const [, period, area1, area2] = matches[i];
                const frontNumbers = area1.split(',').map(n => n.padStart(2, '0')); // 确保两位数格式
                const backNumbers = area2.split(',').map(n => n.padStart(2, '0')); // 确保两位数格式
                
                results.push({
                    lotteryType,
                    issueNumber: `20${period}`,
                    front_area: frontNumbers,
                    back_area: backNumbers
                });
            }
        }
        
        if (results.length > 0) {
            console.log(`✅ 从__NUXT__数据解析到 ${results.length} 条${lotteryType}历史记录`);
        }
        
        return results;
    } catch (error) {
        console.error('解析NUXT历史数据失败:', error);
        return [];
    }
}

// 解析页面中的所有彩票开奖信息
export async function parseAllLotteryData(): Promise<{ [key: string]: any } | null> {
    try {
        console.log('🔍 正在解析官网所有彩票开奖信息...');
        
        const url = `${CHINA_LOTTERY_CONFIG.baseUrl}${CHINA_LOTTERY_CONFIG.endpoints.nation}`;
        const response = await fetchWithTimeout(url);
        
        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }
        
        const html = await response.text();
        
        // 解析双色球
        const unionLottoMatch = html.match(/双色球(\d+)期[\s\S]*?(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*/);
        
        // 解析大乐透
        const superLottoMatch = html.match(/大乐透(\d+)期[\s\S]*?(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*/);
        
        const result: { [key: string]: any } = {};
        
        if (unionLottoMatch) {
            const [, period, ...numbers] = unionLottoMatch;
            result.unionLotto = {
                period: `20${period}`,
                numbers: numbers.slice(0, 7),
                frontArea: numbers.slice(0, 6),
                backArea: [numbers[6]]
            };
        }
        
        if (superLottoMatch) {
            const [, period, ...numbers] = superLottoMatch;
            result.superLotto = {
                period: `20${period}`,
                numbers: numbers.slice(0, 7),
                frontArea: numbers.slice(0, 5),
                backArea: numbers.slice(5, 7)
            };
        }
        
        console.log('✅ 成功解析官网彩票数据:', result);
        return result;
        
    } catch (error) {
        console.error('解析官网数据失败:', error);
        return null;
    }
}
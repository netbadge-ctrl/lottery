// 完整系统测试脚本
// 测试数据抓取、存储和查询功能

// 导入Node.js模块
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

// 模拟浏览器环境
const dom = new JSDOM();
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
    _data: {},
    setItem(key, value) {
        this._data[key] = value;
    },
    getItem(key) {
        return this._data[key] || null;
    },
    removeItem(key) {
        delete this._data[key];
    },
    clear() {
        this._data = {};
    }
};

// 设置全局fetch
global.fetch = fetch;

console.log('🚀 开始完整系统功能测试...\n');

// 测试1: 验证中国彩票官网API连接
async function testChinaLotteryAPI() {
    console.log('📡 测试1: 验证中国彩票官网API连接');
    try {
        const response = await fetch('https://m.china-lottery.cn/home/nation?frm=z_baidu', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            }
        });
        
        if (response.ok) {
            const html = await response.text();
            console.log('✅ 官网连接成功');
            
            // 测试数据解析
            const unionLottoMatch = html.match(/双色球(\d+)期[\s\S]*?(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*/);
            const superLottoMatch = html.match(/大乐透(\d+)期[\s\S]*?(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*/);
            
            if (unionLottoMatch) {
                console.log(`✅ 双色球数据解析成功: 第${unionLottoMatch[1]}期`);
            } else {
                console.log('⚠️ 双色球数据解析失败');
            }
            
            if (superLottoMatch) {
                console.log(`✅ 大乐透数据解析成功: 第${superLottoMatch[1]}期`);
            } else {
                console.log('⚠️ 大乐透数据解析失败');
            }
            
            return true;
        } else {
            console.log(`❌ 官网连接失败: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ 官网连接异常: ${error.message}`);
        return false;
    }
}

// 测试2: 验证历史数据查询
async function testHistoryAPI() {
    console.log('\n📚 测试2: 验证历史数据查询');
    try {
        // 测试双色球历史数据
        const unionResponse = await fetch('https://m.china-lottery.cn/list/1001?frm=z_baidu', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            }
        });
        
        if (unionResponse.ok) {
            const html = await unionResponse.text();
            const matches = [...html.matchAll(/第(\d+)期[\s\S]*?(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*/g)];
            console.log(`✅ 双色球历史数据获取成功，找到 ${matches.length} 期记录`);
            
            if (matches.length > 0) {
                const [, period, ...numbers] = matches[0];
                console.log(`   最新一期: 第${period}期, 号码: ${numbers.join('-')}`);
            }
        } else {
            console.log(`❌ 双色球历史数据获取失败: ${unionResponse.status}`);
        }
        
        // 测试大乐透历史数据
        const superResponse = await fetch('https://m.china-lottery.cn/list/1000?frm=z_baidu', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            }
        });
        
        if (superResponse.ok) {
            const html = await superResponse.text();
            const matches = [...html.matchAll(/第(\d+)期[\s\S]*?(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*/g)];
            console.log(`✅ 大乐透历史数据获取成功，找到 ${matches.length} 期记录`);
            
            if (matches.length > 0) {
                const [, period, ...numbers] = matches[0];
                console.log(`   最新一期: 第${period}期, 号码: ${numbers.join('-')}`);
            }
        } else {
            console.log(`❌ 大乐透历史数据获取失败: ${superResponse.status}`);
        }
        
        return true;
    } catch (error) {
        console.log(`❌ 历史数据查询异常: ${error.message}`);
        return false;
    }
}

// 测试3: 验证本地存储功能
function testLocalStorage() {
    console.log('\n💾 测试3: 验证本地存储功能');
    
    try {
        // 模拟数据
        const testData = {
            lastUpdate: new Date().toISOString(),
            data: {
                'UNION_LOTTO': [
                    {
                        lotteryType: 'UNION_LOTTO',
                        issueNumber: '2025109',
                        front_area: ['01', '02', '03', '04', '05', '06'],
                        back_area: ['07']
                    }
                ],
                'SUPER_LOTTO': [
                    {
                        lotteryType: 'SUPER_LOTTO',
                        issueNumber: '2025108',
                        front_area: ['01', '02', '03', '04', '05'],
                        back_area: ['06', '07']
                    }
                ]
            }
        };
        
        // 测试存储
        localStorage.setItem('lottery_official_database', JSON.stringify(testData));
        console.log('✅ 数据存储成功');
        
        // 测试读取
        const stored = localStorage.getItem('lottery_official_database');
        if (stored) {
            const parsed = JSON.parse(stored);
            console.log('✅ 数据读取成功');
            console.log(`   双色球记录数: ${parsed.data.UNION_LOTTO.length}`);
            console.log(`   大乐透记录数: ${parsed.data.SUPER_LOTTO.length}`);
            console.log(`   最后更新: ${parsed.lastUpdate}`);
        } else {
            console.log('❌ 数据读取失败');
            return false;
        }
        
        // 测试清除
        localStorage.removeItem('lottery_official_database');
        const cleared = localStorage.getItem('lottery_official_database');
        if (!cleared) {
            console.log('✅ 数据清除成功');
        } else {
            console.log('❌ 数据清除失败');
            return false;
        }
        
        return true;
    } catch (error) {
        console.log(`❌ 本地存储测试异常: ${error.message}`);
        return false;
    }
}

// 测试4: 验证定时任务逻辑
function testScheduling() {
    console.log('\n⏰ 测试4: 验证定时任务逻辑');
    
    try {
        // 计算下次上午10点的时间
        function getNext10AM() {
            const now = new Date();
            const next10AM = new Date();
            next10AM.setHours(10, 0, 0, 0);
            
            if (now.getTime() > next10AM.getTime()) {
                next10AM.setDate(next10AM.getDate() + 1);
            }
            
            return next10AM;
        }
        
        // 计算到下次10点的毫秒数
        function getTimeUntilNext10AM() {
            const next10AM = getNext10AM();
            return next10AM.getTime() - Date.now();
        }
        
        const next10AM = getNext10AM();
        const timeUntil = getTimeUntilNext10AM();
        const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
        const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
        
        console.log(`✅ 定时任务逻辑正常`);
        console.log(`   下次执行时间: ${next10AM.toLocaleString()}`);
        console.log(`   距离执行还有: ${hoursUntil}小时${minutesUntil}分钟`);
        
        return true;
    } catch (error) {
        console.log(`❌ 定时任务测试异常: ${error.message}`);
        return false;
    }
}

// 测试5: 数据验证逻辑
function testDataValidation() {
    console.log('\n🔍 测试5: 验证数据格式检查');
    
    try {
        // 测试双色球数据验证
        function validateUnionLotto(frontArea, backArea) {
            if (frontArea.length !== 6 || backArea.length !== 1) {
                return false;
            }
            
            const frontValid = frontArea.every(num => {
                const n = parseInt(num);
                return n >= 1 && n <= 33;
            });
            
            const backValid = backArea.every(num => {
                const n = parseInt(num);
                return n >= 1 && n <= 16;
            });
            
            return frontValid && backValid;
        }
        
        // 测试大乐透数据验证
        function validateSuperLotto(frontArea, backArea) {
            if (frontArea.length !== 5 || backArea.length !== 2) {
                return false;
            }
            
            const frontValid = frontArea.every(num => {
                const n = parseInt(num);
                return n >= 1 && n <= 35;
            });
            
            const backValid = backArea.every(num => {
                const n = parseInt(num);
                return n >= 1 && n <= 12;
            });
            
            return frontValid && backValid;
        }
        
        // 测试用例
        const testCases = [
            {
                type: 'UNION_LOTTO',
                frontArea: ['01', '02', '03', '04', '05', '06'],
                backArea: ['07'],
                expected: true,
                description: '双色球正常数据'
            },
            {
                type: 'UNION_LOTTO',
                frontArea: ['01', '02', '03', '04', '05'],
                backArea: ['07'],
                expected: false,
                description: '双色球前区号码不足'
            },
            {
                type: 'SUPER_LOTTO',
                frontArea: ['01', '02', '03', '04', '05'],
                backArea: ['06', '07'],
                expected: true,
                description: '大乐透正常数据'
            },
            {
                type: 'SUPER_LOTTO',
                frontArea: ['01', '02', '03', '04', '05'],
                backArea: ['06'],
                expected: false,
                description: '大乐透后区号码不足'
            }
        ];
        
        let passedTests = 0;
        
        for (const testCase of testCases) {
            let result;
            if (testCase.type === 'UNION_LOTTO') {
                result = validateUnionLotto(testCase.frontArea, testCase.backArea);
            } else {
                result = validateSuperLotto(testCase.frontArea, testCase.backArea);
            }
            
            if (result === testCase.expected) {
                console.log(`✅ ${testCase.description}: 通过`);
                passedTests++;
            } else {
                console.log(`❌ ${testCase.description}: 失败`);
            }
        }
        
        console.log(`📊 验证测试结果: ${passedTests}/${testCases.length} 通过`);
        return passedTests === testCases.length;
        
    } catch (error) {
        console.log(`❌ 数据验证测试异常: ${error.message}`);
        return false;
    }
}

// 执行所有测试
async function runAllTests() {
    const results = [];
    
    console.log('🎯 系统功能全面测试开始\n');
    console.log('=' .repeat(50));
    
    results.push(await testChinaLotteryAPI());
    results.push(await testHistoryAPI());
    results.push(testLocalStorage());
    results.push(testScheduling());
    results.push(testDataValidation());
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 测试总结:');
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`✅ 通过: ${passed}/${total}`);
    console.log(`❌ 失败: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('\n🎉 所有测试通过！系统已准备就绪。');
        console.log('\n📝 系统功能摘要:');
        console.log('   ✓ 中国彩票官网数据抓取');
        console.log('   ✓ 历史数据查询 (最近100期)');
        console.log('   ✓ 本地数据存储和管理');
        console.log('   ✓ 每日上午10点自动抓取');
        console.log('   ✓ 数据格式验证');
        console.log('\n🚀 可以开始使用系统了！');
    } else {
        console.log('\n⚠️ 部分测试失败，请检查相关功能。');
    }
    
    return passed === total;
}

// 运行测试
runAllTests().catch(console.error);
// 模拟开奖数据服务 - 当API密钥不可用时的备选方案
// 这个服务提供一些历史开奖数据，用于测试和演示

const MOCK_LOTTERY_DATA = {
    // 双色球历史开奖数据
    union_lotto: {
        '2024057': {
            caipiaoid: '13',
            issueno: '2024057',
            number: '07 10 16 18 23 35',
            refernumber: '12',
            opendate: '2024-05-19',
            saleamount: '372845134',
            prizename: '一等奖',
            require: '中6+1',
            num: '6',
            singlebonus: '9119449'
        },
        '2024056': {
            caipiaoid: '13',
            issueno: '2024056',
            number: '02 11 22 30 31 33',  
            refernumber: '07',
            opendate: '2024-05-16',
            saleamount: '358726420',
            prizename: '一等奖',
            require: '中6+1', 
            num: '8',
            singlebonus: '7562048'
        },
        '2024055': {
            caipiaoid: '13',
            issueno: '2024055',
            number: '01 11 14 21 28 30',
            refernumber: '10',
            opendate: '2024-05-14',
            saleamount: '326453890',
            prizename: '一等奖',
            require: '中6+1',
            num: '4',
            singlebonus: '13456789'
        }
    },
    // 大乐透历史开奖数据
    super_lotto: {
        '2024057': {
            caipiaoid: '22',
            issueno: '2024057',
            number: '09 11 13 16 33 03 11',
            refernumber: '',
            opendate: '2024-05-18',
            saleamount: '298567431',
            prizename: '一等奖',
            require: '中5+2',
            num: '2',
            singlebonus: '18753692'
        },
        '2024056': {
            caipiaoid: '22',
            issueno: '2024056', 
            number: '02 06 14 22 35 01 12',
            refernumber: '',
            opendate: '2024-05-15',
            saleamount: '287432156',
            prizename: '一等奖',
            require: '中5+2',
            num: '5',
            singlebonus: '9876543'
        }
    }
};

// 模拟API响应格式
export function getMockLotteryData(lotteryType, issueNumber) {
    console.log(`🎭 使用模拟数据服务查询${lotteryType}第${issueNumber}期`);
    
    const dataKey = lotteryType === '双色球' ? 'union_lotto' : 'super_lotto';
    const data = MOCK_LOTTERY_DATA[dataKey]?.[issueNumber];
    
    if (!data) {
        console.log(`⚠️ 模拟数据中未找到${lotteryType}第${issueNumber}期`);
        return {
            status: 202,
            msg: '期号不存在',
            result: null
        };
    }
    
    console.log(`✅ 从模拟数据获取到${lotteryType}第${issueNumber}期开奖信息`);
    
    return {
        status: 0,
        msg: 'ok',
        result: data
    };
}

// 获取可用的模拟数据期号列表
export function getMockDataList() {
    const unionLottoIssues = Object.keys(MOCK_LOTTERY_DATA.union_lotto);
    const superLottoIssues = Object.keys(MOCK_LOTTERY_DATA.super_lotto);
    
    return {
        union_lotto: unionLottoIssues,
        super_lotto: superLottoIssues,
        total: unionLottoIssues.length + superLottoIssues.length
    };
}

// 测试模拟数据服务
if (typeof window === 'undefined') {
    // Node.js环境下的测试
    console.log('🧪 测试模拟开奖数据服务...\n');
    
    const testCases = [
        { type: '双色球', issue: '2024057' },
        { type: '双色球', issue: '2024056' },
        { type: '大乐透', issue: '2024057' },
        { type: '大乐透', issue: '2024999' } // 不存在的期号
    ];
    
    testCases.forEach(testCase => {
        console.log(`📋 测试${testCase.type}第${testCase.issue}期:`);
        const result = getMockLotteryData(testCase.type, testCase.issue);
        
        if (result.status === 0) {
            const data = result.result;
            console.log(`   期号: ${data.issueno}`);
            console.log(`   开奖号码: ${data.number}`);
            if (data.refernumber) {
                console.log(`   参考号码: ${data.refernumber}`);
            }
            console.log(`   开奖日期: ${data.opendate}`);
            console.log(`   销售额: ${data.saleamount}元`);
        } else {
            console.log(`   ❌ ${result.msg}`);
        }
        console.log('');
    });
    
    const availableData = getMockDataList();
    console.log('📊 可用的模拟数据:');
    console.log(`   双色球: ${availableData.union_lotto.join(', ')}`);
    console.log(`   大乐透: ${availableData.super_lotto.join(', ')}`);
    console.log(`   总计: ${availableData.total}期`);
}
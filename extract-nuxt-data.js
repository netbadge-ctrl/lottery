// 提取和解析NUXT数据的脚本
import { readFileSync, writeFileSync } from 'fs';

// 读取HTML文件
const htmlContent = readFileSync('./debug-page-2.html', 'utf8');

// 提取NUXT数据
const nuxtMatch = htmlContent.match(/window\.__NUXT__\s*=\s*(\(.+?)<\/script>/s);
if (nuxtMatch) {
    let nuxtDataStr = nuxtMatch[1];
    console.log('找到NUXT数据，长度:', nuxtDataStr.length);
    
    // 尝试解析NUXT数据
    try {
        // 移除末尾可能的多余内容
        nuxtDataStr = nuxtDataStr.replace(/\s*<\/script>.*/, '');
        
        // 为了正确解析，我们需要构造一个完整的表达式
        // 由于数据是函数形式，我们需要模拟调用它
        console.log('正在尝试解析NUXT数据...');
        console.log('数据预览:', nuxtDataStr.substring(0, 200) + '...');
        
        // 保存原始数据到文件供进一步分析
        writeFileSync('./nuxt-raw-data.js', `// NUXT原始数据\nexport default ${nuxtDataStr};\n`, 'utf8');
        console.log('原始NUXT数据已保存到 nuxt-raw-data.js');
        
    } catch (error) {
        console.error('解析NUXT数据时出错:', error.message);
        console.log('保存原始数据供手动分析...');
        writeFileSync('./nuxt-raw-data.txt', nuxtDataStr, 'utf8');
    }
} else {
    console.log('未找到NUXT数据');
}

// 同时尝试查找页面中的开奖数据
const issueMatches = [...htmlContent.matchAll(/第(\d+)期[\s\S]*?(\d{2})[\s\S]*?(\d{2})[\s\S]*?(\d{2})[\s\S]*?(\d{2})[\s\S]*?(\d{2})[\s\S]*?(\d{2})[\s\S]*?(\d{2})/g)];
console.log(`找到 ${issueMatches.length} 期开奖数据`);

// 提取前几期数据作为示例
for (let i = 0; i < Math.min(5, issueMatches.length); i++) {
    const match = issueMatches[i];
    console.log(`第${i+1}期: ${match[1]} - ${match[2]} ${match[3]} ${match[4]} ${match[5]} ${match[6]} ${match[7]} 蓝球:${match[8]}`);
}
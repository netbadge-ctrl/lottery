// 调试页面内容脚本
// 用于分析中国彩票官网的实际页面结构

import fetch from 'node-fetch';
import { writeFileSync } from 'fs';

async function debugPageContent() {
    console.log('🔍 开始调试页面内容...\n');
    
    const urls = [
        'https://m.china-lottery.cn/home/nation?frm=z_baidu',
        'https://m.china-lottery.cn/list/1001?frm=z_baidu',
        'https://m.china-lottery.cn/list/1000?frm=z_baidu'
    ];
    
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const filename = `debug-page-${i + 1}.html`;
        
        console.log(`📡 正在获取: ${url}`);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (response.ok) {
                const html = await response.text();
                console.log(`✅ 成功获取页面，长度: ${html.length} 字符`);
                
                // 保存完整页面内容到文件
                writeFileSync(filename, html, 'utf8');
                console.log(`💾 页面内容已保存到: ${filename}`);
                
                // 检查是否包含关键字
                const keywords = ['双色球', '大乐透', '开奖', '期', '__NUXT__', 'window.__NUXT__'];
                for (const keyword of keywords) {
                    const count = (html.match(new RegExp(keyword, 'g')) || []).length;
                    if (count > 0) {
                        console.log(`🔎 找到关键字 "${keyword}": ${count} 次`);
                    }
                }
                
                // 检查是否有内联的JSON数据
                const nuxtMatch = html.match(/window\.__NUXT__\s*=\s*({.+?});/s);
                if (nuxtMatch) {
                    console.log('📊 发现 __NUXT__ 数据');
                    try {
                        const nuxtData = JSON.parse(nuxtMatch[1]);
                        console.log('✅ __NUXT__ 数据解析成功');
                        console.log('📋 数据结构:', Object.keys(nuxtData));
                        
                        // 保存NUXT数据
                        writeFileSync(`debug-nuxt-${i + 1}.json`, JSON.stringify(nuxtData, null, 2), 'utf8');
                        console.log(`💾 NUXT数据已保存到: debug-nuxt-${i + 1}.json`);
                    } catch (error) {
                        console.log('❌ __NUXT__ 数据解析失败:', error.message);
                    }
                }
                
                // 查找可能的API调用
                const apiPatterns = [
                    /fetch\(['"`]([^'"`]+)['"`]\)/g,
                    /\.get\(['"`]([^'"`]+)['"`]\)/g,
                    /axios\.get\(['"`]([^'"`]+)['"`]\)/g,
                    /api\/[^'"`\s]+/g
                ];
                
                for (const pattern of apiPatterns) {
                    const matches = [...html.matchAll(pattern)];
                    if (matches.length > 0) {
                        console.log(`🔗 发现API调用模式:`, matches.map(m => m[1] || m[0]));
                    }
                }
                
            } else {
                console.log(`❌ 请求失败: ${response.status} ${response.statusText}`);
            }
            
        } catch (error) {
            console.log(`❌ 获取页面失败: ${error.message}`);
        }
        
        console.log(''); // 空行分隔
    }
    
    console.log('🎯 调试完成！请检查生成的文件以了解页面结构。');
}

debugPageContent().catch(console.error);
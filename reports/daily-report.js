const fetch = require('node-fetch');
const fs = require('fs');

// Configuration
const CONFIG = {
    shopify: {
        shop: process.env.SHOPIFY_SHOP,
        token: process.env.SHOPIFY_ACCESS_TOKEN
    },
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID
    },
    targets: {
        dailyRevenue: 1000,      // R$ 1.000/dia
        dailyOrders: 3,          // 3 pedidos/dia
        monthlyRevenue: 30000    // R$ 30.000/mês
    }
};

// Shopify API Client
class ShopifyAPI {
    constructor(shop, token) {
        this.baseUrl = `https://${shop}/admin/api/2024-01`;
        this.token = token;
    }
    
    async getOrders(since, until) {
        const url = `${this.baseUrl}/orders.json?` +
            `created_at_min=${since.toISOString()}` +
            `&created_at_max=${until.toISOString()}` +
            `&limit=250&status=any`;
        
        const response = await fetch(url, {
            headers: {
                'X-Shopify-Access-Token': this.token,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`Shopify API error: ${response.status}`);
        
        const data = await response.json();
        return data.orders;
    }
}

// Report Generator
class DailyReport {
    constructor() {
        this.shopify = new ShopifyAPI(CONFIG.shopify.shop, CONFIG.shopify.token);
        this.today = new Date();
        this.yesterday = new Date(this.today);
        this.yesterday.setDate(this.yesterday.getDate() - 1);
        this.lastWeek = new Date(this.today);
        this.lastWeek.setDate(this.lastWeek.getDate() - 7);
    }
    
    async generate() {
        console.log('📊 Generating daily report...');
        
        // Get yesterday's data
        const yesterdayStart = new Date(this.yesterday);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(this.yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        
        // Get same day last week for comparison
        const lastWeekStart = new Date(this.lastWeek);
        lastWeekStart.setHours(0, 0, 0, 0);
        const lastWeekEnd = new Date(this.lastWeek);
        lastWeekEnd.setHours(23, 59, 59, 999);
        
        // Fetch data
        const [yesterdayOrders, lastWeekOrders] = await Promise.all([
            this.shopify.getOrders(yesterdayStart, yesterdayEnd),
            this.shopify.getOrders(lastWeekStart, lastWeekEnd)
        ]);
        
        // Calculate metrics
        const metrics = this.calculateMetrics(yesterdayOrders, lastWeekOrders);
        
        // Generate report text
        const report = this.formatReport(metrics);
        
        // Save to file
        fs.mkdirSync('output', { recursive: true });
        fs.writeFileSync('output/latest.json', JSON.stringify({
            date: this.yesterday.toISOString(),
            metrics,
            generatedAt: new Date().toISOString()
        }, null, 2));
        
        // Send to Telegram
        await this.sendToTelegram(report);
        
        console.log('✅ Report generated and sent!');
    }
    
    calculateMetrics(yesterdayOrders, lastWeekOrders) {
        const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
        const yesterdayCount = yesterdayOrders.length;
        const yesterdayAOV = yesterdayCount > 0 ? yesterdayRevenue / yesterdayCount : 0;
        
        const lastWeekRevenue = lastWeekOrders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
        const lastWeekCount = lastWeekOrders.length;
        
        // Calculate changes
        const revenueChange = lastWeekRevenue > 0 
            ? ((yesterdayRevenue - lastWeekRevenue) / lastWeekRevenue * 100).toFixed(1)
            : 0;
        const ordersChange = lastWeekCount > 0
            ? ((yesterdayCount - lastWeekCount) / lastWeekCount * 100).toFixed(1)
            : 0;
        
        // Target progress
        const revenueProgress = (yesterdayRevenue / CONFIG.targets.dailyRevenue * 100).toFixed(0);
        
        // Top product
        const productSales = {};
        yesterdayOrders.forEach(order => {
            order.line_items.forEach(item => {
                if (!productSales[item.title]) {
                    productSales[item.title] = { count: 0, revenue: 0 };
                }
                productSales[item.title].count += item.quantity;
                productSales[item.title].revenue += parseFloat(item.price) * item.quantity;
            });
        });
        
        const topProduct = Object.entries(productSales)
            .sort((a, b) => b[1].revenue - a[1].revenue)[0];
        
        return {
            date: this.yesterday.toLocaleDateString('pt-BR'),
            revenue: yesterdayRevenue,
            orders: yesterdayCount,
            aov: yesterdayAOV,
            revenueChange,
            ordersChange,
            revenueProgress,
            topProduct: topProduct ? { name: topProduct[0], ...topProduct[1] } : null,
            vsLastWeek: {
                revenue: lastWeekRevenue,
                orders: lastWeekCount
            }
        };
    }
    
    formatReport(m) {
        const emoji = {
            revenue: parseFloat(m.revenueChange) >= 0 ? '📈' : '📉',
            orders: parseFloat(m.ordersChange) >= 0 ? '📈' : '📉',
            target: parseFloat(m.revenueProgress) >= 100 ? '✅' : '⚠️'
        };
        
        const trend = (val) => parseFloat(val) >= 0 ? '+' + val : val;
        
        return `🌅 <b>Criativalia — Relatório Diário</b>
${m.date}

═══════════════════════
💰 VENDAS DE ONTEM
═══════════════════════

Receita: <b>R$ ${m.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</b>
${emoji.revenue} vs semana passada: ${trend(m.revenueChange)}%
Meta: ${m.revenueProgress}% ${emoji.target}

Pedidos: <b>${m.orders}</b>
${emoji.orders} vs semana passada: ${trend(m.ordersChange)}%

Ticket Médio: R$ ${m.aov.toFixed(2)}

${m.topProduct ? `
🏆 Produto mais vendido:
${m.topProduct.name}
${m.topProduct.count} unidades — R$ ${m.topProduct.revenue.toFixed(2)}` : ''}

═══════════════════════
🎯 FOCO DE HOJE
═══════════════════════

${parseFloat(m.revenueProgress) < 100 
    ? `• Recuperar ${(100 - parseFloat(m.revenueProgress))}% da meta` 
    : '• Manter momentum — meta batida!'}

${m.orders < CONFIG.targets.dailyOrders 
    ? `• Acelerar vendas (${CONFIG.targets.dailyOrders - m.orders} pedidos abaixo da meta)` 
    : '• Ótimo volume de pedidos!'}

• Revisar estoque dos produtos mais vendidos

═══════════════════════
💡 Insight do Dia
═══════════════════════

${this.generateInsight(m)}

---
🤖 Relatório automático | Criativalia OS`;
    }
    
    generateInsight(m) {
        const insights = [];
        
        if (parseFloat(m.revenueChange) > 20) {
            insights.push('🚀 Vendas 20% acima da semana passada! Identificar o que funcionou e replicar.');
        } else if (parseFloat(m.revenueChange) < -20) {
            insights.push('⚠️ Queda de 20% vs semana passada. Verificar tráfego e conversão.');
        }
        
        if (m.aov > 350) {
            insights.push('💎 Ticket médio acima de R$ 350. Foco em upsell está funcionando.');
        } else if (m.aov < 250) {
            insights.push('📦 Ticket médio abaixo da meta. Testar bundles e frete grátis.');
        }
        
        if (m.orders === 0) {
            insights.push('🚨 Dia sem vendas. Urgente: verificar campanhas e site.');
        }
        
        if (insights.length === 0) {
            insights.push('📊 Performance estável. Foco em otimização contínua.');
        }
        
        return insights[0];
    }
    
    async sendToTelegram(text) {
        const url = `https://api.telegram.org/bot${CONFIG.telegram.botToken}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CONFIG.telegram.chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });
        
        if (!response.ok) {
            console.error('Failed to send Telegram message:', await response.text());
        } else {
            console.log('📤 Report sent to Telegram');
        }
    }
}

// Run
const report = new DailyReport();
report.generate().catch(err => {
    console.error('❌ Error generating report:', err);
    process.exit(1);
});

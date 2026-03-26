/**
 * Shopify API Integration
 * Fetches data from Shopify Admin API
 */

class ShopifyAPI {
    constructor(shopDomain, accessToken) {
        this.shopDomain = shopDomain;
        this.accessToken = accessToken;
        this.baseUrl = `https://${shopDomain}/admin/api/2024-01`;
    }
    
    // Test connection
    async testConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/shop.json`, {
                headers: {
                    'X-Shopify-Access-Token': this.accessToken,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Connection failed');
            
            const data = await response.json();
            return { success: true, shop: data.shop };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Get orders with date filter
    async getOrders(sinceDate = null) {
        let url = `${this.baseUrl}/orders.json?limit=250&status=any`;
        
        if (sinceDate) {
            url += `&created_at_min=${sinceDate.toISOString()}`;
        }
        
        try {
            const response = await fetch(url, {
                headers: {
                    'X-Shopify-Access-Token': this.accessToken,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch orders');
            
            const data = await response.json();
            return { success: true, orders: data.orders };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Get products
    async getProducts() {
        try {
            const response = await fetch(`${this.baseUrl}/products.json?limit=250`, {
                headers: {
                    'X-Shopify-Access-Token': this.accessToken,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch products');
            
            const data = await response.json();
            return { success: true, products: data.products };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Get customers
    async getCustomers() {
        try {
            const response = await fetch(`${this.baseUrl}/customers.json?limit=250`, {
                headers: {
                    'X-Shopify-Access-Token': this.accessToken,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch customers');
            
            const data = await response.json();
            return { success: true, customers: data.customers };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Calculate metrics from orders
    calculateMetrics(orders) {
        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
        const totalOrders = orders.length;
        const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Group by day
        const byDay = {};
        orders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('pt-BR');
            if (!byDay[date]) byDay[date] = { revenue: 0, orders: 0 };
            byDay[date].revenue += parseFloat(order.total_price);
            byDay[date].orders += 1;
        });
        
        // Top products
        const productCounts = {};
        orders.forEach(order => {
            order.line_items.forEach(item => {
                if (!productCounts[item.title]) {
                    productCounts[item.title] = { count: 0, revenue: 0 };
                }
                productCounts[item.title].count += item.quantity;
                productCounts[item.title].revenue += parseFloat(item.price) * item.quantity;
            });
        });
        
        const topProducts = Object.entries(productCounts)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 10)
            .map(([name, data]) => ({ name, ...data }));
        
        return {
            totalRevenue,
            totalOrders,
            aov,
            byDay,
            topProducts
        };
    }
    
    // Get all metrics for date range
    async getMetrics(days = 30) {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);
        
        const ordersResult = await this.getOrders(sinceDate);
        if (!ordersResult.success) return ordersResult;
        
        const metrics = this.calculateMetrics(ordersResult.orders);
        
        return {
            success: true,
            metrics,
            rawOrders: ordersResult.orders
        };
    }
}

// Export
window.ShopifyAPI = ShopifyAPI;

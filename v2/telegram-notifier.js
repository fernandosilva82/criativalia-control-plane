/**
 * Telegram Notifier Module
 * Integrates with Criativalia Control Plane
 * Standards: TELEGRAM_MESSAGE_ENGINE_PRO
 */

class TelegramNotifier {
    constructor(config = {}) {
        this.botToken = config.botToken || localStorage.getItem('telegram_bot_token');
        this.chatId = config.chatId || localStorage.getItem('telegram_chat_id');
        this.enabled = this.botToken && this.chatId;
        this.messageQueue = [];
        this.lastMessageTime = 0;
        this.rateLimitMs = 2000; // 2 seconds between messages
        
        // Message counters for rate limiting
        this.hourlyCount = 0;
        this.lastHourReset = Date.now();
        this.maxHourlyMessages = 20;
    }
    
    // Configure with tokens
    configure(botToken, chatId) {
        this.botToken = botToken;
        this.chatId = chatId;
        this.enabled = true;
        
        // Persist in localStorage
        localStorage.setItem('telegram_bot_token', botToken);
        localStorage.setItem('telegram_chat_id', chatId);
        
        return this.sendTestMessage();
    }
    
    // Check if we can send (rate limiting)
    canSend() {
        const now = Date.now();
        
        // Reset hourly counter
        if (now - this.lastHourReset > 3600000) {
            this.hourlyCount = 0;
            this.lastHourReset = now;
        }
        
        // Check rate limits
        if (this.hourlyCount >= this.maxHourlyMessages) {
            console.warn('[TelegramNotifier] Hourly limit reached');
            return false;
        }
        
        if (now - this.lastMessageTime < this.rateLimitMs) {
            return false;
        }
        
        return true;
    }
    
    // Send message via Telegram Bot API
    async sendMessage(text, options = {}) {
        if (!this.enabled) {
            console.log('[TelegramNotifier] Disabled - no token configured');
            return { success: false, error: 'Not configured' };
        }
        
        if (!options.force && !this.canSend()) {
            // Queue message for later
            this.messageQueue.push({ text, options });
            return { success: false, queued: true };
        }
        
        const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
        
        const payload = {
            chat_id: this.chatId,
            text: text,
            parse_mode: 'HTML',
            disable_notification: options.silent || false
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (data.ok) {
                this.lastMessageTime = Date.now();
                this.hourlyCount++;
                console.log('[TelegramNotifier] Sent:', text.substring(0, 50) + '...');
                return { success: true, messageId: data.result.message_id };
            } else {
                console.error('[TelegramNotifier] API Error:', data.description);
                return { success: false, error: data.description };
            }
        } catch (error) {
            console.error('[TelegramNotifier] Network Error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // TEMPLATE METHODS
    
    async sendHeartbeat(stats) {
        const text = `📊 <b>Criativalia Status</b>

Agents: ${stats.activeAgents} active
Tasks: ${stats.runningTasks} running | ${stats.blockedTasks} blocked
Projects: ${stats.activeProjects} in progress

<b>Recent:</b>
${stats.recentProgress.map(p => `• ${p}`).join('\n') || '• No recent activity'}

<b>Next:</b> ${stats.nextFocus || 'Monitoring...'}`;

        return this.sendMessage(text, { silent: true });
    }
    
    async sendDecision(context, options, recommended, impact) {
        const optionsText = options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
        
        const text = `⚠️ <b>Decision Needed</b>

<b>Context:</b>
${context}

<b>Options:</b>
${optionsText}

✅ <b>Recommended:</b> ${recommended}
<b>Impact:</b> ${impact}

Reply: 1, 2, or 3`;

        return this.sendMessage(text, { force: true }); // Always send decisions immediately
    }
    
    async sendSuccess(project, result, url, status, nextStep) {
        const text = `✅ <b>Completed</b>

<b>${project}</b>
Result: ${result}
${url ? `🔗 <a href="${url}">View</a>` : ''}

Status: ${status}
Next: ${nextStep}`;

        return this.sendMessage(text);
    }
    
    async sendError(project, stage, problem, fix, urgent = false) {
        const text = `❌ <b>Error</b>

<b>${project}</b>
Stage: ${stage}

<b>Problem:</b> ${problem}
<b>Fix:</b> ${fix}

${urgent ? '🚨 <b>Urgent action required</b>' : ''}`;

        return this.sendMessage(text, { force: true });
    }
    
    async sendIdea(agent, idea, benefit, risk) {
        const text = `💡 <b>Opportunity</b>

Agent: ${agent}
Idea: ${idea}
Benefit: ${benefit}
Risk: ${risk}

<i>Auto-proceed in 5min unless stopped.</i>`;

        return this.sendMessage(text);
    }
    
    async sendBlocked(task, reason, needed, action) {
        const text = `⛔ <b>Blocked</b>

Task: ${task}
Reason: ${reason}

Needed: ${needed}
Suggested: ${action}`;

        return this.sendMessage(text, { force: true });
    }
    
    // Test message
    async sendTestMessage() {
        return this.sendMessage(
            `🚀 <b>Criativalia Control Plane</b>\n\n` +
            `Telegram Notifier connected successfully!\n` +
            `Ready to receive updates.`,
            { force: true }
        );
    }
    
    // Process queued messages
    async processQueue() {
        if (this.messageQueue.length === 0) return;
        if (!this.canSend()) return;
        
        const next = this.messageQueue.shift();
        await this.sendMessage(next.text, next.options);
    }
}

// Auto-start queue processor
setInterval(() => {
    if (window.telegramNotifier) {
        window.telegramNotifier.processQueue();
    }
}, 5000);

// Export for Control Plane integration
window.TelegramNotifier = TelegramNotifier;

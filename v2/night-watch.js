/**
 * Night Watch Module
 * Monitors Criativalia Control Plane during night hours (22:00-07:00)
 * Standards: RUNTIME_NOTIFICATION_ENGINE + TELEGRAM_MESSAGE_ENGINE
 */

class NightWatch {
    constructor(config = {}) {
        this.shiftStart = config.shiftStart || 22; // 22:00
        this.shiftEnd = config.shiftEnd || 7;      // 07:00
        this.reportTime = config.reportTime || 7;  // 07:00
        this.patrolInterval = config.patrolInterval || 30 * 60 * 1000; // 30 min
        
        this.isActive = false;
        this.events = [];
        this.patrolCount = 0;
        this.lastPatrol = null;
        
        // Thresholds
        this.thresholds = {
            errorCount: 3,
            backlogSize: 20,
            stuckAgentHours: 2
        };
        
        // Telegram notifier reference
        this.notifier = window.telegramNotifier || null;
    }
    
    // Check if currently in night shift
    isNightShift() {
        const hour = new Date().getHours();
        // Night shift: 22:00 - 07:00
        return hour >= this.shiftStart || hour < this.shiftEnd;
    }
    
    // Check if it's time for morning report
    isReportTime() {
        const now = new Date();
        return now.getHours() === this.reportTime && now.getMinutes() < 5;
    }
    
    // Start night watch
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.events = [];
        this.patrolCount = 0;
        
        console.log('[NIGHT_WATCH] 🌙 Shift started');
        this.logEvent('shift_start', 'Night watch activated');
        
        // Start patrol cycle
        this.patrolIntervalId = setInterval(() => this.patrol(), this.patrolInterval);
        
        // Start report checker
        this.reportIntervalId = setInterval(() => this.checkReportTime(), 60000); // Check every minute
        
        // Immediate first patrol
        this.patrol();
    }
    
    // Stop night watch
    stop() {
        this.isActive = false;
        clearInterval(this.patrolIntervalId);
        clearInterval(this.reportIntervalId);
        console.log('[NIGHT_WATCH] 🌅 Shift ended');
        this.logEvent('shift_end', 'Night watch deactivated');
    }
    
    // Patrol check
    patrol() {
        if (!this.isActive) return;
        
        this.patrolCount++;
        this.lastPatrol = new Date();
        
        console.log(`[NIGHT_WATCH] Patrol #${this.patrolCount} at ${this.lastPatrol.toLocaleTimeString()}`);
        
        // Check system health
        const health = this.checkSystemHealth();
        
        // Check for critical issues
        const critical = this.checkCriticalIssues();
        
        if (critical.length > 0) {
            this.alertCritical(critical);
        }
        
        // Log patrol
        this.logEvent('patrol', `Patrol #${this.patrolCount}`, { health, critical: critical.length });
    }
    
    // Check system health
    checkSystemHealth() {
        // Get data from Control Plane
        const agents = JSON.parse(localStorage.getItem('cp_agents') || '[]');
        const tasks = JSON.parse(localStorage.getItem('cp_tasks') || '[]');
        const logs = JSON.parse(localStorage.getItem('cp_logs') || '[]');
        
        const activeAgents = agents.filter(a => a.status === 'running').length;
        const totalAgents = agents.length;
        const runningTasks = tasks.filter(t => t.status === 'running').length;
        const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
        const backlogSize = tasks.filter(t => t.status === 'pending').length;
        
        // Count errors in last 4 hours
        const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
        const recentErrors = logs.filter(l => 
            l.type === 'error' && l.timestamp > fourHoursAgo
        ).length;
        
        return {
            activeAgents,
            totalAgents,
            runningTasks,
            blockedTasks,
            backlogSize,
            recentErrors,
            health: this.calculateHealth(activeAgents, totalAgents, recentErrors)
        };
    }
    
    // Calculate system health percentage
    calculateHealth(active, total, errors) {
        if (total === 0) return 100;
        const agentHealth = (active / total) * 100;
        const errorPenalty = Math.min(errors * 10, 50);
        return Math.max(0, Math.round(agentHealth - errorPenalty));
    }
    
    // Check for critical issues
    checkCriticalIssues() {
        const issues = [];
        const health = this.checkSystemHealth();
        
        if (health.recentErrors >= this.thresholds.errorCount) {
            issues.push({
                type: 'error_threshold',
                severity: 'high',
                message: `${health.recentErrors} errors in last 4 hours`
            });
        }
        
        if (health.backlogSize >= this.thresholds.backlogSize) {
            issues.push({
                type: 'backlog_threshold',
                severity: 'medium',
                message: `Backlog at ${health.backlogSize} tasks`
            });
        }
        
        if (health.activeAgents === 0 && health.totalAgents > 0) {
            issues.push({
                type: 'all_agents_idle',
                severity: 'low',
                message: 'All agents idle - may be normal'
            });
        }
        
        return issues;
    }
    
    // Alert on critical issues
    alertCritical(issues) {
        const highSeverity = issues.filter(i => i.severity === 'high');
        
        if (highSeverity.length > 0 && this.notifier) {
            const text = highSeverity.map(i => `• ${i.message}`).join('\n');
            this.notifier.sendError(
                'NIGHT_WATCH Alert',
                'Monitoring',
                text,
                'Check Control Plane',
                true
            );
        }
    }
    
    // Check if it's time for morning report
    checkReportTime() {
        if (this.isReportTime() && this.events.length > 0) {
            this.generateMorningReport();
        }
    }
    
    // Generate and send morning report
    generateMorningReport() {
        const health = this.checkSystemHealth();
        const date = new Date().toLocaleDateString('pt-BR');
        
        // Count events by type
        const errors = this.events.filter(e => e.type === 'error' || e.type === 'critical').length;
        const warnings = this.events.filter(e => e.type === 'warning').length;
        const normal = this.events.filter(e => e.type === 'patrol' || e.type === 'shift_start').length;
        
        // Determine status
        let status = '🟢 Normal';
        if (errors > 0) status = '🔴 Action Needed';
        else if (warnings > 0) status = '🟡 Attention';
        
        const report = `🌅 <b>Criativalia Night Report</b>
${date} | Shift: 22:00-07:00

═══════════════════════
📊 OVERNIGHT SUMMARY
═══════════════════════

Status: ${status}

Events: ${this.events.length} total | ${errors} errors | ${warnings} warnings
Patrols: ${this.patrolCount}
System Health: ${health.health}%

═══════════════════════
📈 METRICS SNAPSHOT
═══════════════════════

Active Agents: ${health.activeAgents}/${health.totalAgents}
Running Tasks: ${health.runningTasks}
Blocked Tasks: ${health.blockedTasks}
Backlog: ${health.backlogSize}
Recent Errors: ${health.recentErrors}

═══════════════════════
🎯 RECOMMENDATIONS
═══════════════════════

${this.generateRecommendations(health)}

═══════════════════════
📋 HANDOFF
═══════════════════════

Night watch complete.
Next shift: Tonight 22:00

---
🌙 NIGHT_WATCH`;

        // Send via Telegram
        if (this.notifier) {
            this.notifier.sendMessage(report);
        }
        
        // Log locally
        console.log('[NIGHT_WATCH] Morning report generated');
        this.logEvent('morning_report', 'Report delivered', { health });
        
        // Clear events for next shift
        this.events = [];
    }
    
    // Generate recommendations based on health
    generateRecommendations(health) {
        const recs = [];
        
        if (health.recentErrors > 0) {
            recs.push(`1. Review ${health.recentErrors} errors from overnight`);
        }
        
        if (health.backlogSize > 10) {
            recs.push(`2. Address backlog (${health.backlogSize} pending tasks)`);
        }
        
        if (health.blockedTasks > 0) {
            recs.push(`3. Unblock ${health.blockedTasks} stuck tasks`);
        }
        
        if (recs.length === 0) {
            recs.push('1. System healthy - continue normal operations');
            recs.push('2. Review opportunities in Control Plane');
        }
        
        return recs.join('\n');
    }
    
    // Log event
    logEvent(type, message, data = {}) {
        this.events.push({
            timestamp: Date.now(),
            type,
            message,
            data
        });
        
        // Persist to localStorage
        localStorage.setItem('nightwatch_events', JSON.stringify(this.events));
    }
    
    // Auto-start if in night shift
    autoStart() {
        if (this.isNightShift()) {
            this.start();
        } else {
            console.log('[NIGHT_WATCH] Outside shift hours, waiting...');
            // Check every hour if shift started
            setInterval(() => {
                if (this.isNightShift() && !this.isActive) {
                    this.start();
                } else if (!this.isNightShift() && this.isActive) {
                    this.stop();
                }
            }, 3600000); // Check every hour
        }
    }
}

// Export for Control Plane
window.NightWatch = NightWatch;

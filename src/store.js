const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../database');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default agents data
const DEFAULT_AGENTS = [
    {
        id: 'ceo_orchestrator',
        name: 'CEO_ORCHESTRATOR',
        role: 'Chief Executive Officer / System Orchestrator',
        status: 'idle',
        description: 'Orquestra todos os agentes, toma decisões estratégicas, maximiza lucro',
        skills: ['strategy', 'coordination', 'decision_making', 'resource_allocation'],
        config: { priority: 10, auto_start: false },
        created_at: new Date().toISOString()
    },
    {
        id: 'traffic_manager',
        name: 'TRAFFIC_MANAGER',
        role: 'Gestor de Tráfego Pago',
        status: 'idle',
        description: 'Gerencia campanhas Meta Ads e Google Ads, otimiza ROAS',
        skills: ['meta_ads', 'google_ads', 'analytics', 'creative_strategy'],
        config: { budget_daily: 50, priority: 9, auto_start: false },
        created_at: new Date().toISOString()
    },
    {
        id: 'shopify_specialist',
        name: 'SHOPIFY_SPECIALIST',
        role: 'Especialista Shopify',
        status: 'idle',
        description: 'Otimiza loja, gerencia produtos, integra APIs',
        skills: ['shopify_api', 'ecommerce', 'inventory', 'seo'],
        config: { priority: 8, auto_start: false },
        created_at: new Date().toISOString()
    },
    {
        id: 'copywriter',
        name: 'COPYWRITER',
        role: 'Redator de Conversão',
        status: 'idle',
        description: 'Cria copy para ads, produtos, emails que vende',
        skills: ['copywriting', 'seo', 'email_marketing', 'brand_voice'],
        config: { priority: 7, auto_start: false },
        created_at: new Date().toISOString()
    },
    {
        id: 'designer',
        name: 'DESIGNER',
        role: 'Designer Visual',
        status: 'idle',
        description: 'Cria visuais, mockups, assets para campanhas',
        skills: ['graphic_design', 'ui_design', 'brand_identity', 'canva_figma'],
        config: { priority: 7, auto_start: false },
        created_at: new Date().toISOString()
    },
    {
        id: 'dev_automation',
        name: 'DEV_AUTOMATION_AI',
        role: 'Desenvolvedor / Automação',
        status: 'idle',
        description: 'Desenvolve scripts, automações, integrações',
        skills: ['javascript', 'python', 'automation', 'apis', 'scraping'],
        config: { priority: 8, auto_start: false },
        created_at: new Date().toISOString()
    },
    {
        id: 'data_analyst',
        name: 'DATA_ANALYST',
        role: 'Analista de Dados',
        status: 'idle',
        description: 'Analisa métricas, gera relatórios, identifica insights',
        skills: ['analytics', 'sql', 'data_viz', 'reporting'],
        config: { priority: 6, auto_start: false },
        created_at: new Date().toISOString()
    },
    {
        id: 'executor',
        name: 'EXECUTOR',
        role: 'Executor de Tarefas',
        status: 'idle',
        description: 'Executa tarefas operacionais rapidamente',
        skills: ['execution', 'research', 'data_entry', 'validation'],
        config: { priority: 5, auto_start: false },
        created_at: new Date().toISOString()
    }
];

class JSONStore {
    constructor(filename) {
        this.filepath = path.join(DATA_DIR, filename);
        this.data = this.load();
    }

    load() {
        try {
            if (fs.existsSync(this.filepath)) {
                return JSON.parse(fs.readFileSync(this.filepath, 'utf8'));
            }
        } catch (err) {
            console.error(`Error loading ${this.filepath}:`, err);
        }
        return [];
    }

    save() {
        try {
            fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2));
        } catch (err) {
            console.error(`Error saving ${this.filepath}:`, err);
        }
    }

    getAll() {
        return this.data;
    }

    getById(id) {
        return this.data.find(item => item.id === id);
    }

    create(item) {
        this.data.push(item);
        this.save();
        return item;
    }

    update(id, updates) {
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) return null;
        this.data[index] = { ...this.data[index], ...updates, updated_at: new Date().toISOString() };
        this.save();
        return this.data[index];
    }

    delete(id) {
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) return false;
        this.data.splice(index, 1);
        this.save();
        return true;
    }
}

// Initialize stores
const agents = new JSONStore('agents.json');
const sessions = new JSONStore('sessions.json');
const tasks = new JSONStore('tasks.json');
const logs = new JSONStore('logs.json');
const changes = new JSONStore('changes.json');
const state = new JSONStore('state.json');

// Seed agents if empty
if (agents.getAll().length === 0) {
    DEFAULT_AGENTS.forEach(agent => agents.create(agent));
    console.log('✅ Seeded', DEFAULT_AGENTS.length, 'agents');
}

// Initialize state
if (state.getAll().length === 0) {
    state.create({
        id: 'runtime',
        status: 'running',
        last_heartbeat: new Date().toISOString(),
        active_agents: 0,
        active_tasks: 0,
        active_projects: 0
    });
}

module.exports = { agents, sessions, tasks, logs, changes, state };

# CRIATIVALIA_MEMORY_AND_REUSE_ENGINE — System Extension

## Purpose
Give Criativalia agents persistent operational memory, project continuity, reusable tools, and script reuse logic.

**The system must learn over time. It must not repeatedly forget what was already solved.**

---

## AGENT MEMORY ENGINE

### Each agent maintains memory.

**Memory types:**

### WORK_MEMORY
- current task
- current objective
- current blockers
- current assumptions

### EXPERIENCE_MEMORY
- what worked before
- what failed before
- patterns that were successful
- patterns that caused problems

### PREFERENCE_MEMORY
- Fernando preferences
- preferred stacks
- preferred UI style
- preferred communication style
- preferred deployment style

### DECISION_MEMORY
- past approved choices
- rejected choices
- architectural preferences
- deployment preferences
- UX decisions

### Rules:
- before starting important work, review relevant memory
- before proposing options, check if similar decision already exists
- before rebuilding a script, check if a reusable one already exists
- before changing architecture, check if prior constraints exist

**Agents must not behave like they are starting from zero every time.**

---

## PROJECT STATE ENGINE

### Each project maintains state.

**Project state includes:**
- project_name
- goal
- owner_agent
- status
- current_phase
- completed_steps
- pending_steps
- blocked_steps
- known_risks
- known_decisions
- known_urls
- known_commands
- known_env_requirements
- known_deploy_status
- next_milestone

### Status values:
- planning
- active
- blocked
- review
- ready_for_deploy
- deployed
- needs_fix
- completed

### Rules:
- every project must have a clear current phase
- every project must have a next milestone
- every important command or URL should be attached to project memory
- deploy state must be remembered
- blocked reasons must be explicit
- avoid losing project continuity between cycles

**Project history matters.**

---

## TOOL MEMORY ENGINE

### The system remembers useful tools and reusable technical assets.

**Tool memory examples:**
- deploy scripts
- bootstrap scripts
- diagnostic scripts
- healthcheck scripts
- repo setup patterns
- Vercel deployment flows
- GitHub branching flows
- UI layout patterns
- dashboard card patterns
- notification formatting patterns

**For each tool memory, store:**
- tool_name
- tool_type
- purpose
- inputs
- outputs
- when_to_use
- known_limitations
- last_success
- last_failure
- recommended_owner_agent

### Rules:
- before creating a new tool, search for reusable tool memory
- prefer improving existing useful tools over recreating them
- if a tool repeatedly works, elevate it as standard
- if a tool repeatedly fails, mark it risky and review it

---

## SCRIPT REUSE ENGINE

### Scripts are reusable assets.

**Script categories:**
- setup
- bootstrap
- deploy
- healthcheck
- diagnostic
- rollback
- sync
- cleanup
- verification

**Each script should have reusable metadata:**
- script_name
- purpose
- dependencies
- safe_to_rerun
- required_env
- expected_output
- failure_modes
- last_verified
- owner_agent

### Rules:
- never create a new script if a suitable script already exists
- if existing script is close, extend it instead of replacing blindly
- if script is one-off but useful, store for reuse
- scripts should become part of a reusable internal library

---

## MEMORY CHECK RULE

### Before major actions, perform this check:

1. [ ] has something similar been done before?
2. [ ] is there an existing project state?
3. [ ] is there a reusable script?
4. [ ] is there a remembered preferred pattern?
5. [ ] is there a previous failure to avoid?

**If yes, use memory first.**

---

## DECISION CONTINUITY RULE

**If Fernando already approved something similar before, prefer that direction unless a strong reason exists to change it.**

Do not repeatedly escalate the same class of decision unless context changed meaningfully.

---

## PATTERN LIBRARY RULE

### The system builds internal reusable patterns.

**Pattern examples:**
- premium dashboard layout
- telegram message structure
- deploy report structure
- preview verification checklist
- shell script UX pattern
- agent detail screen pattern
- task card pattern
- decision card pattern

**If a pattern works well repeatedly, promote it into standard operating pattern.**

---

## FAILURE MEMORY RULE

### The system must remember failures.

**Failure memory examples:**
- build failed due to missing env
- preview failed due to wrong output config
- UI looked too raw
- script lacked dependency checks
- logs were unclear
- deploy succeeded technically but app was broken

### Rules:
- repeated failure should trigger review
- repeated failure should update templates
- repeated failure should improve standards

**Do not repeat known avoidable mistakes.**

---

## SUCCESS MEMORY RULE

### The system must remember success.

**Success memory examples:**
- deployment pattern that worked
- dashboard structure that looked premium
- bash formatting style that was clean
- report style Fernando liked
- workflow that reduced friction

### Rules:
- successful patterns should be reused
- successful patterns should become defaults
- successful patterns should influence future decisions

---

## PROJECT HANDOFF RULE

### When switching context or pausing work, create a handoff memory:

```
Current state: [short]
What works: [list]
What is blocked: [list]
Next step: [short]
Important files: [list]
Important commands: [list]
```

**This prevents context loss.**

---

## REUSE PRIORITY RULE

### Prefer this order:

1. **reuse proven pattern**
2. **improve reusable asset**
3. **adapt near-fit solution**
4. **create new from scratch**

**Only build from scratch when needed.**

---

## FINAL RULE

**Criativalia agents must become better with repetition.**

A strong autonomous company does not only act.  
It **remembers**, **reuses**, and **improves**.

---

*Extension Version: 1.0*

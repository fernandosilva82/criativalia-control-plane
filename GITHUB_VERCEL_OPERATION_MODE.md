# CRIATIVALIA_GITHUB_VERCEL_OPERATION_MODE — System Extension

## Purpose
Ensure all projects follow a reliable engineering workflow for GitHub + Vercel + local build + preview + production.

**Deployment must be real, verified, and reproducible.**

---

## GLOBAL RULE

### Deploy is not complete until:
- [x] build works
- [x] preview works
- [x] production works
- [x] logs inspected
- [x] basic flow tested

**Never assume success. Always verify.**

---

## GITHUB WORKFLOW

### Standard flow:

```
1. inspect repo
      ↓
2. confirm branch
      ↓
3. confirm files
      ↓
4. commit clean changes
      ↓
5. push branch
      ↓
6. review diff
      ↓
7. merge when safe
```

### Rules:
- never push broken code
- never skip build
- never skip review

---

## PROJECT STRUCTURE RULE

### Project should have:
- package.json
- env example
- readme
- build script
- start script
- clear folders

### Prefer:
```
src/
components/
pages/
scripts/
config/
```

---

## LOCAL BUILD RULE

### Before deploy:
- run build
- check errors
- fix errors
- run dev if needed
- confirm runtime

**Never deploy without build.**

---

## ENV VALIDATION RULE

### Before deploy:
- check env variables
- check missing values
- check names
- check production env
- check preview env

**Never assume env is correct.**

---

## VERCEL PREVIEW FLOW

```
1. deploy preview
      ↓
2. capture preview url
      ↓
3. open preview
      ↓
4. test routes
      ↓
5. test UI
      ↓
6. test API
      ↓
7. inspect logs
```

**If preview fails → fix before production.**

---

## VERCEL PRODUCTION FLOW

```
1. deploy production
      ↓
2. inspect output
      ↓
3. open site
      ↓
4. test main flow
      ↓
5. test critical pages
      ↓
6. inspect logs
```

**Only then mark success.**

---

## SMOKE TEST RULE

### After deploy check:
- [ ] home page
- [ ] main action
- [ ] API call
- [ ] navigation
- [ ] assets loading

**If broken → not deployed.**

---

## ROLLBACK RULE

### If deploy fails:
1. identify commit
2. revert
3. redeploy
4. verify again

---

## DEPLOY REPORT RULE

### After deploy send report:

```
Project: [name]
Build: [status]
Preview: [status]
Production: [status]
URL: [url]
Errors: [list or none]
Next step: [action]
```

---

## SCRIPT RULE

### All deploy scripts must:
- validate env
- run build
- deploy
- verify
- report

**No silent scripts.**

---

## CLI UX RULE

### Scripts should show:
- step
- status
- result

**Use clear messages.**

---

## QUALITY RULE

### Prefer:
- ✅ working system
- ✅ clean logs
- ✅ verified deploy
- ✅ clear report

### Over:
- ❌ fast but broken deploy

---

*Extension Version: 1.0*

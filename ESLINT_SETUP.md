# ESLint Setup Guide

ESLint has been configured for the MiniTrackingSystem project!

## ✅ What's Installed

- **ESLint 8.57.1** - JavaScript linter
- **Airbnb Base Config** - Popular style guide
- **Prettier** - Code formatter
- **ESLint-Prettier Integration** - Combines linting and formatting

## 📁 Configuration Files

- **[.eslintrc.json](.eslintrc.json)** - ESLint rules configuration
- **[.eslintignore](.eslintignore)** - Files to skip linting
- **[.prettierrc](.prettierrc)** - Prettier formatting rules
- **[.prettierignore](.prettierignore)** - Files to skip formatting
- **[.vscode/settings.json](.vscode/settings.json)** - VSCode integration
- **[.vscode/extensions.json](.vscode/extensions.json)** - Recommended extensions

## 🚀 NPM Scripts

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Format all files with Prettier
npm run format

# Check if files are formatted correctly
npm run format:check
```

## 🔧 VSCode Integration

### Recommended Extensions

Install these VSCode extensions:

1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)
3. **SQLite** (`alexcvzz.vscode-sqlite`)
4. **REST Client** (`humao.rest-client`)

### Auto-Fix on Save

The VSCode settings are configured to:

- ✅ Format code with Prettier on save
- ✅ Auto-fix ESLint errors on save
- ✅ Use 2 spaces for indentation
- ✅ Trim trailing whitespace
- ✅ Insert final newline

## 🐛 Remaining Manual Fixes Needed

After running `npm run lint:fix`, there are 22 errors that need manual fixes:

### 1. Database Seeds (`database/seeds/runSeeds.js`)

**Issue:** `await` inside loops (not recommended for performance)

**Current code:**

```javascript
for (const [name, description] of factions) {
  await run('INSERT OR IGNORE INTO factions...', [name, description]);
}
```

**Fix:** Use `Promise.all()` for concurrent execution:

```javascript
await Promise.all(
  factions.map(([name, description]) =>
    run('INSERT OR IGNORE INTO factions (name, description) VALUES (?, ?)', [name, description])
  )
);
```

**Issue:** Snake_case identifiers (database fields)

**Fix:** Add ESLint disable comment:

```javascript
// eslint-disable-next-line camelcase
const [name, faction_id, unit_type_id, points, base_size, description] = miniature;
```

### 2. Auth Middleware (`middleware/auth.js`)

**Issue:** Argument name clash on line 44

**Current code:**

```javascript
function optionalAuth(req, res, next) {
  next();
}
```

**Fix:** The middleware doesn't use `req` or `res`, so prefix with underscore:

```javascript
function optionalAuth(_req, _res, next) {
  next();
}
```

### 3. User Model (`models/User.js`)

**Issue:** Redundant `await` on return

**Line 103:**

```javascript
return await bcrypt.compare(plainPassword, passwordHash);
```

**Fix:**

```javascript
return bcrypt.compare(plainPassword, passwordHash);
```

### 4. Routes (factions.js, unitTypes.js, miniatures.js)

**Issue:** Missing radix parameter for `parseInt()`

**Current code:**

```javascript
parseInt(factionId);
```

**Fix:** Always specify base 10:

```javascript
parseInt(factionId, 10);
```

**Issue:** Using `isNaN()` instead of `Number.isNaN()`

**Current code:**

```javascript
if (isNaN(points) || points < 0) {
```

**Fix:**

```javascript
if (Number.isNaN(points) || points < 0) {
```

### 5. Server.js

**Issue:** Unused `next` parameter in error handler

**Current code:**

```javascript
app.use((err, req, res, next) => {
  console.error('Error:', err);
  // ...
});
```

**Fix:** Prefix with underscore:

```javascript
app.use((err, req, res, _next) => {
  console.error('Error:', err);
  // ...
});
```

## 🔨 Quick Fix Script

Run this to fix all remaining issues:

```bash
# 1. Fix server.js
sed -i 's/app\.use((err, req, res, next)/app.use((err, req, res, _next)/' server.js

# 2. Fix middleware/auth.js
sed -i 's/function optionalAuth(req, res, next)/function optionalAuth(_req, _res, next)/' middleware/auth.js

# 3. Fix User model
sed -i 's/return await bcrypt\.compare/return bcrypt.compare/' models/User.js

# 4. Run lint:fix again
npm run lint:fix
```

Or fix them manually following the guide above.

## 📋 ESLint Rules Reference

### Key Rules Configured

- **Quotes:** Single quotes (`'string'`)
- **Semicolons:** Required (`;`)
- **Indentation:** 2 spaces
- **Max Line Length:** 120 characters
- **Trailing Commas:** Required for multiline
- **Console:** Allowed (it's a backend!)
- **Arrow Functions:** Require parentheses around arguments
- **Unused Variables:** Prefix with `_` to ignore

### Database Field Naming

Database fields use `snake_case` (e.g., `user_id`, `faction_id`). To disable camelCase warnings:

```javascript
// eslint-disable-next-line camelcase
const { user_id, faction_id } = row;
```

### Disabling Rules

For specific lines:

```javascript
// eslint-disable-next-line no-console
console.log('Debug info');
```

For entire files:

```javascript
/* eslint-disable no-console */
// ... file content
/* eslint-enable no-console */
```

## 🎯 Best Practices

1. **Run lint before committing:**

   ```bash
   npm run lint
   npm run format:check
   ```

2. **Fix issues as you code** - VSCode will auto-fix on save

3. **Don't disable rules** unless absolutely necessary

4. **Use Prettier for formatting** - It's integrated with ESLint

5. **Check CI/CD** - Add linting to your deployment pipeline

## 🚫 What's Ignored

ESLint ignores:

- `node_modules/`
- `dist/`, `build/`, `out/`
- Database files (`*.db`)
- Logs (`*.log`)
- Generated/minified files
- Temporary files

## 📚 Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Rules Reference](https://eslint.org/docs/latest/rules/)

## 🔄 Updating Dependencies

Keep ESLint and plugins updated:

```bash
npm update eslint eslint-config-airbnb-base eslint-plugin-import prettier
```

---

**Next Steps:**

1. Fix the 22 remaining manual errors (see guide above)
2. Run `npm run lint` to verify
3. Commit the ESLint configuration
4. Enjoy automatic code quality checks!

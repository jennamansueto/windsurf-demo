---
name: test-scaffolding
description: Generate Jest test files for JavaScript modules in this game - creates properly structured test files with mocks, imports, and describe blocks matching project conventions
---

# Test Scaffolding Skill

Use this skill when creating new test files for JavaScript modules. Run the bundled generator script or follow the patterns below to ensure consistency with existing tests.

---

## Quick Start

Run the generator script to scaffold a new test file:

```bash
node .windsurf/skills/test-scaffolding/generate-test.js <module-name>
```

Example:
```bash
node .windsurf/skills/test-scaffolding/generate-test.js powerups
# Creates: static/js/__tests__/powerups.test.js
```

---

## Test File Structure

All test files follow this structure:

```javascript
// 1. Imports from the module under test
import { functionA, functionB } from '../moduleName.js';

// 2. Imports from dependencies (gameState, config, etc.)
import { gameState } from '../gameState.js';
import { SOME_CONSTANT } from '../config.js';

// 3. Mocks (if needed)
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: []
  },
  mouse: { x: 0, y: 0 }
}));

// 4. Describe blocks for each exported function
describe('functionA', () => {
  beforeEach(() => {
    // Reset state before each test
    gameState.playerCells = [];
  });

  test('describes expected behavior', () => {
    // Arrange
    const input = { /* ... */ };
    
    // Act
    const result = functionA(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

---

## Conventions

### File Location
- Tests go in `static/js/__tests__/`
- Name: `<module>.test.js` (matches source file name)

### Mocking gameState
Most modules depend on `gameState`. Use this mock pattern:

```javascript
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: [],
    camera: { x: 0, y: 0 },
    playerName: 'TestPlayer'
  },
  mouse: { x: 0, y: 0 }
}));
```

### Mocking config.js
Import constants directly (no mock needed):

```javascript
import { FOOD_SIZE, STARTING_SCORE, AI_COUNT } from '../config.js';
```

### Test Naming
- Use descriptive test names: `'does not split cell below minimum score'`
- Group related tests in `describe` blocks by function name

### beforeEach Pattern
Reset mutable state before each test:

```javascript
beforeEach(() => {
  gameState.playerCells = [];
  gameState.aiPlayers = [];
  mouse.x = 0;
  mouse.y = 0;
});
```

---

## Common Assertions

```javascript
// Exact equality
expect(value).toBe(expected);

// Object equality
expect(obj).toEqual({ x: 10, y: 20 });

// Approximate numbers
expect(value).toBeCloseTo(3.14, 2);

// Comparisons
expect(value).toBeGreaterThan(0);
expect(array.length).toBe(5);

// Property existence
expect(obj).toHaveProperty('name');
```

---

## Running Tests

```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- entities.test   # Run specific test file
```

#!/usr/bin/env node

/**
 * Test Scaffolding Generator
 * 
 * Generates a Jest test file for a JavaScript module in this game.
 * 
 * Usage:
 *   node .windsurf/skills/test-scaffolding/generate-test.js <module-name>
 * 
 * Example:
 *   node .windsurf/skills/test-scaffolding/generate-test.js powerups
 *   # Creates: static/js/__tests__/powerups.test.js
 */

const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Usage: node generate-test.js <module-name>');
  console.error('Example: node generate-test.js powerups');
  process.exit(1);
}

const projectRoot = path.resolve(__dirname, '../../..');
const sourceFile = path.join(projectRoot, 'static/js', `${moduleName}.js`);
const testDir = path.join(projectRoot, 'static/js/__tests__');
const testFile = path.join(testDir, `${moduleName}.test.js`);

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
  console.error(`Source file not found: static/js/${moduleName}.js`);
  console.error('Available modules:');
  const jsFiles = fs.readdirSync(path.join(projectRoot, 'static/js'))
    .filter(f => f.endsWith('.js') && !f.includes('.test.'))
    .map(f => f.replace('.js', ''));
  jsFiles.forEach(f => console.error(`  - ${f}`));
  process.exit(1);
}

// Check if test file already exists
if (fs.existsSync(testFile)) {
  console.error(`Test file already exists: static/js/__tests__/${moduleName}.test.js`);
  process.exit(1);
}

// Parse source file for exports
const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
const exportMatches = sourceContent.match(/export\s+(function|const|let|var)\s+(\w+)/g) || [];
const exportedNames = exportMatches.map(match => {
  const parts = match.split(/\s+/);
  return parts[parts.length - 1];
});

// Check for gameState dependency
const usesGameState = sourceContent.includes("from './gameState.js'") || 
                      sourceContent.includes('from "../gameState.js"') ||
                      sourceContent.includes('gameState');

// Check for config dependency
const configImportMatch = sourceContent.match(/import\s*{([^}]+)}\s*from\s*['"]\.\/config\.js['"]/);
const configImports = configImportMatch 
  ? configImportMatch[1].split(',').map(s => s.trim()).filter(Boolean)
  : [];

// Generate test file content
let testContent = '';

// Imports from module under test
if (exportedNames.length > 0) {
  testContent += `import { ${exportedNames.join(', ')} } from '../${moduleName}.js';\n`;
} else {
  testContent += `// TODO: Add imports from '../${moduleName}.js'\n`;
}

// gameState import and mock
if (usesGameState) {
  testContent += `import { gameState, mouse } from '../gameState.js';\n`;
}

// Config imports
if (configImports.length > 0) {
  testContent += `import { ${configImports.join(', ')} } from '../config.js';\n`;
}

testContent += '\n';

// gameState mock
if (usesGameState) {
  testContent += `// Mock gameState and mouse
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

`;
}

// Generate describe blocks for each export
if (exportedNames.length > 0) {
  exportedNames.forEach((name, index) => {
    testContent += `describe('${name}', () => {\n`;
    
    if (usesGameState) {
      testContent += `  beforeEach(() => {\n`;
      testContent += `    // Reset state before each test\n`;
      testContent += `    gameState.playerCells = [];\n`;
      testContent += `    gameState.aiPlayers = [];\n`;
      testContent += `    gameState.food = [];\n`;
      testContent += `    mouse.x = 0;\n`;
      testContent += `    mouse.y = 0;\n`;
      testContent += `  });\n\n`;
    }
    
    testContent += `  test('TODO: describe expected behavior', () => {\n`;
    testContent += `    // Arrange\n`;
    testContent += `    \n`;
    testContent += `    // Act\n`;
    testContent += `    // const result = ${name}();\n`;
    testContent += `    \n`;
    testContent += `    // Assert\n`;
    testContent += `    // expect(result).toBe(expected);\n`;
    testContent += `    expect(true).toBe(true); // TODO: Replace with real test\n`;
    testContent += `  });\n`;
    testContent += `});\n`;
    
    if (index < exportedNames.length - 1) {
      testContent += '\n';
    }
  });
} else {
  testContent += `describe('${moduleName}', () => {\n`;
  testContent += `  test('TODO: add tests', () => {\n`;
  testContent += `    expect(true).toBe(true);\n`;
  testContent += `  });\n`;
  testContent += `});\n`;
}

// Ensure test directory exists
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Write test file
fs.writeFileSync(testFile, testContent);

console.log(`Created: static/js/__tests__/${moduleName}.test.js`);
console.log(`\nExports found: ${exportedNames.length > 0 ? exportedNames.join(', ') : '(none detected)'}`);
console.log(`\nNext steps:`);
console.log(`  1. Review and update the generated test file`);
console.log(`  2. Replace TODO placeholders with real tests`);
console.log(`  3. Run: npm test -- ${moduleName}.test`);

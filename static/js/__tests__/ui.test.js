import { initUI } from '../ui.js';
import { gameState } from '../gameState.js';
import { FEATURE_FLAGS } from '../config.js';

// Mock gameState
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: [],
    camera: { x: 0, y: 0 },
    playerName: 'TestPlayer',
    nightMode: false
  },
  mouse: { x: 0, y: 0 }
}));

// Mock config with a mutable FEATURE_FLAGS so we can toggle in tests
jest.mock('../config.js', () => ({
  FEATURE_FLAGS: {
    NIGHT_MODE: true
  }
}));

// Helper to set up DOM elements needed by initUI
function setupDOM() {
  document.body.innerHTML = `
    <div id="settings-icon"></div>
    <div id="settings-panel">
      <input type="checkbox" id="dark-mode-toggle" />
      <div id="night-mode-control" style="display: none;">
        <input type="checkbox" id="night-mode-toggle" />
      </div>
    </div>
  `;
}

describe('initUI', () => {
  beforeEach(() => {
    setupDOM();
    gameState.nightMode = false;
    localStorage.clear();
  });

  test('loads dark mode preference from localStorage', () => {
    localStorage.setItem('darkMode', 'true');
    initUI();
    expect(document.getElementById('dark-mode-toggle').checked).toBe(true);
  });

  test('settings panel toggles visibility on icon click', () => {
    initUI();
    const icon = document.getElementById('settings-icon');
    const panel = document.getElementById('settings-panel');

    icon.click();
    expect(panel.classList.contains('visible')).toBe(true);

    icon.click();
    expect(panel.classList.contains('visible')).toBe(false);
  });
});

describe('night mode toggle', () => {
  beforeEach(() => {
    setupDOM();
    gameState.nightMode = false;
    localStorage.clear();
    FEATURE_FLAGS.NIGHT_MODE = true;
  });

  test('shows night mode control when feature flag is true', () => {
    initUI();
    const control = document.getElementById('night-mode-control');
    expect(control.style.display).toBe('');
  });

  test('loads night mode preference from localStorage', () => {
    localStorage.setItem('nightMode', 'true');
    initUI();
    expect(gameState.nightMode).toBe(true);
    expect(document.getElementById('night-mode-toggle').checked).toBe(true);
  });

  test('defaults to night mode off when no localStorage value', () => {
    initUI();
    expect(gameState.nightMode).toBe(false);
    expect(document.getElementById('night-mode-toggle').checked).toBe(false);
  });

  test('updates gameState and localStorage when toggled on', () => {
    initUI();
    const toggle = document.getElementById('night-mode-toggle');

    toggle.checked = true;
    toggle.dispatchEvent(new Event('change'));

    expect(gameState.nightMode).toBe(true);
    expect(localStorage.getItem('nightMode')).toBe('true');
  });

  test('updates gameState and localStorage when toggled off', () => {
    localStorage.setItem('nightMode', 'true');
    initUI();
    const toggle = document.getElementById('night-mode-toggle');

    toggle.checked = false;
    toggle.dispatchEvent(new Event('change'));

    expect(gameState.nightMode).toBe(false);
    expect(localStorage.getItem('nightMode')).toBe('false');
  });
});

describe('night mode feature flag gating', () => {
  beforeEach(() => {
    setupDOM();
    gameState.nightMode = false;
    localStorage.clear();
  });

  test('keeps night mode control hidden when feature flag is false', () => {
    FEATURE_FLAGS.NIGHT_MODE = false;
    initUI();
    const control = document.getElementById('night-mode-control');
    expect(control.style.display).toBe('none');
  });

  test('forces gameState.nightMode to false when feature flag is false', () => {
    FEATURE_FLAGS.NIGHT_MODE = false;
    localStorage.setItem('nightMode', 'true');
    initUI();
    expect(gameState.nightMode).toBe(false);
  });
});

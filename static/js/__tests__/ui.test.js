import { initUI } from '../ui.js';
import { gameState } from '../gameState.js';

jest.mock('../gameState.js', () => ({
  gameState: {
    nightMode: false
  }
}));

let settingsIcon, settingsPanel, darkModeToggle, nightModeToggle;

beforeEach(() => {
  gameState.nightMode = false;
  localStorage.clear();

  document.body.innerHTML = `
    <div id="settings-icon"></div>
    <div id="settings-panel">
      <input type="checkbox" id="dark-mode-toggle" />
      <input type="checkbox" id="night-mode-toggle" />
    </div>
  `;

  settingsIcon = document.getElementById('settings-icon');
  settingsPanel = document.getElementById('settings-panel');
  darkModeToggle = document.getElementById('dark-mode-toggle');
  nightModeToggle = document.getElementById('night-mode-toggle');
});

describe('loadDarkMode', () => {
  test('loads dark mode as off by default', () => {
    initUI();
    expect(darkModeToggle.checked).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('');
  });

  test('loads dark mode as on when stored', () => {
    localStorage.setItem('darkMode', 'true');
    initUI();
    expect(darkModeToggle.checked).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('toggleDarkMode', () => {
  test('toggles dark mode on', () => {
    initUI();
    darkModeToggle.checked = true;
    darkModeToggle.dispatchEvent(new Event('change'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  test('toggles dark mode off', () => {
    localStorage.setItem('darkMode', 'true');
    initUI();
    darkModeToggle.checked = false;
    darkModeToggle.dispatchEvent(new Event('change'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('');
    expect(localStorage.getItem('darkMode')).toBe('false');
  });
});

describe('loadNightMode', () => {
  test('loads night mode as off by default', () => {
    initUI();
    expect(nightModeToggle.checked).toBe(false);
    expect(gameState.nightMode).toBe(false);
  });

  test('loads night mode as on when stored', () => {
    localStorage.setItem('nightMode', 'true');
    initUI();
    expect(nightModeToggle.checked).toBe(true);
    expect(gameState.nightMode).toBe(true);
  });
});

describe('toggleNightMode', () => {
  test('toggles night mode on', () => {
    initUI();
    nightModeToggle.checked = true;
    nightModeToggle.dispatchEvent(new Event('change'));
    expect(gameState.nightMode).toBe(true);
    expect(localStorage.getItem('nightMode')).toBe('true');
  });

  test('toggles night mode off', () => {
    localStorage.setItem('nightMode', 'true');
    initUI();
    nightModeToggle.checked = false;
    nightModeToggle.dispatchEvent(new Event('change'));
    expect(gameState.nightMode).toBe(false);
    expect(localStorage.getItem('nightMode')).toBe('false');
  });

  test('persists night mode preference', () => {
    initUI();
    nightModeToggle.checked = true;
    nightModeToggle.dispatchEvent(new Event('change'));
    expect(localStorage.getItem('nightMode')).toBe('true');

    nightModeToggle.checked = false;
    nightModeToggle.dispatchEvent(new Event('change'));
    expect(localStorage.getItem('nightMode')).toBe('false');
  });
});

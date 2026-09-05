/**
 * ==========================================================================
 * KERNEL MASTER: Main Application Bootstrap & Coordinator
 * Connects navigation tabs, global hotkeys, audio & theme toggles, and modals.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Sub-systems
  window.bankerGame = new BankerGame();
  window.schedulerGame = new SchedulerGame();
  window.ragVisualizer = new RAGVisualizer('ragCanvas');
  window.theoryHub = new TheoryHub();

  // Load Saved Settings
  const settings = window.storageManager.loadSettings();

  // 2. Theme Toggle (Light mode by default, can toggle to Dark mode)
  const btnTheme = document.getElementById('btnThemeToggle');
  const themeIcon = document.getElementById('themeIcon');

  if (settings.theme === 'dark') {
    document.body.classList.add('theme-dark');
    if (themeIcon) themeIcon.textContent = '🌙';
  } else {
    document.body.classList.remove('theme-dark');
    if (themeIcon) themeIcon.textContent = '☀️';
  }

  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('theme-dark');
      if (themeIcon) themeIcon.textContent = isDark ? '🌙' : '☀️';
      settings.theme = isDark ? 'dark' : 'light';
      window.storageManager.saveSettings(settings);
      if (window.soundFx) window.soundFx.playClick();
      if (window.ragVisualizer) window.ragVisualizer.render();
    });
  }

  // 3. Sound Toggle
  const btnSound = document.getElementById('btnSoundToggle');
  const soundIcon = document.getElementById('soundIcon');
  if (btnSound && soundIcon) {
    if (settings.soundEnabled === false) {
      window.soundFx.enabled = false;
      soundIcon.textContent = '🔇';
      btnSound.classList.remove('active');
    } else {
      btnSound.classList.add('active');
    }

    btnSound.addEventListener('click', () => {
      const isEnabled = window.soundFx.toggle();
      soundIcon.textContent = isEnabled ? '🔊' : '🔇';
      btnSound.classList.toggle('active', isEnabled);
      settings.soundEnabled = isEnabled;
      window.storageManager.saveSettings(settings);
      if (isEnabled) window.soundFx.playClick();
    });
  }

  // 4. Navigation Tab Router
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.view-panel');

  const switchTab = (targetTabId) => {
    tabs.forEach(t => {
      const isMatch = t.dataset.tab === targetTabId;
      t.classList.toggle('active', isMatch);
      t.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    panels.forEach(p => {
      const isMatch = p.id === targetTabId;
      p.classList.toggle('active', isMatch);
    });

    // Sub-system specific activations
    if (targetTabId === 'rag-view' && window.ragVisualizer && window.bankerGame) {
      window.ragVisualizer.syncFromBanker(
        window.bankerGame.currentLevel,
        window.bankerGame.allocMatrix,
        window.bankerGame.getNeedMatrix(),
        window.bankerGame.available
      );
    } else if (targetTabId === 'scheduler-view' && window.schedulerGame) {
      window.schedulerGame.runSimulation();
    }

    if (window.soundFx) window.soundFx.playClick();
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  // 5. RAG Specific Controls
  const btnRagSync = document.getElementById('btnRagSyncFromBanker');
  if (btnRagSync) {
    btnRagSync.addEventListener('click', () => {
      if (window.bankerGame && window.ragVisualizer) {
        window.ragVisualizer.syncFromBanker(
          window.bankerGame.currentLevel,
          window.bankerGame.allocMatrix,
          window.bankerGame.getNeedMatrix(),
          window.bankerGame.available
        );
        if (window.soundFx) window.soundFx.playAllocate(1.2);
      }
    });
  }

  const btnRagTrap = document.getElementById('btnRagAddDeadlockCycle');
  if (btnRagTrap) {
    btnRagTrap.addEventListener('click', () => {
      if (window.ragVisualizer) window.ragVisualizer.injectDeadlockCycle();
    });
  }

  const btnRagClear = document.getElementById('btnRagClear');
  if (btnRagClear) {
    btnRagClear.addEventListener('click', () => {
      if (window.ragVisualizer) {
        window.ragVisualizer.clear();
        if (window.soundFx) window.soundFx.playClick();
      }
    });
  }

  const btnRagAddProc = document.getElementById('btnRagAddProc');
  if (btnRagAddProc) {
    btnRagAddProc.addEventListener('click', () => {
      if (window.ragVisualizer) {
        const pCount = window.ragVisualizer.nodes.filter(n => n.type === 'process').length;
        window.ragVisualizer.nodes.push({
          id: `proc_custom_${Date.now()}`,
          type: 'process',
          name: `P${pCount}`,
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 300,
          radius: 24
        });
        window.ragVisualizer.render();
        if (window.soundFx) window.soundFx.playAllocate(1.1);
      }
    });
  }

  const btnRagAddRes = document.getElementById('btnRagAddRes');
  if (btnRagAddRes) {
    btnRagAddRes.addEventListener('click', () => {
      if (window.ragVisualizer) {
        const rCount = window.ragVisualizer.nodes.filter(n => n.type === 'resource').length;
        const resNames = ['RAM', 'CPU', 'Disk', 'Printer', 'GPU'];
        const name = resNames[rCount % resNames.length];
        window.ragVisualizer.nodes.push({
          id: `res_custom_${Date.now()}`,
          type: 'resource',
          name: `${name} (R${rCount})`,
          x: 500 + Math.random() * 200,
          y: 100 + Math.random() * 300,
          w: 64,
          h: 46,
          units: 2
        });
        window.ragVisualizer.render();
        if (window.soundFx) window.soundFx.playAllocate(1.1);
      }
    });
  }

  // 6. Help / Tutorial Dialog
  const btnHelp = document.getElementById('btnHelp');
  const helpModal = document.getElementById('helpModal');
  const btnCloseHelp = document.getElementById('btnCloseHelp');
  const btnHelpGotIt = document.getElementById('btnHelpGotIt');

  const openHelp = () => {
    if (helpModal) helpModal.classList.remove('hidden');
    if (window.soundFx) window.soundFx.playClick();
  };
  const closeHelp = () => {
    if (helpModal) helpModal.classList.add('hidden');
    if (window.soundFx) window.soundFx.playClick();
  };

  if (btnHelp) btnHelp.addEventListener('click', openHelp);
  if (btnCloseHelp) btnCloseHelp.addEventListener('click', closeHelp);
  if (btnHelpGotIt) btnHelpGotIt.addEventListener('click', closeHelp);

  // 7. Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    switch (e.key) {
      case '1':
        switchTab('banker-view');
        break;
      case '2':
        switchTab('scheduler-view');
        break;
      case '3':
        switchTab('rag-view');
        break;
      case '4':
        switchTab('theory-view');
        break;
      case 'm':
      case 'M':
        btnSound?.click();
        break;
      case 't':
      case 'T':
        btnTheme?.click();
        break;
      case 'h':
      case 'H':
      case '?':
        openHelp();
        break;
      case 'Escape':
        closeHelp();
        document.getElementById('victoryModal')?.classList.add('hidden');
        document.getElementById('deadlockModal')?.classList.add('hidden');
        document.getElementById('algoComparisonPanel')?.classList.add('hidden');
        break;
      case ' ':
        e.preventDefault();
        const activePanel = document.querySelector('.view-panel.active');
        if (activePanel?.id === 'banker-view') {
          window.bankerGame?.autoStepSafe();
        } else if (activePanel?.id === 'scheduler-view') {
          window.schedulerGame?.stepSimulate();
        }
        break;
    }
  });

  console.log('⚡ OS Resource Manager & CPU Scheduler Ready (Light Theme Active).');
});

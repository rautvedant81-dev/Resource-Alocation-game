/**
 * ==========================================================================
 * KERNEL MASTER: Banker's Algorithm & Resource Allocation Game Controller
 * Features flying resource transfer animations, impact pulses, high-difficulty
 * stages, and real-time safety evaluations.
 * ==========================================================================
 */

class BankerGame {
  constructor() {
    this.currentLevelIndex = 0;
    this.currentLevel = null;
    this.isSandbox = false;

    // Runtime state
    this.available = [];
    this.allocMatrix = [];
    this.maxMatrix = [];
    this.finishedProcs = [];
    this.runningProcs = [];
    this.safeSequence = [];
    this.userQueue = [];
    this.executedSequence = [];
    this.isQueueExecuting = false;
    this.score = 0;

    // View mode: 'cards' | 'matrix'
    this.viewMode = 'cards';

    this.timerInterval = null;
    this.timeRemaining = 90;

    this.init();
  }

  init() {
    this.bindEvents();
    this.populateLevelSelect();
    this.loadLevel(0);
  }

  bindEvents() {
    // Level Selector
    const levelSelect = document.getElementById('bankerLevelSelect');
    if (levelSelect) {
      levelSelect.addEventListener('change', (e) => {
        this.loadLevel(parseInt(e.target.value, 10));
      });
    }

    const btnPrev = document.getElementById('btnPrevLevel');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (this.currentLevelIndex > 0) this.loadLevel(this.currentLevelIndex - 1);
      });
    }

    const btnNext = document.getElementById('btnNextLevel');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (this.currentLevelIndex < BANKER_LEVELS.length - 1) {
          this.loadLevel(this.currentLevelIndex + 1);
        }
      });
    }

    // User Queue Controls
    const btnClearQueue = document.getElementById('btnClearUserQueue');
    if (btnClearQueue) {
      btnClearQueue.addEventListener('click', () => this.clearUserQueue());
    }

    const btnVerifyQueue = document.getElementById('btnVerifyUserQueue');
    if (btnVerifyQueue) {
      btnVerifyQueue.addEventListener('click', () => this.verifyUserQueue());
    }

    const btnStepQueue = document.getElementById('btnStepUserQueue');
    if (btnStepQueue) {
      btnStepQueue.addEventListener('click', () => this.stepUserQueue());
    }

    const btnRunQueue = document.getElementById('btnRunUserQueue');
    if (btnRunQueue) {
      btnRunQueue.addEventListener('click', () => this.executeUserQueue());
    }

    const btnRunQueueTop = document.getElementById('btnRunUserQueueTop');
    if (btnRunQueueTop) {
      btnRunQueueTop.addEventListener('click', () => this.executeUserQueue());
    }

    // Mode Toggle (Campaign vs Sandbox)
    const btnCampaign = document.getElementById('btnModeCampaign');
    const btnSandbox = document.getElementById('btnModeSandbox');
    const sandboxPanel = document.getElementById('sandboxConfigPanel');

    if (btnCampaign && btnSandbox) {
      btnCampaign.addEventListener('click', () => {
        this.isSandbox = false;
        btnCampaign.classList.add('active');
        btnSandbox.classList.remove('active');
        if (sandboxPanel) sandboxPanel.classList.add('hidden');
        this.loadLevel(this.currentLevelIndex);
      });

      btnSandbox.addEventListener('click', () => {
        this.isSandbox = true;
        btnSandbox.classList.add('active');
        btnCampaign.classList.remove('active');
        if (sandboxPanel) sandboxPanel.classList.remove('hidden');
        this.applySandboxConfig();
      });
    }

    // View Switcher (Cards vs Matrix)
    const btnCards = document.getElementById('btnShowCardView');
    const btnMatrix = document.getElementById('btnShowMatrixView');
    const cardsContainer = document.getElementById('processCardsContainer');
    const matrixContainer = document.getElementById('bankerMatrixContainer');

    if (btnCards && btnMatrix) {
      btnCards.addEventListener('click', () => {
        this.viewMode = 'cards';
        btnCards.classList.add('active');
        btnMatrix.classList.remove('active');
        cardsContainer.classList.remove('hidden');
        matrixContainer.classList.add('hidden');
      });

      btnMatrix.addEventListener('click', () => {
        this.viewMode = 'matrix';
        btnMatrix.classList.add('active');
        btnCards.classList.remove('active');
        cardsContainer.classList.add('hidden');
        matrixContainer.classList.remove('hidden');
        this.renderMatrixTables();
      });
    }

    // Game Action Buttons
    const btnAutoSolve = document.getElementById('btnAutoSolve');
    if (btnAutoSolve) {
      btnAutoSolve.addEventListener('click', () => this.autoStepSafe());
    }

    const btnCheckDeadlock = document.getElementById('btnCheckDeadlock');
    if (btnCheckDeadlock) {
      btnCheckDeadlock.addEventListener('click', () => this.checkDeadlockManually());
    }

    const btnReset = document.getElementById('btnResetLevel');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (window.soundFx) window.soundFx.playClick();
        this.loadLevel(this.currentLevelIndex);
      });
    }

    // Deadlock Recovery Tools
    const btnPreempt = document.getElementById('btnPreemptResource');
    if (btnPreempt) {
      btnPreempt.addEventListener('click', () => this.preemptResourceTool());
    }

    const btnKill = document.getElementById('btnKillProcess');
    if (btnKill) {
      btnKill.addEventListener('click', () => this.terminateProcessTool());
    }

    // Sandbox Controls
    const btnApplySandbox = document.getElementById('btnApplySandbox');
    if (btnApplySandbox) {
      btnApplySandbox.addEventListener('click', () => this.applySandboxConfig());
    }

    const btnRandomizeMatrix = document.getElementById('btnRandomizeMatrix');
    if (btnRandomizeMatrix) {
      btnRandomizeMatrix.addEventListener('click', () => this.randomizeSandboxMatrix());
    }

    const btnPresetClassic = document.getElementById('btnPresetClassic');
    if (btnPresetClassic) {
      btnPresetClassic.addEventListener('click', () => this.loadLevel(0));
    }

    const btnPresetDeadlock = document.getElementById('btnPresetDeadlock');
    if (btnPresetDeadlock) {
      btnPresetDeadlock.addEventListener('click', () => this.loadLevel(7)); // Stage 8 Deadlock
    }

    // Victory & Deadlock Modals
    const btnModalNext = document.getElementById('btnModalNext');
    if (btnModalNext) {
      btnModalNext.addEventListener('click', () => {
        this.hideVictoryModal();
        if (this.currentLevelIndex < BANKER_LEVELS.length - 1) {
          this.loadLevel(this.currentLevelIndex + 1);
        } else {
          this.loadLevel(0);
        }
      });
    }

    const btnModalReplay = document.getElementById('btnModalReplay');
    if (btnModalReplay) {
      btnModalReplay.addEventListener('click', () => {
        this.hideVictoryModal();
        this.loadLevel(this.currentLevelIndex);
      });
    }

    const btnDeadlockReset = document.getElementById('btnModalDeadlockReset');
    if (btnDeadlockReset) {
      btnDeadlockReset.addEventListener('click', () => {
        this.hideDeadlockModal();
        this.loadLevel(this.currentLevelIndex);
      });
    }

    const btnDeadlockRecover = document.getElementById('btnModalDeadlockRecover');
    if (btnDeadlockRecover) {
      btnDeadlockRecover.addEventListener('click', () => {
        this.hideDeadlockModal();
        this.terminateProcessTool();
      });
    }
  }

  populateLevelSelect() {
    const levelSelect = document.getElementById('bankerLevelSelect');
    if (!levelSelect) return;
    levelSelect.innerHTML = '';

    BANKER_LEVELS.forEach((lvl, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${lvl.title} (${lvl.difficulty})`;
      levelSelect.appendChild(opt);
    });
  }

  loadLevel(index) {
    this.currentLevelIndex = index;
    const levelSelect = document.getElementById('bankerLevelSelect');
    if (levelSelect) levelSelect.value = index;

    this.currentLevel = JSON.parse(JSON.stringify(BANKER_LEVELS[index]));

    // Initialize state clones
    this.available = [...this.currentLevel.available];
    this.allocMatrix = this.currentLevel.processes.map(p => [...p.alloc]);
    this.maxMatrix = this.currentLevel.processes.map(p => [...p.max]);
    this.finishedProcs = new Array(this.currentLevel.processes.length).fill(false);
    this.runningProcs = new Array(this.currentLevel.processes.length).fill(false);
    this.userQueue = [];
    this.executedSequence = [];
    this.isQueueExecuting = false;
    this.hideQueueFeedback();

    // Update Banner UI
    const titleEl = document.getElementById('levelTitle');
    const descEl = document.getElementById('levelObjective');
    const diffEl = document.getElementById('levelDifficultyBadge');
    const targetEl = document.getElementById('levelTarget');

    if (titleEl) titleEl.textContent = this.currentLevel.title;
    if (descEl) descEl.textContent = this.currentLevel.desc;
    if (diffEl) {
      diffEl.textContent = `${this.currentLevel.difficulty} LEVEL`;
      diffEl.className = `banner-badge ${this.currentLevel.difficultyClass || ''}`;
    }
    if (targetEl) targetEl.textContent = `Finish all ${this.currentLevel.processes.length} processes`;

    this.startTimer();
    this.updateAllUI();
  }

  startTimer() {
    clearInterval(this.timerInterval);
    this.timeRemaining = 120;
    const timerEl = document.getElementById('levelTimer');

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      if (timerEl) {
        const mins = Math.floor(this.timeRemaining / 60);
        const secs = this.timeRemaining % 60;
        timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  updateAllUI() {
    this.evaluateAndRenderSafety();
    this.renderAvailableDock();
    this.renderUserQueue();
    this.renderProcessCards();
    if (this.viewMode === 'matrix') {
      this.renderMatrixTables();
    }
    // Sync with RAG if active
    if (window.ragVisualizer && document.getElementById('rag-view')?.classList.contains('active')) {
      window.ragVisualizer.syncFromBanker(
        this.currentLevel,
        this.allocMatrix,
        this.getNeedMatrix(),
        this.available
      );
    }
  }

  getNeedMatrix() {
    const numP = this.maxMatrix.length;
    const numR = this.available.length;
    const need = [];
    for (let i = 0; i < numP; i++) {
      need[i] = [];
      for (let j = 0; j < numR; j++) {
        need[i][j] = Math.max(0, this.maxMatrix[i][j] - this.allocMatrix[i][j]);
      }
    }
    return need;
  }

  evaluateAndRenderSafety() {
    const procNames = this.currentLevel.processes.map(p => p.name);
    const resNames = this.currentLevel.resources;

    const safety = BankerEngine.evaluateSafety(
      this.available,
      this.maxMatrix,
      this.allocMatrix,
      this.finishedProcs,
      resNames,
      procNames
    );

    this.safeSequence = safety.safeSequence;

    const badge = document.getElementById('safetyStateBadge');
    const statusText = document.getElementById('safetyStatusText');
    const seqPreview = document.getElementById('safeSeqPreview');
    const proofLog = document.getElementById('bankerProofLog');

    if (proofLog) {
      proofLog.innerHTML = safety.proofLog
        .map(step => {
          let cls = 'log-step';
          if (step.startsWith('✓')) cls += ' log-success';
          if (step.startsWith('✗')) cls += ' log-fail';
          return `<div class="${cls}">${step}</div>`;
        })
        .join('');
    }

    if (!badge || !statusText || !seqPreview) return;

    // Check if deadlocked
    const isAllFinished = this.finishedProcs.every(f => f);
    if (isAllFinished) {
      badge.className = 'safety-badge safe';
      statusText.textContent = '🎉 ALL PROCESSES COMPLETED';
      seqPreview.textContent = 'All jobs executed successfully!';
      return;
    }

    if (safety.isSafe) {
      badge.className = 'safety-badge safe';
      statusText.textContent = '🟢 SYSTEM STATE: SAFE';
      seqPreview.textContent = 'Safe State Active • Build user queue to execute';
    } else {
      const canAnyProgress = this.canAnyProcessProgress();
      if (!canAnyProgress) {
        badge.className = 'safety-badge deadlock';
        statusText.textContent = '⚠️ DEADLOCK DETECTED!';
        seqPreview.textContent = 'All remaining processes are waiting on each other!';
      } else {
        badge.className = 'safety-badge unsafe';
        statusText.textContent = '🔴 SYSTEM STATE: UNSAFE';
        seqPreview.textContent = 'Warning: Insufficient available resources to guarantee safe completion!';
      }
    }
  }

  canAnyProcessProgress() {
    const numP = this.maxMatrix.length;
    const numR = this.available.length;
    const need = this.getNeedMatrix();

    for (let i = 0; i < numP; i++) {
      if (!this.finishedProcs[i]) {
        let canSatisfy = true;
        for (let j = 0; j < numR; j++) {
          if (need[i][j] > this.available[j]) {
            canSatisfy = false;
            break;
          }
        }
        if (canSatisfy) return true;
      }
    }
    return false;
  }

  renderAvailableDock() {
    const list = document.getElementById('availableResourcesList');
    const summary = document.getElementById('totalResourceSummary');
    if (!list) return;

    list.innerHTML = '';
    if (summary) summary.textContent = `${this.currentLevel.resources.length} Types`;

    this.currentLevel.resources.forEach((rName, idx) => {
      const rMeta = RESOURCE_TYPES[rName] || { name: rName, icon: '📦', color: '#0284c7', bg: '#e0f2fe' };
      const availCount = this.available[idx];
      const totalCount = this.currentLevel.totalInstances ? this.currentLevel.totalInstances[idx] : 10;

      const card = document.createElement('div');
      card.className = 'resource-pool-card';
      card.id = `availCard_${idx}`;
      card.style.setProperty('--res-color', rMeta.color);
      card.style.setProperty('--res-bg', rMeta.bg);
      card.draggable = availCount > 0;
      card.dataset.resIndex = idx;
      card.dataset.resName = rName;

      card.innerHTML = `
        <div class="res-info-left">
          <div class="res-icon-box" style="border-color: ${rMeta.color}">
            ${rMeta.icon}
          </div>
          <div class="res-meta">
            <span class="res-name">${rName}</span>
            <span class="res-total-label">System: ${totalCount} units</span>
          </div>
        </div>
        <div class="res-avail-count">
          <span class="avail-num" style="color: ${rMeta.color}">${availCount}</span>
          <span class="avail-total-slash">/ ${totalCount}</span>
        </div>
      `;

      // Drag and Drop
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ resIndex: idx, resName: rName }));
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      list.appendChild(card);
    });
  }

  renderProcessCards() {
    const container = document.getElementById('processCardsContainer');
    if (!container) return;
    container.innerHTML = '';

    const needMatrix = this.getNeedMatrix();
    const numR = this.available.length;

    this.currentLevel.processes.forEach((proc, pIdx) => {
      const isFinished = this.finishedProcs[pIdx];
      const isRunning = this.runningProcs[pIdx];
      const needVector = needMatrix[pIdx];

      // Check if process has full need fulfilled (Need is all 0)
      const hasAllNeeded = needVector.every(n => n === 0);
      // Check if available resources can fulfill remaining need right now
      let canFulfillNow = true;
      for (let j = 0; j < numR; j++) {
        if (needVector[j] > this.available[j]) {
          canFulfillNow = false;
          break;
        }
      }

      let statusClass = 'status-waiting';
      let badgeText = '🟡 WAITING';
      let badgeClass = 'waiting';

      if (isFinished) {
        statusClass = 'status-completed';
        badgeText = '✓ COMPLETED';
        badgeClass = 'completed';
      } else if (isRunning) {
        statusClass = 'status-running';
        badgeText = '⚡ RUNNING...';
        badgeClass = 'running';
      } else if (hasAllNeeded) {
        statusClass = 'status-can-run';
        badgeText = '🟢 READY TO RUN';
        badgeClass = 'can-run';
      }

      const card = document.createElement('div');
      card.className = `process-card ${statusClass}`;
      card.id = `procCard_${pIdx}`;

      // Build rows for each resource
      let tableRows = '';
      this.currentLevel.resources.forEach((rName, rIdx) => {
        const rMeta = RESOURCE_TYPES[rName] || { color: '#0284c7', icon: '📦', bg: '#e0f2fe' };
        const allocated = this.allocMatrix[pIdx][rIdx];
        const maxClaim = this.maxMatrix[pIdx][rIdx];
        const needed = needVector[rIdx];
        const canAllocOne = this.available[rIdx] > 0 && needed > 0 && !isFinished && !isRunning;
        const canDeallocOne = allocated > 0 && !isFinished && !isRunning;

        tableRows += `
          <tr id="row_${pIdx}_${rIdx}">
            <td>
              <span class="res-type-tag" style="--res-color: ${rMeta.color}">
                ${rMeta.icon} ${rName}
              </span>
            </td>
            <td><strong>${allocated}</strong></td>
            <td><strong style="color: ${needed > 0 ? 'var(--warning-text)' : 'var(--success-text)'}">${needed}</strong></td>
            <td style="color: var(--text-muted);">${maxClaim}</td>
            <td>
              <div class="res-alloc-controls">
                <button class="btn-alloc-mini" data-action="sub" data-proc="${pIdx}" data-res="${rIdx}" ${!canDeallocOne ? 'disabled' : ''} title="Release 1 unit">-</button>
                <button class="btn-alloc-mini" data-action="add" data-proc="${pIdx}" data-res="${rIdx}" ${!canAllocOne ? 'disabled' : ''} title="Allocate 1 unit">+</button>
              </div>
            </td>
          </tr>
        `;
      });

      const isInQueue = this.userQueue.includes(pIdx);

      card.innerHTML = `
        <div class="process-card-header">
          <div class="proc-title-group">
            <div class="proc-badge">${proc.name}</div>
            <span class="proc-name">Process ${proc.name}</span>
          </div>
          <span class="proc-status-badge ${badgeClass}">${badgeText}</span>
        </div>

        <table class="proc-resources-table">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Allocated</th>
              <th>Still Needs</th>
              <th>Max</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="proc-progress-wrap">
          <div class="proc-progress-fill" id="procProgress_${pIdx}" style="width: ${isFinished ? '100%' : '0%'}"></div>
        </div>

        <div class="proc-card-footer">
          <button class="cyber-btn sm btn-add-queue-card" data-action="add-queue" data-proc="${pIdx}" title="Append ${proc.name} to Queue">
            ➕ Add to Queue
          </button>
          <button class="cyber-btn sm btn-quick-fill" data-action="fill-all" data-proc="${pIdx}" ${!canFulfillNow || isFinished || isRunning || hasAllNeeded ? 'disabled' : ''}>
            ⚡ Grant All Needed
          </button>
          <button class="cyber-btn glow-cyan btn-run-proc" data-action="run-proc" data-proc="${pIdx}" ${!hasAllNeeded || isFinished || isRunning ? 'disabled' : ''}>
            ▶ Run Process
          </button>
        </div>
      `;

      // Event Listeners on Card
      const btnAddQueue = card.querySelector('[data-action="add-queue"]');
      if (btnAddQueue) {
        btnAddQueue.addEventListener('click', () => this.addToUserQueue(pIdx));
      }

      card.querySelectorAll('.btn-alloc-mini').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = btn.dataset.action;
          const p = parseInt(btn.dataset.proc, 10);
          const r = parseInt(btn.dataset.res, 10);
          if (action === 'add') this.allocateResource(p, r, 1);
          if (action === 'sub') this.releaseResource(p, r, 1);
        });
      });

      const btnFill = card.querySelector('[data-action="fill-all"]');
      if (btnFill) {
        btnFill.addEventListener('click', () => this.grantAllNeeded(pIdx));
      }

      const btnRun = card.querySelector('[data-action="run-proc"]');
      if (btnRun) {
        btnRun.addEventListener('click', () => this.executeProcess(pIdx));
      }

      // Drag and Drop Zone
      card.addEventListener('dragover', (e) => {
        if (!isFinished && !isRunning) {
          e.preventDefault();
          card.classList.add('drag-over');
        }
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data && typeof data.resIndex === 'number') {
            this.allocateResource(pIdx, data.resIndex, 1);
          }
        } catch (err) {
          console.error(err);
        }
      });

      container.appendChild(card);
    });
  }

  renderMatrixTables() {
    const tableAllocWrap = document.getElementById('tableAllocationWrap');
    const tableMaxWrap = document.getElementById('tableMaxWrap');
    const tableNeedWrap = document.getElementById('tableNeedWrap');
    const tableAvailWrap = document.getElementById('tableAvailableWrap');

    if (!tableAllocWrap || !tableMaxWrap || !tableNeedWrap || !tableAvailWrap) return;

    const resHeaders = this.currentLevel.resources.map(r => `<th>${r}</th>`).join('');
    const needMatrix = this.getNeedMatrix();

    // Helper to render table matrix
    const buildTable = (matrix) => `
      <table class="matrix-table">
        <thead>
          <tr>
            <th>Proc</th>
            ${resHeaders}
          </tr>
        </thead>
        <tbody>
          ${matrix.map((row, pIdx) => `
            <tr class="${this.finishedProcs[pIdx] ? 'finished-row' : ''}">
              <td><strong>P${pIdx}</strong></td>
              ${row.map(val => `<td>${val}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    tableAllocWrap.innerHTML = buildTable(this.allocMatrix);
    tableMaxWrap.innerHTML = buildTable(this.maxMatrix);
    tableNeedWrap.innerHTML = buildTable(needMatrix);

    // Available vector table
    tableAvailWrap.innerHTML = `
      <table class="matrix-table">
        <thead>
          <tr>${resHeaders}</tr>
        </thead>
        <tbody>
          <tr>
            ${this.available.map(val => `<td style="color: var(--primary); font-weight: 800;">${val}</td>`).join('')}
          </tr>
        </tbody>
      </table>
    `;
  }

  /**
   * High-Impact Flying Resource Particle Animation
   */
  animateFlyingOrb(fromEl, toEl, color = '#0284c7') {
    if (!fromEl || !toEl) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    const orb = document.createElement('div');
    orb.className = 'flying-resource-orb';
    orb.style.setProperty('--orb-color', color);
    orb.textContent = '+1';
    orb.style.left = `${fromRect.left + fromRect.width / 2}px`;
    orb.style.top = `${fromRect.top + fromRect.height / 2}px`;

    document.body.appendChild(orb);

    // Force layout reflow
    orb.getBoundingClientRect();

    const deltaX = (toRect.left + toRect.width / 2) - (fromRect.left + fromRect.width / 2);
    const deltaY = (toRect.top + toRect.height / 2) - (fromRect.top + fromRect.height / 2);

    orb.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.3)`;

    setTimeout(() => {
      orb.style.opacity = '0';
      setTimeout(() => orb.remove(), 200);
    }, 450);
  }

  allocateResource(pIndex, rIndex, amount = 1) {
    if (this.finishedProcs[pIndex] || this.runningProcs[pIndex]) return;

    const needed = this.maxMatrix[pIndex][rIndex] - this.allocMatrix[pIndex][rIndex];
    if (needed <= 0) {
      if (window.soundFx) window.soundFx.playError();
      return;
    }

    const allocCount = Math.min(amount, this.available[rIndex], needed);
    if (allocCount <= 0) {
      if (window.soundFx) window.soundFx.playError();
      return;
    }

    // Trigger visual animations
    const sourceCard = document.getElementById(`availCard_${rIndex}`);
    const targetCard = document.getElementById(`procCard_${pIndex}`);
    const rName = this.currentLevel.resources[rIndex];
    const rColor = RESOURCE_TYPES[rName]?.color || '#0284c7';

    if (sourceCard && targetCard) {
      this.animateFlyingOrb(sourceCard, targetCard, rColor);
      sourceCard.classList.add('allocated-pulse');
      targetCard.classList.add('receive-pulse');
      setTimeout(() => {
        sourceCard.classList.remove('allocated-pulse');
        targetCard.classList.remove('receive-pulse');
      }, 400);
    }

    this.available[rIndex] -= allocCount;
    this.allocMatrix[pIndex][rIndex] += allocCount;

    if (window.soundFx) window.soundFx.playAllocate(1 + allocCount * 0.1);
    this.updateAllUI();
  }

  releaseResource(pIndex, rIndex, amount = 1) {
    if (this.finishedProcs[pIndex] || this.runningProcs[pIndex]) return;

    const currentlyAllocated = this.allocMatrix[pIndex][rIndex];
    const releaseCount = Math.min(amount, currentlyAllocated);
    if (releaseCount <= 0) return;

    this.allocMatrix[pIndex][rIndex] -= releaseCount;
    this.available[rIndex] += releaseCount;

    if (window.soundFx) window.soundFx.playClick();
    this.updateAllUI();
  }

  grantAllNeeded(pIndex) {
    if (this.finishedProcs[pIndex] || this.runningProcs[pIndex]) return;
    const numR = this.available.length;
    const needVector = [];

    for (let j = 0; j < numR; j++) {
      needVector[j] = this.maxMatrix[pIndex][j] - this.allocMatrix[pIndex][j];
      if (needVector[j] > this.available[j]) {
        if (window.soundFx) window.soundFx.playError();
        return; // Insufficient resources
      }
    }

    // Animate all flying tokens
    const targetCard = document.getElementById(`procCard_${pIndex}`);
    for (let j = 0; j < numR; j++) {
      if (needVector[j] > 0) {
        const sourceCard = document.getElementById(`availCard_${j}`);
        const rName = this.currentLevel.resources[j];
        const rColor = RESOURCE_TYPES[rName]?.color || '#0284c7';
        if (sourceCard && targetCard) {
          this.animateFlyingOrb(sourceCard, targetCard, rColor);
        }
      }
    }

    for (let j = 0; j < numR; j++) {
      this.available[j] -= needVector[j];
      this.allocMatrix[pIndex][j] += needVector[j];
    }

    if (window.soundFx) window.soundFx.playAllocate(1.5);
    this.updateAllUI();
  }

  executeProcess(pIndex) {
    if (this.finishedProcs[pIndex] || this.runningProcs[pIndex]) return;

    // Verify need is zero
    const numR = this.available.length;
    for (let j = 0; j < numR; j++) {
      if (this.maxMatrix[pIndex][j] - this.allocMatrix[pIndex][j] > 0) {
        if (window.soundFx) window.soundFx.playError();
        return;
      }
    }

    this.runningProcs[pIndex] = true;
    this.updateAllUI();

    if (window.soundFx) window.soundFx.playProcessRun();

    // Animate progress bar
    const duration = this.currentLevel.processes[pIndex].burstTime || 1200;
    const progressEl = document.getElementById(`procProgress_${pIndex}`);
    const procCard = document.getElementById(`procCard_${pIndex}`);
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      if (progressEl) progressEl.style.width = `${progress * 100}%`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Complete execution and reclaim all resources!
        this.runningProcs[pIndex] = false;
        this.finishedProcs[pIndex] = true;
        const procName = this.currentLevel.processes[pIndex].name;
        if (!this.executedSequence.includes(procName)) {
          this.executedSequence.push(procName);
        }

        // Visual returning particle beams back to Available pool!
        for (let j = 0; j < numR; j++) {
          const allocCount = this.allocMatrix[pIndex][j];
          if (allocCount > 0) {
            const destCard = document.getElementById(`availCard_${j}`);
            const rName = this.currentLevel.resources[j];
            const rColor = RESOURCE_TYPES[rName]?.color || '#059669';
            if (procCard && destCard) {
              this.animateFlyingOrb(procCard, destCard, rColor);
            }
          }
          this.available[j] += this.allocMatrix[pIndex][j];
          this.allocMatrix[pIndex][j] = 0;
        }

        this.addScore(150);
        if (window.soundFx) window.soundFx.playProcessComplete();
        this.updateAllUI();

        // Check level win condition
        if (this.finishedProcs.every(f => f)) {
          this.triggerLevelVictory();
        }
      }
    };

    requestAnimationFrame(animate);
  }

  // ==========================================================================
  // USER PROCESS EXECUTION QUEUE CONTROLLER
  // ==========================================================================

  addToUserQueue(pIndex) {
    if (pIndex < 0 || !this.currentLevel || pIndex >= this.currentLevel.processes.length) return;
    this.userQueue.push(pIndex);
    if (window.soundFx) window.soundFx.playAllocate(1.1);
    this.showQueueFeedback(`Appended ${this.currentLevel.processes[pIndex].name} to execution queue.`, 'info');
    this.renderUserQueue();
    this.renderProcessCards();
  }

  removeFromUserQueue(queueIdx) {
    if (queueIdx >= 0 && queueIdx < this.userQueue.length) {
      this.userQueue.splice(queueIdx, 1);
      if (window.soundFx) window.soundFx.playClick();
      this.hideQueueFeedback();
      this.renderUserQueue();
      this.renderProcessCards();
    }
  }

  moveUserQueueItem(queueIdx, direction) {
    const targetIdx = queueIdx + direction;
    if (targetIdx >= 0 && targetIdx < this.userQueue.length) {
      const temp = this.userQueue[queueIdx];
      this.userQueue[queueIdx] = this.userQueue[targetIdx];
      this.userQueue[targetIdx] = temp;
      if (window.soundFx) window.soundFx.playClick();
      this.hideQueueFeedback();
      this.renderUserQueue();
    }
  }

  clearUserQueue() {
    this.userQueue = [];
    if (window.soundFx) window.soundFx.playClick();
    this.hideQueueFeedback();
    this.renderUserQueue();
    this.renderProcessCards();
  }

  showQueueFeedback(msg, type = 'info') {
    const feedback = document.getElementById('userQueueFeedback');
    if (!feedback) return;
    feedback.className = `queue-feedback-bar ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '❌' : 'ℹ️';
    feedback.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
    feedback.classList.remove('hidden');
  }

  hideQueueFeedback() {
    const feedback = document.getElementById('userQueueFeedback');
    if (feedback) feedback.classList.add('hidden');
  }

  renderUserQueue() {
    const list = document.getElementById('userQueueList');
    const badge = document.getElementById('userQueueCountBadge');
    const quickAddWrap = document.getElementById('userQueueQuickAddBtns');
    if (!list || !this.currentLevel) return;

    const numP = this.currentLevel.processes.length;
    if (badge) badge.textContent = `Queue: ${this.userQueue.length} items`;

    // Render Quick Add Buttons - Always enabled so user can append to queue anytime!
    if (quickAddWrap) {
      quickAddWrap.innerHTML = '';
      this.currentLevel.processes.forEach((proc, pIdx) => {
        const isFinished = this.finishedProcs[pIdx];
        const btn = document.createElement('button');
        btn.className = `btn-quick-add-proc ${isFinished ? 'proc-done-tag' : ''}`;
        btn.textContent = `+ ${proc.name}${isFinished ? ' (Done)' : ''}`;
        btn.title = `Append ${proc.name} to Queue`;
        btn.addEventListener('click', () => this.addToUserQueue(pIdx));
        quickAddWrap.appendChild(btn);
      });
    }

    // Render Queue Chips
    list.innerHTML = '';
    if (this.userQueue.length === 0) {
      list.innerHTML = `
        <div class="user-queue-empty">
          <span class="empty-icon">➕</span>
          <span>Click <strong>[+ Add to Queue]</strong> on process cards below or use quick buttons to build your sequence anytime!</span>
        </div>
      `;
      return;
    }

    this.userQueue.forEach((pIdx, qIdx) => {
      const proc = this.currentLevel.processes[pIdx];
      const isFinished = this.finishedProcs[pIdx];

      const chip = document.createElement('div');
      chip.className = `user-queue-chip ${isFinished ? 'done' : ''}`;
      chip.id = `userQueueChip_${qIdx}`;

      chip.innerHTML = `
        <span class="chip-step-idx">${qIdx + 1}</span>
        <span class="chip-proc-name">${proc.name}${isFinished ? ' ✓' : ''}</span>
        <div class="chip-controls">
          <button class="btn-chip-action" ${qIdx === 0 ? 'disabled' : ''} data-action="left" title="Move Left">◀</button>
          <button class="btn-chip-action" ${qIdx === this.userQueue.length - 1 ? 'disabled' : ''} data-action="right" title="Move Right">▶</button>
          <button class="btn-chip-action del" data-action="del" title="Remove from Queue">✖</button>
        </div>
      `;

      chip.querySelector('[data-action="left"]')?.addEventListener('click', () => this.moveUserQueueItem(qIdx, -1));
      chip.querySelector('[data-action="right"]')?.addEventListener('click', () => this.moveUserQueueItem(qIdx, 1));
      chip.querySelector('[data-action="del"]')?.addEventListener('click', () => this.removeFromUserQueue(qIdx));

      list.appendChild(chip);

      if (qIdx < this.userQueue.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'queue-arrow';
        arrow.textContent = '➔';
        list.appendChild(arrow);
      }
    });
  }

  verifyUserQueue() {
    if (this.userQueue.length === 0) {
      this.showQueueFeedback('Your execution queue is empty! Add processes using [+ Add to Queue].', 'info');
      return false;
    }

    const resNames = this.currentLevel.resources;
    const procNames = this.currentLevel.processes.map(p => p.name);

    const report = BankerEngine.verifySequence(
      this.userQueue,
      this.available,
      this.maxMatrix,
      this.allocMatrix,
      this.finishedProcs,
      procNames,
      resNames
    );

    if (report.isValid) {
      const qSeqStr = this.userQueue.map(idx => procNames[idx]).join(' → ');
      this.showQueueFeedback(
        `✓ Safe Sequence Verified! Queue < ${qSeqStr} > will complete all queued processes safely.`,
        'success'
      );
      if (window.soundFx) window.soundFx.playProcessComplete();
      return true;
    } else {
      this.showQueueFeedback(
        `❌ Queue Stalled at Step ${report.failedStepIndex + 1} (${report.failedProcess})! ${report.details}`,
        'error'
      );
      if (window.soundFx) window.soundFx.playError();

      // Highlight failed chip
      const chip = document.getElementById(`userQueueChip_${report.failedStepIndex}`);
      if (chip) chip.classList.add('stalled');

      return false;
    }
  }

  async executeUserQueue() {
    if (this.isQueueExecuting) return;

    if (this.userQueue.length === 0) {
      const unfinished = [];
      this.finishedProcs.forEach((f, i) => { if (!f) unfinished.push(i); });
      if (unfinished.length === 0) {
        this.showQueueFeedback('All processes are already completed!', 'info');
        return;
      }
      this.userQueue = unfinished;
      this.renderUserQueue();
    }

    const isValid = this.verifyUserQueue();
    if (!isValid) return;

    this.isQueueExecuting = true;
    const queueToRun = [...this.userQueue];

    for (let i = 0; i < queueToRun.length; i++) {
      const pIdx = queueToRun[i];
      if (this.finishedProcs[pIdx]) continue;

      const chip = document.getElementById(`userQueueChip_${i}`);
      if (chip) chip.classList.add('running');

      const needMatrix = this.getNeedMatrix();
      const needVector = needMatrix[pIdx];
      const hasAllNeeded = needVector.every(n => n === 0);

      if (!hasAllNeeded) {
        this.grantAllNeeded(pIdx);
        await new Promise(r => setTimeout(r, 450));
      }

      await new Promise(r => {
        this.executeProcess(pIdx);
        setTimeout(r, 1400);
      });

      if (chip) {
        chip.classList.remove('running');
        chip.classList.add('done');
      }

      this.renderUserQueue();
    }

    this.isQueueExecuting = false;
  }

  stepUserQueue() {
    if (this.userQueue.length === 0) {
      const pIdx = this.finishedProcs.findIndex(f => !f);
      if (pIdx !== -1) {
        this.addToUserQueue(pIdx);
      } else {
        this.showQueueFeedback('All processes are already completed!', 'info');
        return;
      }
    }

    const nextPIdx = this.userQueue.find(idx => !this.finishedProcs[idx]);
    if (nextPIdx === undefined) {
      this.showQueueFeedback('All processes in your queue are completed!', 'info');
      return;
    }

    const needMatrix = this.getNeedMatrix();
    const needVector = needMatrix[nextPIdx];
    const hasAllNeeded = needVector.every(n => n === 0);

    if (!hasAllNeeded) {
      let canFulfill = true;
      for (let j = 0; j < this.available.length; j++) {
        if (needVector[j] > this.available[j]) {
          canFulfill = false;
          break;
        }
      }
      if (canFulfill) {
        this.grantAllNeeded(nextPIdx);
        setTimeout(() => this.executeProcess(nextPIdx), 350);
      } else {
        this.showQueueFeedback(`Cannot step ${this.currentLevel.processes[nextPIdx].name}: Required resources exceed available pool!`, 'error');
        if (window.soundFx) window.soundFx.playError();
      }
    } else {
      this.executeProcess(nextPIdx);
    }
  }

  autoStepSafe() {
    if (window.soundFx) window.soundFx.playClick();

    // Find next safe process that can run or can be fulfilled
    const safety = BankerEngine.evaluateSafety(
      this.available,
      this.maxMatrix,
      this.allocMatrix,
      this.finishedProcs,
      this.currentLevel.resources,
      this.currentLevel.processes.map(p => p.name)
    );

    if (!safety.isSafe || safety.safeSequence.length === 0) {
      if (window.soundFx) window.soundFx.playError();
      alert('System is in an Unsafe state or Deadlocked! Cannot auto-step safely.');
      return;
    }

    const nextSafeName = safety.safeSequence[0];
    const pIdx = this.currentLevel.processes.findIndex(p => p.name === nextSafeName);

    if (pIdx !== -1 && !this.finishedProcs[pIdx] && !this.runningProcs[pIdx]) {
      this.grantAllNeeded(pIdx);
      setTimeout(() => this.executeProcess(pIdx), 350);
    }
  }

  preemptResourceTool() {
    let bestP = -1;
    let bestR = -1;
    let maxAlloc = 0;

    for (let i = 0; i < this.allocMatrix.length; i++) {
      if (!this.finishedProcs[i]) {
        for (let j = 0; j < this.available.length; j++) {
          if (this.allocMatrix[i][j] > maxAlloc) {
            maxAlloc = this.allocMatrix[i][j];
            bestP = i;
            bestR = j;
          }
        }
      }
    }

    if (bestP !== -1 && maxAlloc > 0) {
      this.releaseResource(bestP, bestR, 1);
      if (window.soundFx) window.soundFx.playAllocate(0.8);
      alert(`Preemption executed: Reclaimed 1 unit of ${this.currentLevel.resources[bestR]} from process P${bestP}.`);
    } else {
      alert('No allocated resources available to preempt.');
    }
  }

  terminateProcessTool() {
    let bestP = -1;
    let maxTotal = 0;

    for (let i = 0; i < this.allocMatrix.length; i++) {
      if (!this.finishedProcs[i]) {
        const total = this.allocMatrix[i].reduce((sum, v) => sum + v, 0);
        if (total >= maxTotal) {
          maxTotal = total;
          bestP = i;
        }
      }
    }

    if (bestP !== -1) {
      for (let j = 0; j < this.available.length; j++) {
        this.available[j] += this.allocMatrix[bestP][j];
        this.allocMatrix[bestP][j] = 0;
      }
      this.finishedProcs[bestP] = true;
      if (window.soundFx) window.soundFx.playDeadlockAlarm();
      alert(`Process P${bestP} terminated. All its resources have been freed back to the system pool!`);
      this.updateAllUI();

      if (this.finishedProcs.every(f => f)) {
        this.triggerLevelVictory();
      }
    } else {
      alert('No processes available to terminate.');
    }
  }

  checkDeadlockManually() {
    const needMatrix = this.getNeedMatrix();
    const result = BankerEngine.detectDeadlock(
      this.available,
      this.allocMatrix,
      needMatrix,
      this.finishedProcs,
      this.currentLevel.processes.map(p => p.name)
    );

    if (result.isDeadlocked) {
      if (window.soundFx) window.soundFx.playDeadlockAlarm();
      this.showDeadlockModal(result.explanation);
    } else {
      if (window.soundFx) window.soundFx.playProcessComplete();
      alert(`🟢 Deadlock Report:\n\n${result.explanation}`);
    }
  }

  triggerLevelVictory() {
    clearInterval(this.timerInterval);
    const timeBonus = Math.max(0, this.timeRemaining * 10);
    this.addScore((this.currentLevel.targetScore || 500) + timeBonus);

    if (window.soundFx) window.soundFx.playVictoryFanfare();
    if (window.particleEngine) window.particleEngine.confettiVictory();

    this.showVictoryModal();
  }

  showVictoryModal() {
    const modal = document.getElementById('victoryModal');
    const msg = document.getElementById('modalMsg');
    const scoreVal = document.getElementById('modalStageScore');
    const safeSeqEl = document.getElementById('modalSafeSeq');
    const finishedCount = document.getElementById('modalFinishedCount');

    if (modal) {
      if (msg) msg.textContent = `All ${this.currentLevel.processes.length} processes completed their work without deadlock!`;
      if (scoreVal) scoreVal.textContent = `+${this.currentLevel.targetScore || 500} PTS`;
      if (safeSeqEl) safeSeqEl.textContent = `[ ${this.executedSequence.join(' → ') || 'Completed'} ]`;
      if (finishedCount) finishedCount.textContent = `${this.currentLevel.processes.length}/${this.currentLevel.processes.length}`;
      modal.classList.remove('hidden');
    }
  }

  hideVictoryModal() {
    const modal = document.getElementById('victoryModal');
    if (modal) modal.classList.add('hidden');
  }

  showDeadlockModal(details) {
    const modal = document.getElementById('deadlockModal');
    const detailsBox = document.getElementById('deadlockDetailsBox');
    if (modal) {
      if (detailsBox) detailsBox.textContent = details;
      modal.classList.remove('hidden');
    }
  }

  hideDeadlockModal() {
    const modal = document.getElementById('deadlockModal');
    if (modal) modal.classList.add('hidden');
  }

  addScore(pts) {
    this.score += pts;
    const hudScore = document.getElementById('hudScore');
    if (hudScore) hudScore.textContent = this.score;
  }

  applySandboxConfig() {
    const pCountInput = document.getElementById('sbProcessCount');
    const rCountSelect = document.getElementById('sbResourceTypes');

    const numP = parseInt(pCountInput ? pCountInput.value : 5, 10);
    const numR = parseInt(rCountSelect ? rCountSelect.value : 3, 10);

    const allResKeys = ['RAM', 'CPU', 'Disk', 'Printer', 'GPU'];
    const chosenRes = allResKeys.slice(0, numR);

    this.currentLevel = {
      id: 'sandbox',
      title: 'Sandbox: Custom Matrix Lab',
      difficulty: 'CUSTOM',
      difficultyClass: 'safe',
      desc: 'Test your own Banker\'s Algorithm matrices, create deadlock traps, and experiment with safe state evaluation.',
      resources: chosenRes,
      totalInstances: new Array(numR).fill(12),
      available: new Array(numR).fill(3),
      processes: Array.from({ length: numP }, (_, i) => ({
        name: `P${i}`,
        max: new Array(numR).fill(0).map(() => 2 + Math.floor(Math.random() * 4)),
        alloc: new Array(numR).fill(0).map(() => Math.floor(Math.random() * 2)),
        burstTime: 1200
      }))
    };

    this.available = [...this.currentLevel.available];
    this.allocMatrix = this.currentLevel.processes.map(p => [...p.alloc]);
    this.maxMatrix = this.currentLevel.processes.map(p => [...p.max]);
    this.finishedProcs = new Array(numP).fill(false);
    this.runningProcs = new Array(numP).fill(false);
    this.userQueue = [];
    this.executedSequence = [];
    this.isQueueExecuting = false;
    this.hideQueueFeedback();

    this.updateAllUI();
  }

  randomizeSandboxMatrix() {
    this.applySandboxConfig();
    if (window.soundFx) window.soundFx.playAllocate(1.4);
  }
}

window.BankerGame = BankerGame;

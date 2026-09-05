/**
 * ==========================================================================
 * KERNEL MASTER: CPU Scheduler Lab & Interactive Game Controller
 * Manages workload table, live CPU dispatching, step-by-step playback,
 * Gantt timeline rendering, and multi-algorithm benchmark comparisons.
 * ==========================================================================
 */

class SchedulerGame {
  constructor() {
    this.selectedAlgo = 'FCFS';
    this.quantum = 2;

    // Default Workload Queue
    this.processes = [
      { id: 'p0', name: 'P0', at: 0, bt: 5, priority: 2, color: '#00ffcc' },
      { id: 'p1', name: 'P1', at: 1, bt: 3, priority: 1, color: '#ffb830' },
      { id: 'p2', name: 'P2', at: 2, bt: 8, priority: 3, color: '#a855f7' },
      { id: 'p3', name: 'P3', at: 3, bt: 6, priority: 2, color: '#10b981' }
    ];

    this.ganttRenderer = new GanttChartRenderer('ganttChartWrapper');
    this.currentSimulation = null;
    this.stepClock = 0;
    this.stepInterval = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderProcessTable();
    this.runSimulation();
  }

  bindEvents() {
    // Algorithm Selection Buttons
    document.querySelectorAll('.algo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedAlgo = btn.dataset.algo;

        const qGroup = document.getElementById('quantumControlGroup');
        if (qGroup) {
          if (this.selectedAlgo === 'RR') {
            qGroup.classList.remove('hidden');
          } else {
            qGroup.classList.add('hidden');
          }
        }

        if (window.soundFx) window.soundFx.playClick();
        this.runSimulation();
      });
    });

    // Time Quantum Slider
    const qInput = document.getElementById('rrQuantumInput');
    const qVal = document.getElementById('rrQuantumVal');
    if (qInput) {
      qInput.addEventListener('input', (e) => {
        this.quantum = parseInt(e.target.value, 10);
        if (qVal) qVal.textContent = this.quantum;
        if (this.selectedAlgo === 'RR') {
          this.runSimulation();
        }
      });
    }

    // Action Buttons
    const btnRun = document.getElementById('btnRunSimulation');
    if (btnRun) {
      btnRun.addEventListener('click', () => {
        if (window.soundFx) window.soundFx.playProcessRun();
        this.runSimulation();
      });
    }

    const btnStep = document.getElementById('btnStepSimulation');
    if (btnStep) {
      btnStep.addEventListener('click', () => this.stepSimulate());
    }

    const btnCompare = document.getElementById('btnCompareAllAlgos');
    if (btnCompare) {
      btnCompare.addEventListener('click', () => this.showComparisonBenchmark());
    }

    const btnCloseComp = document.getElementById('btnCloseComparison');
    if (btnCloseComp) {
      btnCloseComp.addEventListener('click', () => {
        const panel = document.getElementById('algoComparisonPanel');
        if (panel) panel.classList.add('hidden');
      });
    }

    const btnReset = document.getElementById('btnResetScheduler');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.processes = [
          { id: 'p0', name: 'P0', at: 0, bt: 5, priority: 2, color: '#00ffcc' },
          { id: 'p1', name: 'P1', at: 1, bt: 3, priority: 1, color: '#ffb830' },
          { id: 'p2', name: 'P2', at: 2, bt: 8, priority: 3, color: '#a855f7' },
          { id: 'p3', name: 'P3', at: 3, bt: 6, priority: 2, color: '#10b981' }
        ];
        this.renderProcessTable();
        this.runSimulation();
      });
    }

    // Add Process
    const btnAdd = document.getElementById('btnAddProcess');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => this.addNewProcess());
    }

    // Randomize Workload
    const btnRandom = document.getElementById('btnRandomizeWorkload');
    if (btnRandom) {
      btnRandom.addEventListener('click', () => this.generateRandomWorkload());
    }

    // Convoy Effect Demo Preset
    const btnConvoy = document.getElementById('btnPresetConvoy');
    if (btnConvoy) {
      btnConvoy.addEventListener('click', () => this.loadConvoyPreset());
    }
  }

  addNewProcess() {
    if (this.processes.length >= 8) {
      alert('Maximum 8 processes allowed in scheduling queue.');
      return;
    }

    const colors = ['#00ffcc', '#ffb830', '#a855f7', '#10b981', '#f43f5e', '#00aaff', '#eab308', '#ec4899'];
    const pIdx = this.processes.length;
    const newProc = {
      id: `p${pIdx}`,
      name: `P${pIdx}`,
      at: pIdx * 2,
      bt: Math.floor(1 + Math.random() * 7),
      priority: Math.floor(1 + Math.random() * 4),
      color: colors[pIdx % colors.length]
    };

    this.processes.push(newProc);
    if (window.soundFx) window.soundFx.playAllocate(1.1);
    this.renderProcessTable();
    this.runSimulation();
  }

  deleteProcess(index) {
    if (this.processes.length <= 1) {
      alert('At least 1 process must remain in workload.');
      return;
    }
    this.processes.splice(index, 1);
    if (window.soundFx) window.soundFx.playClick();
    this.renderProcessTable();
    this.runSimulation();
  }

  generateRandomWorkload() {
    const colors = ['#00ffcc', '#ffb830', '#a855f7', '#10b981', '#f43f5e', '#00aaff'];
    const count = 4 + Math.floor(Math.random() * 3);
    this.processes = Array.from({ length: count }, (_, i) => ({
      id: `p${i}`,
      name: `P${i}`,
      at: Math.floor(Math.random() * 6),
      bt: 1 + Math.floor(Math.random() * 9),
      priority: 1 + Math.floor(Math.random() * 5),
      color: colors[i % colors.length]
    }));

    if (window.soundFx) window.soundFx.playAllocate(1.3);
    this.renderProcessTable();
    this.runSimulation();
  }

  loadConvoyPreset() {
    this.processes = [
      { id: 'p0', name: 'P0 (Heavy)', at: 0, bt: 24, priority: 1, color: '#f43f5e' },
      { id: 'p1', name: 'P1 (Quick)', at: 0, bt: 3, priority: 2, color: '#00ffcc' },
      { id: 'p2', name: 'P2 (Quick)', at: 0, bt: 3, priority: 3, color: '#ffb830' }
    ];
    if (window.soundFx) window.soundFx.playClick();
    this.renderProcessTable();
    this.runSimulation();
    alert('Loaded "Convoy Effect" workload:\nP0 arrives at 0 with 24ms burst. Watch how FCFS suffers high waiting time vs SJF/Round Robin!');
  }

  renderProcessTable() {
    const tbody = document.getElementById('schedulerTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    this.processes.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${p.name}</strong></td>
        <td><span class="proc-color-dot" style="background-color: ${p.color}"></span></td>
        <td><input type="number" min="0" max="50" class="table-input at-input" value="${p.at}" data-idx="${idx}"></td>
        <td><input type="number" min="1" max="50" class="table-input bt-input" value="${p.bt}" data-idx="${idx}"></td>
        <td class="priority-col"><input type="number" min="1" max="10" class="table-input pri-input" value="${p.priority}" data-idx="${idx}"></td>
        <td id="ct_${p.id}">--</td>
        <td id="tat_${p.id}">--</td>
        <td id="wt_${p.id}">--</td>
        <td>
          <button class="cyber-btn danger sm btn-del-proc" data-idx="${idx}">✖</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Input change listeners
    tbody.querySelectorAll('.at-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        this.processes[idx].at = Math.max(0, parseInt(e.target.value, 10) || 0);
        this.runSimulation();
      });
    });

    tbody.querySelectorAll('.bt-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        this.processes[idx].bt = Math.max(1, parseInt(e.target.value, 10) || 1);
        this.runSimulation();
      });
    });

    tbody.querySelectorAll('.pri-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        this.processes[idx].priority = Math.max(1, parseInt(e.target.value, 10) || 1);
        this.runSimulation();
      });
    });

    tbody.querySelectorAll('.btn-del-proc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.idx, 10);
        this.deleteProcess(idx);
      });
    });
  }

  runSimulation() {
    this.currentSimulation = SchedulerEngine.simulate(this.selectedAlgo, this.processes, this.quantum);

    // Update Process Table results
    this.currentSimulation.processes.forEach(p => {
      const ctEl = document.getElementById(`ct_${p.id}`);
      const tatEl = document.getElementById(`tat_${p.id}`);
      const wtEl = document.getElementById(`wt_${p.id}`);

      if (ctEl) ctEl.textContent = `${p.completionTime}ms`;
      if (tatEl) tatEl.textContent = `${p.turnaroundTime}ms`;
      if (wtEl) wtEl.textContent = `${p.waitingTime}ms`;
    });

    // Render Gantt Chart
    this.ganttRenderer.render(this.currentSimulation);

    // Update Metrics Cards
    const awtEl = document.getElementById('metricAWT');
    const atatEl = document.getElementById('metricATAT');
    const utilEl = document.getElementById('metricCpuUtil');
    const tpEl = document.getElementById('metricThroughput');

    if (awtEl) awtEl.textContent = `${this.currentSimulation.awt} ms`;
    if (atatEl) atatEl.textContent = `${this.currentSimulation.atat} ms`;
    if (utilEl) utilEl.textContent = `${this.currentSimulation.cpuUtil}%`;
    if (tpEl) tpEl.textContent = `${this.currentSimulation.throughput} proc/ms`;

    // Update HUD CPU Util
    const hudCpuMeter = document.getElementById('hudCpuMeter');
    const hudCpuText = document.getElementById('hudCpuText');
    if (hudCpuMeter && hudCpuText) {
      hudCpuMeter.style.width = `${this.currentSimulation.cpuUtil}%`;
      hudCpuText.textContent = `${this.currentSimulation.cpuUtil}%`;
    }

    // Update Live CPU Core visualizer
    this.updateLiveCpuCore(this.currentSimulation.timeline[0]);
  }

  updateLiveCpuCore(firstBlock) {
    const chipName = document.getElementById('currentRunningProcName');
    const chipRemaining = document.getElementById('chipRemainingTime');
    const chip = document.getElementById('activeCpuChip');
    const readyItems = document.getElementById('readyQueueItems');

    if (!firstBlock) {
      if (chipName) chipName.textContent = 'IDLE';
      if (chip) chip.className = 'cpu-chip';
      return;
    }

    if (chipName) chipName.textContent = firstBlock.processName;
    if (chipRemaining) chipRemaining.textContent = `Slice: ${firstBlock.duration}ms`;

    if (chip) {
      chip.className = firstBlock.isIdle ? 'cpu-chip' : 'cpu-chip busy';
      if (!firstBlock.isIdle) {
        chip.style.borderColor = firstBlock.color;
      }
    }

    if (readyItems) {
      readyItems.innerHTML = '';
      this.processes.forEach(p => {
        if (p.name !== firstBlock.processName) {
          const item = document.createElement('div');
          item.className = 'queue-proc-chip';
          item.style.setProperty('--proc-color', p.color);
          item.textContent = `${p.name} (BT:${p.bt})`;
          readyItems.appendChild(item);
        }
      });
      if (readyItems.children.length === 0) {
        readyItems.innerHTML = '<span class="queue-empty-msg">Queue empty</span>';
      }
    }
  }

  stepSimulate() {
    if (!this.currentSimulation || this.currentSimulation.timeline.length === 0) return;

    this.stepClock = (this.stepClock + 1) % (this.currentSimulation.totalTime + 1);
    const clockDisplay = document.getElementById('liveClockDisplay');
    if (clockDisplay) clockDisplay.textContent = `TIME: ${this.stepClock} ms`;

    // Find current active block at stepClock
    const activeBlock = this.currentSimulation.timeline.find(
      t => this.stepClock >= t.startTime && this.stepClock < t.endTime
    );

    if (activeBlock) {
      this.updateLiveCpuCore(activeBlock);
      if (!activeBlock.isIdle && window.soundFx) {
        window.soundFx.playClick();
      }
    }
  }

  showComparisonBenchmark() {
    const algos = [
      { name: 'FCFS', key: 'FCFS' },
      { name: 'SJF (Non-Preemptive)', key: 'SJF' },
      { name: 'SRTF (Preemptive SJF)', key: 'SRTF' },
      { name: 'Priority (Non-Preemptive)', key: 'PRIORITY_NP' },
      { name: 'Priority (Preemptive)', key: 'PRIORITY_P' },
      { name: `Round Robin (q=${this.quantum})`, key: 'RR' }
    ];

    const results = algos.map(a => {
      const res = SchedulerEngine.simulate(a.key, this.processes, this.quantum);
      return { ...res, displayName: a.name };
    });

    // Sort by lowest Average Waiting Time
    results.sort((a, b) => a.awt - b.awt);

    const tbody = document.getElementById('comparisonTableBody');
    const panel = document.getElementById('algoComparisonPanel');

    if (tbody && panel) {
      tbody.innerHTML = '';
      results.forEach((r, rank) => {
        const tr = document.createElement('tr');
        const isWinner = rank === 0;
        tr.innerHTML = `
          <td><strong>${r.displayName}</strong> ${isWinner ? '🥇' : ''}</td>
          <td><span style="color: ${isWinner ? 'var(--neon-green)' : '#fff'}; font-weight: 700;">${r.awt} ms</span></td>
          <td>${r.atat} ms</td>
          <td>${r.maxWT} ms</td>
          <td>${r.contextSwitches}</td>
          <td>${isWinner ? '<strong style="color: var(--neon-green);">BEST EFFICIENCY</strong>' : `#${rank + 1}`}</td>
        `;
        tbody.appendChild(tr);
      });

      panel.classList.remove('hidden');
      if (window.soundFx) window.soundFx.playVictoryFanfare();
    }
  }
}

window.SchedulerGame = SchedulerGame;

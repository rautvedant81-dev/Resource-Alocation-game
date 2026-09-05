/**
 * ==========================================================================
 * KERNEL MASTER: Campaign Levels & High-Difficulty Configurations
 * Starts with 5+ concurrent processes from Stage 1 with tight Banker limits!
 * ==========================================================================
 */

const RESOURCE_TYPES = {
  RAM: { name: 'RAM', icon: '💾', color: '#0284c7', bg: '#e0f2fe' },
  CPU: { name: 'CPU', icon: '⚡', color: '#d97706', bg: '#fef3c7' },
  Disk: { name: 'Disk', icon: '💿', color: '#7c3aed', bg: '#f3e8ff' },
  Printer: { name: 'Printer', icon: '🖨️', color: '#059669', bg: '#d1fae5' },
  GPU: { name: 'GPU', icon: '🎮', color: '#e11d48', bg: '#ffe4e6' }
};

const BANKER_LEVELS = [
  {
    id: 1,
    title: 'Stage 1: Multi-Process Kernel Boot',
    difficulty: 'CHALLENGING',
    difficultyClass: 'safe',
    desc: 'The kernel boots 5 concurrent processes competing for RAM, CPU, and Disk! Analyze their Need vectors carefully to find the safe execution order without causing a system freeze.',
    resources: ['RAM', 'CPU', 'Disk'],
    totalInstances: [10, 6, 7],
    available: [3, 2, 2],
    processes: [
      { name: 'P0', max: [7, 5, 3], alloc: [0, 1, 0], burstTime: 1200 },
      { name: 'P1', max: [3, 2, 2], alloc: [2, 0, 0], burstTime: 1000 },
      { name: 'P2', max: [9, 0, 2], alloc: [3, 0, 2], burstTime: 1400 },
      { name: 'P3', max: [2, 2, 2], alloc: [2, 1, 1], burstTime: 1100 },
      { name: 'P4', max: [4, 3, 3], alloc: [0, 0, 2], burstTime: 1300 }
    ],
    targetScore: 500,
    hint: 'Compare Available [3, 2, 2] with P1 (Need: [1, 2, 2]) and P3 (Need: [0, 1, 1]). Fulfill P1 or P3 first to grow your resource pool!'
  },
  {
    id: 2,
    title: 'Stage 2: Device Contention & Tight Limits',
    difficulty: 'HARD',
    difficultyClass: 'safe',
    desc: '5 heavy processes with tight available resources [2, 1, 1]. Only one process can safely run initially. A single mistake will lead to an immediate unsafe state!',
    resources: ['RAM', 'CPU', 'Disk'],
    totalInstances: [11, 7, 8],
    available: [2, 1, 1],
    processes: [
      { name: 'P0', max: [4, 3, 2], alloc: [2, 1, 1], burstTime: 1200 },
      { name: 'P1', max: [2, 1, 1], alloc: [1, 0, 0], burstTime: 900 },
      { name: 'P2', max: [5, 2, 3], alloc: [3, 1, 2], burstTime: 1400 },
      { name: 'P3', max: [3, 3, 2], alloc: [1, 2, 1], burstTime: 1100 },
      { name: 'P4', max: [4, 2, 3], alloc: [2, 2, 3], burstTime: 1300 }
    ],
    targetScore: 600,
    hint: 'Look at P1 (Need: [1, 1, 1]). It exactly fits the initial Available pool [2, 1, 1]!'
  },
  {
    id: 3,
    title: 'Stage 3: 4-Resource Gridlock (6 Processes)',
    difficulty: 'HARD',
    difficultyClass: 'unsafe',
    desc: 'Printer devices have been added. 6 processes are active with scarce Printer units. Multiple processes are waiting; pick the right sequence to cascade completions.',
    resources: ['RAM', 'CPU', 'Disk', 'Printer'],
    totalInstances: [12, 9, 8, 5],
    available: [2, 1, 1, 1],
    processes: [
      { name: 'P0', max: [4, 3, 2, 2], alloc: [1, 2, 1, 0], burstTime: 1200 },
      { name: 'P1', max: [2, 1, 2, 1], alloc: [1, 0, 1, 1], burstTime: 900 },
      { name: 'P2', max: [5, 3, 2, 2], alloc: [3, 1, 1, 1], burstTime: 1400 },
      { name: 'P3', max: [2, 2, 1, 1], alloc: [1, 1, 0, 0], burstTime: 1000 },
      { name: 'P4', max: [4, 2, 2, 1], alloc: [2, 1, 1, 1], burstTime: 1300 },
      { name: 'P5', max: [3, 2, 2, 2], alloc: [2, 1, 2, 1], burstTime: 1100 }
    ],
    targetScore: 750,
    hint: 'Check P1 and P3. Both have low needs that can be satisfied by [2, 1, 1, 1].'
  },
  {
    id: 4,
    title: 'Stage 4: Banker\'s Heavy Protocol (6 Processes)',
    difficulty: 'EXPERT',
    difficultyClass: 'unsafe',
    desc: 'High competition for Disk and Printer resources. Every process has multi-unit requirements. You must keep at least 2 safe sequence paths open.',
    resources: ['RAM', 'CPU', 'Disk', 'Printer'],
    totalInstances: [14, 10, 9, 6],
    available: [2, 2, 1, 1],
    processes: [
      { name: 'P0', max: [5, 4, 3, 2], alloc: [2, 2, 1, 1], burstTime: 1300 },
      { name: 'P1', max: [3, 2, 2, 1], alloc: [1, 1, 1, 0], burstTime: 900 },
      { name: 'P2', max: [4, 3, 2, 2], alloc: [2, 1, 2, 1], burstTime: 1200 },
      { name: 'P3', max: [2, 2, 1, 1], alloc: [1, 1, 1, 1], burstTime: 900 },
      { name: 'P4', max: [6, 3, 3, 2], alloc: [3, 1, 2, 1], burstTime: 1500 },
      { name: 'P5', max: [3, 2, 2, 1], alloc: [1, 1, 0, 1], burstTime: 1100 }
    ],
    targetScore: 900,
    hint: 'P3 needs only [1, 1, 0, 0], which is well within Available [2, 2, 1, 1]. Execute P3 first!'
  },
  {
    id: 5,
    title: 'Stage 5: High Concurrency Scramble (7 Processes)',
    difficulty: 'EXPERT',
    difficultyClass: 'unsafe',
    desc: '7 concurrent processes! Strict resource contention across RAM, CPU, Disk, and Printer. Avoid starvation by prioritizing urgent processes.',
    resources: ['RAM', 'CPU', 'Disk', 'Printer'],
    totalInstances: [15, 11, 10, 7],
    available: [3, 2, 2, 1],
    processes: [
      { name: 'P0', max: [5, 3, 2, 2], alloc: [2, 1, 1, 0], burstTime: 1300 },
      { name: 'P1', max: [3, 2, 2, 1], alloc: [1, 1, 1, 1], burstTime: 900 },
      { name: 'P2', max: [4, 2, 1, 1], alloc: [2, 0, 1, 0], burstTime: 1200 },
      { name: 'P3', max: [2, 1, 1, 1], alloc: [1, 1, 0, 0], burstTime: 850 },
      { name: 'P4', max: [6, 3, 3, 2], alloc: [3, 2, 2, 1], burstTime: 1500 },
      { name: 'P5', max: [3, 2, 2, 2], alloc: [1, 1, 1, 2], burstTime: 1100 },
      { name: 'P6', max: [4, 3, 2, 1], alloc: [1, 1, 1, 1], burstTime: 1200 }
    ],
    targetScore: 1100,
    hint: 'P3 needs [1, 0, 1, 1] — complete P3 to unlock resources for P1 and P2.'
  },
  {
    id: 6,
    title: 'Stage 6: Dynamic Sub-Requests (7 Processes)',
    difficulty: 'MASTER',
    difficultyClass: 'unsafe',
    desc: 'Seven active jobs with volatile resource demands. One bad allocation creates an unbreakable circular wait cycle.',
    resources: ['RAM', 'CPU', 'Disk', 'Printer'],
    totalInstances: [16, 12, 11, 8],
    available: [2, 2, 1, 1],
    processes: [
      { name: 'P0', max: [5, 4, 3, 2], alloc: [2, 2, 1, 1], burstTime: 1300 },
      { name: 'P1', max: [3, 2, 2, 1], alloc: [1, 1, 1, 0], burstTime: 900 },
      { name: 'P2', max: [4, 3, 2, 2], alloc: [2, 1, 2, 1], burstTime: 1200 },
      { name: 'P3', max: [2, 2, 1, 1], alloc: [1, 1, 1, 1], burstTime: 850 },
      { name: 'P4', max: [6, 3, 3, 2], alloc: [3, 1, 2, 1], burstTime: 1500 },
      { name: 'P5', max: [3, 2, 2, 1], alloc: [1, 1, 0, 1], burstTime: 1000 },
      { name: 'P6', max: [5, 3, 3, 2], alloc: [2, 1, 2, 1], burstTime: 1300 }
    ],
    targetScore: 1300,
    hint: 'Execute P3 → P1 → P5 to steadily build up free RAM and Printer units.'
  },
  {
    id: 7,
    title: 'Stage 7: GPU Workload Pressure (7 Processes, 5 Resources)',
    difficulty: 'MASTER',
    difficultyClass: 'unsafe',
    desc: 'All 5 resource classes activated: RAM, CPU, Disk, Printer, and GPU! High graphical processing requirements.',
    resources: ['RAM', 'CPU', 'Disk', 'Printer', 'GPU'],
    totalInstances: [15, 11, 10, 7, 5],
    available: [2, 2, 1, 1, 1],
    processes: [
      { name: 'P0', max: [4, 3, 2, 2, 1], alloc: [1, 1, 1, 1, 0], burstTime: 1200 },
      { name: 'P1', max: [3, 2, 1, 1, 1], alloc: [1, 1, 1, 0, 1], burstTime: 900 },
      { name: 'P2', max: [5, 3, 3, 2, 2], alloc: [2, 1, 2, 1, 1], burstTime: 1400 },
      { name: 'P3', max: [2, 1, 1, 1, 1], alloc: [1, 0, 0, 1, 0], burstTime: 850 },
      { name: 'P4', max: [4, 2, 2, 1, 1], alloc: [2, 1, 1, 0, 1], burstTime: 1200 },
      { name: 'P5', max: [3, 2, 2, 1, 1], alloc: [1, 1, 1, 1, 0], burstTime: 1000 },
      { name: 'P6', max: [4, 3, 2, 2, 1], alloc: [2, 2, 1, 0, 1], burstTime: 1300 }
    ],
    targetScore: 1500,
    hint: 'GPU units are scarce (only 1 available). Prioritize P1 or P3 to free up GPU locks.'
  },
  {
    id: 8,
    title: 'Stage 8: Critical Deadlock Recovery (8 Processes)',
    difficulty: 'GRANDMASTER',
    difficultyClass: 'deadlock',
    desc: 'CRITICAL WARNING! 8 processes are locked with [0, 0, 0, 0] Available resources. Use Preemption or Termination to recover!',
    resources: ['RAM', 'CPU', 'Disk', 'Printer'],
    totalInstances: [14, 10, 9, 7],
    available: [0, 0, 0, 0],
    processes: [
      { name: 'P0', max: [4, 2, 2, 2], alloc: [2, 1, 1, 1], burstTime: 1300 },
      { name: 'P1', max: [3, 2, 1, 1], alloc: [2, 1, 1, 1], burstTime: 1000 },
      { name: 'P2', max: [3, 2, 2, 1], alloc: [1, 2, 1, 1], burstTime: 1100 },
      { name: 'P3', max: [4, 2, 2, 1], alloc: [2, 1, 1, 1], burstTime: 1200 },
      { name: 'P4', max: [3, 1, 2, 2], alloc: [1, 1, 1, 1], burstTime: 1000 },
      { name: 'P5', max: [4, 3, 2, 1], alloc: [2, 1, 1, 1], burstTime: 1300 },
      { name: 'P6', max: [2, 2, 1, 1], alloc: [1, 1, 1, 0], burstTime: 900 },
      { name: 'P7', max: [5, 2, 2, 2], alloc: [3, 2, 2, 1], burstTime: 1500 }
    ],
    targetScore: 1800,
    hint: 'Terminate P7 or preempt from P0 to kickstart the safe sequence cascade!'
  },
  {
    id: 9,
    title: 'Stage 9: Chaos Kernel (8 Processes, 5 Resources)',
    difficulty: 'GRANDMASTER',
    difficultyClass: 'unsafe',
    desc: '8 heavy processes contending for RAM, CPU, Disk, Printer, and GPU. Complex dependencies on every dimension.',
    resources: ['RAM', 'CPU', 'Disk', 'Printer', 'GPU'],
    totalInstances: [17, 13, 12, 9, 7],
    available: [2, 2, 1, 1, 1],
    processes: [
      { name: 'P0', max: [5, 4, 3, 2, 2], alloc: [2, 2, 1, 1, 1], burstTime: 1400 },
      { name: 'P1', max: [3, 2, 2, 1, 1], alloc: [1, 1, 1, 0, 0], burstTime: 900 },
      { name: 'P2', max: [4, 3, 2, 2, 1], alloc: [2, 1, 2, 1, 1], burstTime: 1200 },
      { name: 'P3', max: [2, 2, 1, 1, 1], alloc: [1, 1, 1, 1, 0], burstTime: 850 },
      { name: 'P4', max: [6, 4, 3, 2, 2], alloc: [3, 2, 2, 1, 1], burstTime: 1500 },
      { name: 'P5', max: [3, 3, 2, 1, 1], alloc: [1, 1, 0, 1, 1], burstTime: 1000 },
      { name: 'P6', max: [5, 3, 3, 2, 2], alloc: [2, 2, 2, 1, 1], burstTime: 1300 },
      { name: 'P7', max: [4, 2, 2, 1, 1], alloc: [2, 1, 1, 1, 0], burstTime: 1100 }
    ],
    targetScore: 2200,
    hint: 'Chain P3 → P1 → P5 → P7 to progressively release GPU and Printer locks!'
  },
  {
    id: 10,
    title: 'Stage 10: Master Kernel Finale (8 Heavy Processes)',
    difficulty: 'LEGENDARY',
    difficultyClass: 'deadlock',
    desc: 'The ultimate Operating System challenge: 8 massive processes demanding full system capacity. Only a true Kernel Master can solve this without a kernel panic!',
    resources: ['RAM', 'CPU', 'Disk', 'Printer', 'GPU'],
    totalInstances: [18, 14, 13, 10, 8],
    available: [3, 2, 2, 1, 1],
    processes: [
      { name: 'P0', max: [6, 4, 3, 3, 2], alloc: [2, 2, 1, 1, 1], burstTime: 1500 },
      { name: 'P1', max: [3, 2, 2, 1, 1], alloc: [1, 1, 1, 0, 0], burstTime: 900 },
      { name: 'P2', max: [5, 3, 3, 2, 2], alloc: [2, 1, 2, 1, 1], burstTime: 1300 },
      { name: 'P3', max: [2, 2, 1, 1, 1], alloc: [1, 1, 1, 1, 0], burstTime: 850 },
      { name: 'P4', max: [7, 4, 4, 3, 2], alloc: [3, 2, 2, 1, 1], burstTime: 1600 },
      { name: 'P5', max: [3, 3, 2, 2, 1], alloc: [1, 1, 0, 1, 1], burstTime: 1050 },
      { name: 'P6', max: [5, 4, 3, 2, 2], alloc: [2, 2, 2, 1, 1], burstTime: 1400 },
      { name: 'P7', max: [4, 3, 2, 2, 1], alloc: [2, 1, 1, 1, 1], burstTime: 1200 }
    ],
    targetScore: 3000,
    hint: 'Strict sequence required: P3 → P1 → P5 → P7 → P2 → P0 → P6 → P4!'
  }
];

window.RESOURCE_TYPES = RESOURCE_TYPES;
window.BANKER_LEVELS = BANKER_LEVELS;

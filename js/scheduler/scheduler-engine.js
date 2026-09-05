/**
 * ==========================================================================
 * KERNEL MASTER: CPU Scheduling Algorithms Engine
 * Exact mathematical simulations of FCFS, SJF, SRTF, Priority (P/NP),
 * and Round Robin with detailed Gantt timeline intervals and metrics.
 * ==========================================================================
 */

class SchedulerEngine {
  /**
   * Helper to deep clone process list
   */
  static cloneWorkload(processes) {
    return processes.map(p => ({
      id: p.id,
      name: p.name,
      at: Number(p.at), // Arrival Time
      bt: Number(p.bt), // Burst Time
      priority: Number(p.priority || 1), // Priority (lower = higher priority)
      color: p.color || '#00ffcc',
      remainingBt: Number(p.bt),
      firstResponseTime: -1,
      completionTime: 0,
      turnaroundTime: 0,
      waitingTime: 0
    }));
  }

  /**
   * Run the selected scheduling algorithm
   */
  static simulate(algo, rawProcesses, quantum = 2) {
    switch (algo) {
      case 'FCFS':
        return this.simulateFCFS(rawProcesses);
      case 'SJF':
        return this.simulateSJF(rawProcesses);
      case 'SRTF':
        return this.simulateSRTF(rawProcesses);
      case 'PRIORITY_NP':
        return this.simulatePriority(rawProcesses, false);
      case 'PRIORITY_P':
        return this.simulatePriority(rawProcesses, true);
      case 'RR':
      case 'ROUND_ROBIN':
        return this.simulateRoundRobin(rawProcesses, quantum);
      default:
        return this.simulateFCFS(rawProcesses);
    }
  }

  /**
   * 1. FCFS: First-Come, First-Served
   */
  static simulateFCFS(rawProcesses) {
    const procs = this.cloneWorkload(rawProcesses);
    // Sort primarily by arrival time, secondary by ID
    procs.sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));

    let currentTime = 0;
    const timeline = [];
    let contextSwitches = 0;

    procs.forEach((p, idx) => {
      // If CPU is idle before process arrives
      if (currentTime < p.at) {
        timeline.push({
          processId: 'IDLE',
          processName: 'IDLE',
          startTime: currentTime,
          endTime: p.at,
          duration: p.at - currentTime,
          color: '#1e293b',
          isIdle: true
        });
        currentTime = p.at;
      }

      p.firstResponseTime = currentTime - p.at;
      const start = currentTime;
      currentTime += p.bt;
      p.completionTime = currentTime;
      p.turnaroundTime = p.completionTime - p.at;
      p.waitingTime = p.turnaroundTime - p.bt;

      timeline.push({
        processId: p.id,
        processName: p.name,
        startTime: start,
        endTime: currentTime,
        duration: p.bt,
        color: p.color,
        isIdle: false
      });

      if (idx < procs.length - 1) contextSwitches++;
    });

    return this.calculateSummary('FCFS', procs, timeline, contextSwitches);
  }

  /**
   * 2. SJF: Shortest Job First (Non-Preemptive)
   */
  static simulateSJF(rawProcesses) {
    const procs = this.cloneWorkload(rawProcesses);
    let currentTime = 0;
    let completed = 0;
    const n = procs.length;
    const timeline = [];
    let contextSwitches = 0;
    const isCompleted = new Array(n).fill(false);

    while (completed < n) {
      // Find ready processes at currentTime
      let minIdx = -1;
      let minBt = Infinity;

      for (let i = 0; i < n; i++) {
        if (!isCompleted[i] && procs[i].at <= currentTime) {
          if (procs[i].bt < minBt) {
            minBt = procs[i].bt;
            minIdx = i;
          } else if (procs[i].bt === minBt) {
            // Tie-break by arrival time
            if (procs[i].at < procs[minIdx].at) {
              minIdx = i;
            }
          }
        }
      }

      if (minIdx === -1) {
        // CPU Idle
        const nextArrival = Math.min(...procs.filter((_, idx) => !isCompleted[idx]).map(p => p.at));
        timeline.push({
          processId: 'IDLE',
          processName: 'IDLE',
          startTime: currentTime,
          endTime: nextArrival,
          duration: nextArrival - currentTime,
          color: '#1e293b',
          isIdle: true
        });
        currentTime = nextArrival;
      } else {
        const p = procs[minIdx];
        p.firstResponseTime = currentTime - p.at;
        const start = currentTime;
        currentTime += p.bt;
        p.completionTime = currentTime;
        p.turnaroundTime = p.completionTime - p.at;
        p.waitingTime = p.turnaroundTime - p.bt;
        isCompleted[minIdx] = true;
        completed++;

        timeline.push({
          processId: p.id,
          processName: p.name,
          startTime: start,
          endTime: currentTime,
          duration: p.bt,
          color: p.color,
          isIdle: false
        });

        if (completed < n) contextSwitches++;
      }
    }

    return this.calculateSummary('SJF', procs, timeline, contextSwitches);
  }

  /**
   * 3. SRTF: Shortest Remaining Time First (Preemptive SJF)
   */
  static simulateSRTF(rawProcesses) {
    const procs = this.cloneWorkload(rawProcesses);
    let currentTime = 0;
    let completed = 0;
    const n = procs.length;
    const timeline = [];
    let contextSwitches = 0;
    let lastProcId = null;

    // Time-slice stepping simulation
    while (completed < n) {
      // Find process with shortest remaining time among arrived processes
      let shortestIdx = -1;
      let minRemaining = Infinity;

      for (let i = 0; i < n; i++) {
        if (procs[i].at <= currentTime && procs[i].remainingBt > 0) {
          if (procs[i].remainingBt < minRemaining) {
            minRemaining = procs[i].remainingBt;
            shortestIdx = i;
          } else if (procs[i].remainingBt === minRemaining) {
            if (procs[i].at < procs[shortestIdx].at) {
              shortestIdx = i;
            }
          }
        }
      }

      if (shortestIdx === -1) {
        // CPU Idle
        const nextArrival = Math.min(...procs.filter(p => p.remainingBt > 0).map(p => p.at));
        timeline.push({
          processId: 'IDLE',
          processName: 'IDLE',
          startTime: currentTime,
          endTime: nextArrival,
          duration: nextArrival - currentTime,
          color: '#1e293b',
          isIdle: true
        });
        currentTime = nextArrival;
        lastProcId = 'IDLE';
      } else {
        const p = procs[shortestIdx];
        if (p.firstResponseTime === -1) {
          p.firstResponseTime = currentTime - p.at;
        }

        if (lastProcId !== null && lastProcId !== p.id && lastProcId !== 'IDLE') {
          contextSwitches++;
        }
        lastProcId = p.id;

        // Run for 1ms time step
        const start = currentTime;
        p.remainingBt--;
        currentTime++;

        // Consolidate continuous time blocks in timeline
        const lastBlock = timeline[timeline.length - 1];
        if (lastBlock && lastBlock.processId === p.id && lastBlock.endTime === start) {
          lastBlock.endTime = currentTime;
          lastBlock.duration = lastBlock.endTime - lastBlock.startTime;
        } else {
          timeline.push({
            processId: p.id,
            processName: p.name,
            startTime: start,
            endTime: currentTime,
            duration: 1,
            color: p.color,
            isIdle: false
          });
        }

        if (p.remainingBt === 0) {
          p.completionTime = currentTime;
          p.turnaroundTime = p.completionTime - p.at;
          p.waitingTime = p.turnaroundTime - p.bt;
          completed++;
        }
      }
    }

    return this.calculateSummary('SRTF', procs, timeline, contextSwitches);
  }

  /**
   * 4. Priority Scheduling (Preemptive / Non-Preemptive)
   * Lower numerical value = Higher priority
   */
  static simulatePriority(rawProcesses, isPreemptive = false) {
    const procs = this.cloneWorkload(rawProcesses);
    let currentTime = 0;
    let completed = 0;
    const n = procs.length;
    const timeline = [];
    let contextSwitches = 0;
    let lastProcId = null;
    const isCompleted = new Array(n).fill(false);

    if (!isPreemptive) {
      // Non-Preemptive Priority
      while (completed < n) {
        let bestIdx = -1;
        let bestPriority = Infinity;

        for (let i = 0; i < n; i++) {
          if (!isCompleted[i] && procs[i].at <= currentTime) {
            if (procs[i].priority < bestPriority) {
              bestPriority = procs[i].priority;
              bestIdx = i;
            } else if (procs[i].priority === bestPriority) {
              if (procs[i].at < procs[bestIdx].at) bestIdx = i;
            }
          }
        }

        if (bestIdx === -1) {
          const nextArr = Math.min(...procs.filter((_, idx) => !isCompleted[idx]).map(p => p.at));
          timeline.push({
            processId: 'IDLE',
            processName: 'IDLE',
            startTime: currentTime,
            endTime: nextArr,
            duration: nextArr - currentTime,
            color: '#1e293b',
            isIdle: true
          });
          currentTime = nextArr;
        } else {
          const p = procs[bestIdx];
          p.firstResponseTime = currentTime - p.at;
          const start = currentTime;
          currentTime += p.bt;
          p.completionTime = currentTime;
          p.turnaroundTime = p.completionTime - p.at;
          p.waitingTime = p.turnaroundTime - p.bt;
          isCompleted[bestIdx] = true;
          completed++;

          timeline.push({
            processId: p.id,
            processName: p.name,
            startTime: start,
            endTime: currentTime,
            duration: p.bt,
            color: p.color,
            isIdle: false
          });

          if (completed < n) contextSwitches++;
        }
      }
    } else {
      // Preemptive Priority
      while (completed < n) {
        let bestIdx = -1;
        let bestPriority = Infinity;

        for (let i = 0; i < n; i++) {
          if (procs[i].at <= currentTime && procs[i].remainingBt > 0) {
            if (procs[i].priority < bestPriority) {
              bestPriority = procs[i].priority;
              bestIdx = i;
            } else if (procs[i].priority === bestPriority) {
              if (procs[i].at < procs[bestIdx].at) bestIdx = i;
            }
          }
        }

        if (bestIdx === -1) {
          const nextArr = Math.min(...procs.filter(p => p.remainingBt > 0).map(p => p.at));
          timeline.push({
            processId: 'IDLE',
            processName: 'IDLE',
            startTime: currentTime,
            endTime: nextArr,
            duration: nextArr - currentTime,
            color: '#1e293b',
            isIdle: true
          });
          currentTime = nextArr;
          lastProcId = 'IDLE';
        } else {
          const p = procs[bestIdx];
          if (p.firstResponseTime === -1) p.firstResponseTime = currentTime - p.at;

          if (lastProcId !== null && lastProcId !== p.id && lastProcId !== 'IDLE') {
            contextSwitches++;
          }
          lastProcId = p.id;

          const start = currentTime;
          p.remainingBt--;
          currentTime++;

          const lastBlock = timeline[timeline.length - 1];
          if (lastBlock && lastBlock.processId === p.id && lastBlock.endTime === start) {
            lastBlock.endTime = currentTime;
            lastBlock.duration = lastBlock.endTime - lastBlock.startTime;
          } else {
            timeline.push({
              processId: p.id,
              processName: p.name,
              startTime: start,
              endTime: currentTime,
              duration: 1,
              color: p.color,
              isIdle: false
            });
          }

          if (p.remainingBt === 0) {
            p.completionTime = currentTime;
            p.turnaroundTime = p.completionTime - p.at;
            p.waitingTime = p.turnaroundTime - p.bt;
            completed++;
          }
        }
      }
    }

    return this.calculateSummary(isPreemptive ? 'Priority (P)' : 'Priority (NP)', procs, timeline, contextSwitches);
  }

  /**
   * 5. Round Robin (RR)
   */
  static simulateRoundRobin(rawProcesses, quantum = 2) {
    const procs = this.cloneWorkload(rawProcesses);
    const q = Math.max(1, quantum);
    let currentTime = 0;
    let completed = 0;
    const n = procs.length;
    const timeline = [];
    let contextSwitches = 0;

    const readyQueue = [];
    const inQueue = new Array(n).fill(false);

    // Initial check for processes arrived at time 0
    const checkArrivals = () => {
      // Sort newly arrived processes by arrival time
      const newlyArrived = [];
      for (let i = 0; i < n; i++) {
        if (!inQueue[i] && procs[i].at <= currentTime && procs[i].remainingBt > 0) {
          newlyArrived.push(i);
          inQueue[i] = true;
        }
      }
      newlyArrived.sort((a, b) => procs[a].at - procs[b].at);
      newlyArrived.forEach(idx => readyQueue.push(idx));
    };

    checkArrivals();

    while (completed < n) {
      if (readyQueue.length === 0) {
        // CPU Idle until next arrival
        const nextArr = Math.min(...procs.filter(p => p.remainingBt > 0).map(p => p.at));
        timeline.push({
          processId: 'IDLE',
          processName: 'IDLE',
          startTime: currentTime,
          endTime: nextArr,
          duration: nextArr - currentTime,
          color: '#1e293b',
          isIdle: true
        });
        currentTime = nextArr;
        checkArrivals();
        continue;
      }

      const pIdx = readyQueue.shift();
      const p = procs[pIdx];

      if (p.firstResponseTime === -1) {
        p.firstResponseTime = currentTime - p.at;
      }

      const slice = Math.min(q, p.remainingBt);
      const start = currentTime;
      currentTime += slice;
      p.remainingBt -= slice;

      timeline.push({
        processId: p.id,
        processName: p.name,
        startTime: start,
        endTime: currentTime,
        duration: slice,
        color: p.color,
        isIdle: false
      });

      // Check for any processes that arrived during this time slice
      checkArrivals();

      if (p.remainingBt > 0) {
        // Put back in ready queue
        readyQueue.push(pIdx);
        contextSwitches++;
      } else {
        p.completionTime = currentTime;
        p.turnaroundTime = p.completionTime - p.at;
        p.waitingTime = p.turnaroundTime - p.bt;
        completed++;
        if (completed < n && readyQueue.length > 0) contextSwitches++;
      }
    }

    return this.calculateSummary(`Round Robin (q=${q})`, procs, timeline, contextSwitches);
  }

  /**
   * Calculate summary metrics from execution results
   */
  static calculateSummary(algoName, processes, timeline, contextSwitches = 0) {
    const n = processes.length;
    if (n === 0) return { algoName, processes: [], timeline: [], awt: 0, atat: 0, cpuUtil: 0, throughput: 0 };

    const totalWT = processes.reduce((acc, p) => acc + p.waitingTime, 0);
    const totalTAT = processes.reduce((acc, p) => acc + p.turnaroundTime, 0);
    const maxWT = Math.max(...processes.map(p => p.waitingTime));

    const totalTime = timeline.length > 0 ? timeline[timeline.length - 1].endTime : 1;
    const idleTime = timeline.filter(t => t.isIdle).reduce((acc, t) => acc + t.duration, 0);
    const busyTime = Math.max(0, totalTime - idleTime);

    const awt = Number((totalWT / n).toFixed(2));
    const atat = Number((totalTAT / n).toFixed(2));
    const cpuUtil = Number(((busyTime / totalTime) * 100).toFixed(1));
    const throughput = Number((n / totalTime).toFixed(3));

    return {
      algoName,
      processes,
      timeline,
      awt,
      atat,
      maxWT,
      cpuUtil,
      throughput,
      totalTime,
      contextSwitches
    };
  }
}

window.SchedulerEngine = SchedulerEngine;

/**
 * ==========================================================================
 * KERNEL MASTER: Banker's Algorithm & Deadlock Engine
 * Complete mathematical safety algorithm, resource request check,
 * deadlock detection & prevention verification.
 * ==========================================================================
 */

class BankerEngine {
  /**
   * Check system safety state using Dijkstra's Banker's Algorithm
   * @param {number[]} available - Array of available resource units [A, B, C, ...]
   * @param {number[][]} maxMatrix - Max claim matrix [P_i][R_j]
   * @param {number[][]} allocMatrix - Current allocation matrix [P_i][R_j]
   * @param {boolean[]} finishedProcs - Array of boolean for already finished processes
   * @param {string[]} resourceNames - Names of resources (e.g. ['RAM', 'CPU', 'Disk'])
   * @param {string[]} processNames - Names of processes (e.g. ['P0', 'P1', 'P2'])
   */
  static evaluateSafety(available, maxMatrix, allocMatrix, finishedProcs = [], resourceNames = [], processNames = []) {
    const numP = maxMatrix.length;
    if (numP === 0) return { isSafe: true, safeSequence: [], proofLog: ['No active processes.'] };
    const numR = available.length;

    // Default names if not provided
    const pNames = processNames.length === numP ? processNames : Array.from({ length: numP }, (_, i) => `P${i}`);
    const rNames = resourceNames.length === numR ? resourceNames : Array.from({ length: numR }, (_, j) => `R${j}`);

    // Compute Need Matrix = Max - Allocation
    const needMatrix = [];
    for (let i = 0; i < numP; i++) {
      needMatrix[i] = [];
      for (let j = 0; j < numR; j++) {
        needMatrix[i][j] = Math.max(0, maxMatrix[i][j] - allocMatrix[i][j]);
      }
    }

    // Work = Copy of Available
    const work = [...available];
    // Finish = Copy of finishedProcs or all false
    const finish = finishedProcs.length === numP ? [...finishedProcs] : new Array(numP).fill(false);

    const safeSequence = [];
    const proofLog = [];

    proofLog.push(`Initial Available: [ ${work.map((w, idx) => `${rNames[idx]}:${w}`).join(', ')} ]`);

    let progressMade = true;
    let stepCount = 1;

    while (progressMade) {
      progressMade = false;

      for (let i = 0; i < numP; i++) {
        if (!finish[i]) {
          // Check if Need_i <= Work
          let canFinish = true;
          for (let j = 0; j < numR; j++) {
            if (needMatrix[i][j] > work[j]) {
              canFinish = false;
              break;
            }
          }

          if (canFinish) {
            // Process i can finish!
            // Work = Work + Allocation_i
            const prevWork = [...work];
            for (let j = 0; j < numR; j++) {
              work[j] += allocMatrix[i][j];
            }
            finish[i] = true;
            safeSequence.push(pNames[i]);
            progressMade = true;

            const needStr = needMatrix[i].map((n, idx) => `${rNames[idx]}:${n}`).join(', ');
            const allocStr = allocMatrix[i].map((a, idx) => `${rNames[idx]}:${a}`).join(', ');
            const newWorkStr = work.map((w, idx) => `${rNames[idx]}:${w}`).join(', ');

            proofLog.push(
              `Step ${stepCount++}: ${pNames[i]} satisfies (Need: [${needStr}] ≤ Work). ` +
              `Reclaims [${allocStr}] → New Work = [${newWorkStr}].`
            );
            break; // Restart loop to check all candidates
          }
        }
      }
    }

    // System is safe if all processes finished
    const allFinished = finish.every(f => f === true);

    if (allFinished) {
      proofLog.push(`✓ System is in a SAFE STATE. Safe Sequence: < ${safeSequence.join(' → ')} >`);
    } else {
      const unfinished = pNames.filter((_, idx) => !finish[idx]);
      proofLog.push(`✗ System is in an UNSAFE STATE! Blocked processes: [ ${unfinished.join(', ')} ]`);
    }

    return {
      isSafe: allFinished,
      safeSequence: allFinished ? safeSequence : [],
      unfinishedProcesses: finish.map((f, i) => (!f ? pNames[i] : null)).filter(Boolean),
      proofLog,
      needMatrix,
      finalWork: work
    };
  }

  /**
   * Test a tentative resource request using the Banker's Resource-Request Algorithm
   */
  static testRequest(pIndex, requestVector, available, maxMatrix, allocMatrix, finishedProcs = []) {
    const numR = available.length;
    const needVector = [];
    for (let j = 0; j < numR; j++) {
      needVector[j] = Math.max(0, maxMatrix[pIndex][j] - allocMatrix[pIndex][j]);
    }

    // 1. Check Request <= Need
    for (let j = 0; j < numR; j++) {
      if (requestVector[j] > needVector[j]) {
        return {
          allowed: false,
          reason: `Error: Process P${pIndex} requested ${requestVector[j]} units of R${j}, which exceeds its Need (${needVector[j]}).`
        };
      }
    }

    // 2. Check Request <= Available
    for (let j = 0; j < numR; j++) {
      if (requestVector[j] > available[j]) {
        return {
          allowed: false,
          reason: `Process P${pIndex} must wait: insufficient available units of R${j} (Requested: ${requestVector[j]}, Avail: ${available[j]}).`
        };
      }
    }

    // 3. Pretend to allocate
    const tempAvailable = [...available];
    const tempAlloc = allocMatrix.map(row => [...row]);
    const tempMax = maxMatrix.map(row => [...row]);

    for (let j = 0; j < numR; j++) {
      tempAvailable[j] -= requestVector[j];
      tempAlloc[pIndex][j] += requestVector[j];
    }

    // 4. Run safety algorithm on tentative state
    const safety = this.evaluateSafety(tempAvailable, tempMax, tempAlloc, finishedProcs);

    return {
      allowed: true,
      keepsSystemSafe: safety.isSafe,
      safeSequence: safety.safeSequence,
      proofLog: safety.proofLog
    };
  }

  /**
   * Dry-run verify a user-defined process execution queue
   * @param {number[]} queueProcIndices - Array of process indices in user's execution order
   * @param {number[]} available - Current available resources
   * @param {number[][]} maxMatrix - Max claim matrix
   * @param {number[][]} allocMatrix - Allocation matrix
   * @param {boolean[]} finishedProcs - Array of boolean for finished processes
   * @param {string[]} processNames - Array of process names
   * @param {string[]} resourceNames - Array of resource names
   */
  static verifySequence(queueProcIndices, available, maxMatrix, allocMatrix, finishedProcs = [], processNames = [], resourceNames = []) {
    const numR = available.length;
    const work = [...available];
    const numP = maxMatrix.length;
    const pNames = processNames.length === numP ? processNames : Array.from({ length: numP }, (_, i) => `P${i}`);
    const rNames = resourceNames.length === numR ? resourceNames : Array.from({ length: numR }, (_, j) => `R${j}`);

    const tempAlloc = allocMatrix.map(row => [...row]);
    const finish = finishedProcs.length === numP ? [...finishedProcs] : new Array(numP).fill(false);

    // Compute need matrix
    const needMatrix = [];
    for (let i = 0; i < numP; i++) {
      needMatrix[i] = [];
      for (let j = 0; j < numR; j++) {
        needMatrix[i][j] = Math.max(0, maxMatrix[i][j] - tempAlloc[i][j]);
      }
    }

    const steps = [];
    let isValid = true;

    for (let stepIdx = 0; stepIdx < queueProcIndices.length; stepIdx++) {
      const pIdx = queueProcIndices[stepIdx];
      const pName = pNames[pIdx];

      if (finish[pIdx]) {
        steps.push({
          step: stepIdx + 1,
          process: pName,
          pIdx,
          passed: true,
          note: `${pName} is already finished.`
        });
        continue;
      }

      // Check if Need_pIdx <= Work
      let canSatisfy = true;
      const missing = [];
      for (let j = 0; j < numR; j++) {
        if (needMatrix[pIdx][j] > work[j]) {
          canSatisfy = false;
          missing.push(`${rNames[j]}: need ${needMatrix[pIdx][j]}, avail ${work[j]}`);
        }
      }

      if (!canSatisfy) {
        isValid = false;
        steps.push({
          step: stepIdx + 1,
          process: pName,
          pIdx,
          passed: false,
          reason: `Stalled at Step ${stepIdx + 1} (${pName}): Insufficient available resources (${missing.join('; ')})`
        });
        return {
          isValid: false,
          failedStepIndex: stepIdx,
          failedProcess: pName,
          failedPIdx: pIdx,
          reason: `Step ${stepIdx + 1} (${pName}) cannot execute! Need exceeds Available vector.`,
          details: missing.join(', '),
          steps,
          finalWork: work
        };
      } else {
        // Process finishes: Work = Work + Allocation_pIdx
        const prevWork = [...work];
        for (let j = 0; j < numR; j++) {
          work[j] += tempAlloc[pIdx][j];
        }
        finish[pIdx] = true;
        steps.push({
          step: stepIdx + 1,
          process: pName,
          pIdx,
          passed: true,
          prevWork,
          newWork: [...work]
        });
      }
    }

    return {
      isValid: true,
      steps,
      finalWork: work,
      allFinished: finish.every(f => f)
    };
  }

  /**
   * Deadlock Detection algorithm
   * Detects if the current system is in an active deadlock state (circular wait).
   */
  static detectDeadlock(available, allocMatrix, requestMatrix, finishedProcs = [], processNames = []) {
    const numP = allocMatrix.length;
    const numR = available.length;
    const pNames = processNames.length === numP ? processNames : Array.from({ length: numP }, (_, i) => `P${i}`);

    const work = [...available];
    const finish = new Array(numP).fill(false);

    // If a process has 0 allocation and was already marked finished, mark finish = true
    for (let i = 0; i < numP; i++) {
      if (finishedProcs[i]) {
        finish[i] = true;
      } else {
        const hasAlloc = allocMatrix[i].some(a => a > 0);
        if (!hasAlloc) {
          finish[i] = true; // Not holding resources, cannot cause deadlock
        }
      }
    }

    let progress = true;
    while (progress) {
      progress = false;
      for (let i = 0; i < numP; i++) {
        if (!finish[i]) {
          // Check Request_i <= Work
          let canSatisfy = true;
          for (let j = 0; j < numR; j++) {
            if (requestMatrix[i][j] > work[j]) {
              canSatisfy = false;
              break;
            }
          }

          if (canSatisfy) {
            for (let j = 0; j < numR; j++) {
              work[j] += allocMatrix[i][j];
            }
            finish[i] = true;
            progress = true;
            break;
          }
        }
      }
    }

    const deadlockedProcesses = [];
    for (let i = 0; i < numP; i++) {
      if (!finish[i]) {
        deadlockedProcesses.push(pNames[i]);
      }
    }

    return {
      isDeadlocked: deadlockedProcesses.length > 0,
      deadlockedProcesses,
      explanation: deadlockedProcesses.length > 0
        ? `Deadlock detected among processes: ${deadlockedProcesses.join(', ')}. They hold resources while waiting for resources held by each other.`
        : `No deadlock. All processes can successfully complete with available resources.`
    };
  }
}

window.BankerEngine = BankerEngine;

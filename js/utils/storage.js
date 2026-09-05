/**
 * ==========================================================================
 * KERNEL MASTER: Storage & Save System
 * Handles persisting user progress, unlocked campaign stages, high score.
 * ==========================================================================
 */

class StorageManager {
  constructor() {
    this.KEY_PROGRESS = 'km_progress';
    this.KEY_SETTINGS = 'km_settings';
  }

  loadProgress() {
    try {
      const data = localStorage.getItem(this.KEY_PROGRESS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return {
      unlockedStage: 1,
      totalScore: 0,
      completedStages: {}
    };
  }

  saveProgress(progress) {
    try {
      localStorage.setItem(this.KEY_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.warn('LocalStorage write error:', e);
    }
  }

  loadSettings() {
    try {
      const data = localStorage.getItem(this.KEY_SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return {
      soundEnabled: true,
      crtEnabled: true
    };
  }

  saveSettings(settings) {
    try {
      localStorage.setItem(this.KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage write error:', e);
    }
  }
}

window.storageManager = new StorageManager();

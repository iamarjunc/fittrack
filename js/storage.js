/**
 * storage.js — LocalStorage wrapper & data model
 * Global namespace: window.FitStorage
 */
(function() {
  'use strict';

  let dataChangedCallback = null;
  let dbCache = {
    settings: {},
    logs: {}
  };

  const DEFAULT_SETTINGS = {
    theme: 'dark',
    proteinGoal: 160,
    waterGoal: 3,
    openaiKey: '',
    userName: 'Athlete',
    settingsLastModified: '',
  };

  const DEFAULT_DAY = function() {
    return {
      date: '',
      food: [],
      water: 0,
      protein: 0,
      training: [],
      tasks: [],
      notes: '',
      disciplineScore: 0,
      aiSummary: '',
      lastModified: '',
    };
  };

  let isSaving = false;
  let savePending = false;

  function saveToServer() {
    if (isSaving) {
      savePending = true;
      return;
    }
    isSaving = true;

    if (dataChangedCallback) {
      dataChangedCallback('saving');
    }

    fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dbCache)
    })
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to save to server');
      return res.json();
    })
    .then(function() {
      isSaving = false;
      if (savePending) {
        savePending = false;
        saveToServer();
      } else if (dataChangedCallback) {
        dataChangedCallback('synced');
      }
    })
    .catch(function(err) {
      isSaving = false;
      console.error('Failed to sync data to Vercel backend:', err);
      if (dataChangedCallback) {
        dataChangedCallback('error', err.message);
      }
    });
  }

  function loadFromServer() {
    return fetch('/api/data')
      .then(function(res) {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then(function(data) {
        dbCache.settings = data.settings || {};
        dbCache.logs = data.logs || {};
        dbCache.settings = Object.assign({}, DEFAULT_SETTINGS, dbCache.settings);
        return dbCache;
      });
  }

  // Settings
  function getSettings() {
    return Object.assign({}, DEFAULT_SETTINGS, dbCache.settings);
  }

  function saveSettings(settings, preventTimestampUpdate) {
    if (!preventTimestampUpdate) {
      settings.settingsLastModified = new Date().toISOString();
    }
    dbCache.settings = settings;
    saveToServer();
    if (dataChangedCallback) {
      dataChangedCallback('settings');
    }
  }

  function updateSetting(key, value) {
    var s = getSettings();
    s[key] = value;
    saveSettings(s);
  }

  // All Logs
  function getAllLogs() {
    return dbCache.logs || {};
  }

  function saveAllLogs(logs) {
    dbCache.logs = logs;
    saveToServer();
  }

  // Day Log CRUD
  function getDayLog(dateStr) {
    var logs = getAllLogs();
    if (!logs[dateStr]) {
      var day = DEFAULT_DAY();
      day.date = dateStr;
      return day;
    }
    return logs[dateStr];
  }

  function saveDayLog(dateStr, dayData) {
    dayData.lastModified = new Date().toISOString();
    dbCache.logs[dateStr] = dayData;
    saveToServer();
    if (dataChangedCallback) {
      dataChangedCallback('log', dateStr);
    }
  }

  function resetDayLog(dateStr) {
    var day = DEFAULT_DAY();
    day.date = dateStr;
    day.lastModified = new Date().toISOString();
    dbCache.logs[dateStr] = day;
    saveToServer();
    if (dataChangedCallback) {
      dataChangedCallback('log', dateStr);
    }
  }

  // Food Entries
  function addFoodEntry(dateStr, entry) {
    var day = getDayLog(dateStr);
    entry.id = generateId();
    entry.time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    day.food.push(entry);
    day.protein = day.food.reduce(function(sum, f) { return sum + (Number(f.protein) || 0); }, 0);
    saveDayLog(dateStr, day);
    return day;
  }

  function deleteFoodEntry(dateStr, id) {
    var day = getDayLog(dateStr);
    day.food = day.food.filter(function(f) { return f.id !== id; });
    day.protein = day.food.reduce(function(sum, f) { return sum + (Number(f.protein) || 0); }, 0);
    saveDayLog(dateStr, day);
    return day;
  }

  // Water
  function setWater(dateStr, bottles) {
    var day = getDayLog(dateStr);
    day.water = Math.max(0, bottles);
    saveDayLog(dateStr, day);
    return day;
  }

  // Training
  function addTrainingSession(dateStr, session) {
    var day = getDayLog(dateStr);
    session.id = generateId();
    session.time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    day.training.push(session);
    saveDayLog(dateStr, day);
    return day;
  }

  function deleteTrainingSession(dateStr, id) {
    var day = getDayLog(dateStr);
    day.training = day.training.filter(function(t) { return t.id !== id; });
    saveDayLog(dateStr, day);
    return day;
  }

  // Tasks
  function addTask(dateStr, task) {
    var day = getDayLog(dateStr);
    task.id = generateId();
    task.completed = false;
    day.tasks.push(task);
    saveDayLog(dateStr, day);
    return day;
  }

  function toggleTask(dateStr, id) {
    var day = getDayLog(dateStr);
    var task = day.tasks.find(function(t) { return t.id === id; });
    if (task) task.completed = !task.completed;
    saveDayLog(dateStr, day);
    return day;
  }

  function deleteTask(dateStr, id) {
    var day = getDayLog(dateStr);
    day.tasks = day.tasks.filter(function(t) { return t.id !== id; });
    saveDayLog(dateStr, day);
    return day;
  }

  // AI Summary
  function saveAISummary(dateStr, summary) {
    var day = getDayLog(dateStr);
    day.aiSummary = summary;
    saveDayLog(dateStr, day);
  }

  // Discipline Score
  function computeDisciplineScore(day, settings) {
    var score = 0;
    if (settings.proteinGoal > 0) {
      var proteinRatio = Math.min(day.protein / settings.proteinGoal, 1);
      score += Math.round(proteinRatio * 30);
    }
    if (settings.waterGoal > 0) {
      var waterRatio = Math.min(day.water / settings.waterGoal, 1);
      score += Math.round(waterRatio * 20);
    }
    if (day.training.length > 0) {
      var intensityMap = { low: 0.5, medium: 0.75, high: 1 };
      var bestSession = day.training.reduce(function(best, t) {
        return (intensityMap[t.intensity] || 0) > (intensityMap[best.intensity] || 0) ? t : best;
      });
      var intensityScore = (intensityMap[bestSession.intensity] || 0) * 20;
      var durationScore = Math.min(bestSession.duration / 60, 1) * 10;
      score += Math.round(intensityScore + durationScore);
    }
    if (day.tasks.length > 0) {
      var completionRatio = day.tasks.filter(function(t) { return t.completed; }).length / day.tasks.length;
      score += Math.round(completionRatio * 20);
    } else {
      score += 10;
    }
    return Math.min(score, 100);
  }

  // Export / Import
  function exportData() {
    var allLogs = getAllLogs();
    var settings = getSettings();
    var exportPayload = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      settings: settings,
      logs: allLogs,
    };
    var blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'fitness-tracker-backup-' + formatDate(new Date()) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(jsonStr) {
    var data = JSON.parse(jsonStr);
    if (data.logs) saveAllLogs(data.logs);
    if (data.settings) saveSettings(Object.assign(getSettings(), data.settings));
    return data;
  }

  // Utilities
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function formatDate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function parseDateStr(str) {
    var parts = str.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function getWeekDates(refDate) {
    var dates = [];
    var d = new Date(refDate);
    var day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    for (var i = 0; i < 7; i++) {
      dates.push(formatDate(new Date(d)));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }

  function friendlyDate(dateStr) {
    var today = formatDate(new Date());
    var yesterday = formatDate(new Date(Date.now() - 86400000));
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    var d = parseDateStr(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function onDataChanged(cb) {
    dataChangedCallback = cb;
  }

  // Expose globally
  window.FitStorage = {
    getSettings: getSettings,
    saveSettings: saveSettings,
    updateSetting: updateSetting,
    getAllLogs: getAllLogs,
    saveAllLogs: saveAllLogs,
    getDayLog: getDayLog,
    saveDayLog: saveDayLog,
    resetDayLog: resetDayLog,
    addFoodEntry: addFoodEntry,
    deleteFoodEntry: deleteFoodEntry,
    setWater: setWater,
    addTrainingSession: addTrainingSession,
    deleteTrainingSession: deleteTrainingSession,
    addTask: addTask,
    toggleTask: toggleTask,
    deleteTask: deleteTask,
    saveAISummary: saveAISummary,
    computeDisciplineScore: computeDisciplineScore,
    exportData: exportData,
    importData: importData,
    generateId: generateId,
    formatDate: formatDate,
    parseDateStr: parseDateStr,
    getWeekDates: getWeekDates,
    friendlyDate: friendlyDate,
    onDataChanged: onDataChanged,
    loadFromServer: loadFromServer,
  };

})();

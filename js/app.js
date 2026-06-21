/**
 * app.js — Main application
 * Depends on: FitStorage (storage.js), WeeklyChart (charts.js), generateAISummary (openai.js)
 */
(function() {
  'use strict';

  // =====================================================
  // STATE
  // =====================================================
  var S = window.FitStorage;
  var state = {
    currentDate: S.formatDate(new Date()),
    settings: S.getSettings(),
    dayLog: null,
    weeklyChart: null,
  };

  // =====================================================
  // INIT
  // =====================================================
  document.addEventListener('DOMContentLoaded', function() {
    // Register data changed callback first for status updates
    S.onDataChanged(function(event, details) {
      var statusText = document.getElementById('vercel-sync-text');
      var statusDot = document.getElementById('vercel-sync-dot');
      if (!statusText || !statusDot) return;
      
      if (event === 'saving') {
        statusDot.style.background = '#f59e0b'; // Amber
        statusText.textContent = 'Saving to Vercel...';
      } else if (event === 'synced') {
        statusDot.style.background = '#10b981'; // Green
        var time = new Date().toLocaleTimeString();
        statusText.textContent = 'Synced at ' + time;
      } else if (event === 'error') {
        statusDot.style.background = '#ef4444'; // Red
        statusText.textContent = 'Sync error: ' + details;
      }
    });

    // Asynchronously load initial data from Vercel backend
    S.loadFromServer()
      .then(function() {
        state.settings = S.getSettings();
        applyTheme(state.settings.theme);
        loadDayLog();
        setupNavigation();
        setupDateNavigator();
        setupThemeToggle();
        setupSidebar();
        setupFoodForm();
        setupWaterControls();
        setupTrainingForm();
        setupTaskForm();
        setupSettingsPage();
        setupAIPage();
        setupModals();
        setupHeaderActions();
        updateSidebarDate();
        updateDateDisplay();

        navigateTo('dashboard');
        
        // Success initial sync status
        var statusText = document.getElementById('vercel-sync-text');
        var statusDot = document.getElementById('vercel-sync-dot');
        if (statusText && statusDot) {
          statusDot.style.background = '#10b981';
          statusText.textContent = 'Synced with backend';
        }
      })
      .catch(function(err) {
        console.error('Failed to load initial data:', err);
        showToast('❌ Backend offline. Using default settings.', 'error');
        
        // Fallback loading
        state.settings = S.getSettings();
        applyTheme(state.settings.theme);
        loadDayLog();
        setupNavigation();
        setupDateNavigator();
        setupThemeToggle();
        setupSidebar();
        setupFoodForm();
        setupWaterControls();
        setupTrainingForm();
        setupTaskForm();
        setupSettingsPage();
        setupAIPage();
        setupModals();
        setupHeaderActions();
        updateSidebarDate();
        updateDateDisplay();

        navigateTo('dashboard');
      });

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) autoSave();
    });

    document.addEventListener('keydown', handleKeyboard);
  });

  // =====================================================
  // CORE
  // =====================================================
  function loadDayLog() {
    state.dayLog = S.getDayLog(state.currentDate);
  }

  function autoSave() {
    if (state.dayLog) S.saveDayLog(state.currentDate, state.dayLog);
  }

  function refreshCurrentPage() {
    var active = document.querySelector('.nav-item.active');
    var page = active && active.dataset.page;
    if (page === 'dashboard') { renderDashboard(); renderWeeklyChart(); }
    else if (page === 'food') renderFoodPage();
    else if (page === 'water') renderWaterPage();
    else if (page === 'protein') renderProteinPage();
    else if (page === 'training') renderTrainingPage();
    else if (page === 'tasks') renderTasksPage();
    else if (page === 'ai') renderAIPage();
    else if (page === 'settings') renderSettingsPage();
  }

  // =====================================================
  // NAVIGATION
  // =====================================================
  function navigateTo(page) {
    document.querySelectorAll('.page-content').forEach(function(p) { p.classList.remove('active'); });
    var target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
    var navItem = document.querySelector('.nav-item[data-page="' + page + '"]');
    if (navItem) navItem.classList.add('active');

    var titles = {
      dashboard: { title: 'Dashboard', sub: 'Your daily overview' },
      food: { title: 'Food Log', sub: 'Track your nutrition' },
      water: { title: 'Water Intake', sub: 'Stay hydrated' },
      protein: { title: 'Protein Tracker', sub: 'Hit your goals' },
      training: { title: 'Training Log', sub: 'Log your workouts' },
      tasks: { title: 'Daily Tasks', sub: 'Stay on track' },
      ai: { title: 'AI Coach', sub: 'Personalized insights' },
      settings: { title: 'Settings', sub: 'App configuration' },
    };
    var info = titles[page] || { title: 'FitTrack', sub: '' };
    document.getElementById('page-title').textContent = info.title;
    document.getElementById('page-subtitle').textContent = info.sub;

    if (page === 'dashboard') { renderDashboard(); renderWeeklyChart(); }
    else if (page === 'food') renderFoodPage();
    else if (page === 'water') renderWaterPage();
    else if (page === 'protein') renderProteinPage();
    else if (page === 'training') renderTrainingPage();
    else if (page === 'tasks') renderTasksPage();
    else if (page === 'ai') renderAIPage();
    else if (page === 'settings') renderSettingsPage();

    closeSidebar();
  }

  function setupNavigation() {
    document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
      item.addEventListener('click', function() { navigateTo(item.dataset.page); });
    });
  }

  // =====================================================
  // DATE NAVIGATOR
  // =====================================================
  function setupDateNavigator() {
    document.getElementById('date-prev').addEventListener('click', function() { changeDate(-1); });
    document.getElementById('date-next').addEventListener('click', function() { changeDate(1); });
    document.getElementById('date-display').addEventListener('click', goToToday);
  }

  function changeDate(delta) {
    autoSave();
    var d = S.parseDateStr(state.currentDate);
    d.setDate(d.getDate() + delta);
    var today = new Date(); today.setHours(0,0,0,0);
    if (d > today) { showToast('Cannot navigate to future dates', 'warning'); return; }
    state.currentDate = S.formatDate(d);
    loadDayLog();
    updateDateDisplay();
    updateSidebarDate();
    refreshCurrentPage();
  }

  function goToToday() {
    autoSave();
    state.currentDate = S.formatDate(new Date());
    loadDayLog();
    updateDateDisplay();
    updateSidebarDate();
    refreshCurrentPage();
  }

  function updateDateDisplay() {
    var today = S.formatDate(new Date());
    var display = document.getElementById('date-display');
    if (display) {
      display.textContent = S.friendlyDate(state.currentDate);
      var nextBtn = document.getElementById('date-next');
      if (nextBtn) nextBtn.disabled = state.currentDate === today;
    }
  }

  function updateSidebarDate() {
    var el = document.getElementById('sidebar-date');
    if (el) {
      var d = S.parseDateStr(state.currentDate);
      el.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  }

  // =====================================================
  // THEME
  // =====================================================
  function setupThemeToggle() {
    document.getElementById('theme-toggle').addEventListener('click', function() {
      var next = state.settings.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      state.settings.theme = next;
      S.updateSetting('theme', next);
      setTimeout(function() { renderWeeklyChart(); }, 100);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // =====================================================
  // SIDEBAR
  // =====================================================
  function setupSidebar() {
    var hBtn = document.getElementById('hamburger-btn');
    var overlay = document.getElementById('sidebar-overlay');
    if (hBtn) hBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);
  }

  function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('active');
  }

  function closeSidebar() {
    document.querySelector('.sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
  }

  // =====================================================
  // HEADER ACTIONS
  // =====================================================
  function setupHeaderActions() {
    var resetBtn = document.getElementById('reset-day-btn');
    var confirmBtn = document.getElementById('confirm-reset');
    var cancelBtn = document.getElementById('confirm-cancel');

    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        var confirmDate = document.getElementById('confirm-date');
        if (confirmDate) confirmDate.textContent = S.friendlyDate(state.currentDate);
        openModal('confirm-modal');
      });
    }
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        S.resetDayLog(state.currentDate);
        loadDayLog();
        refreshCurrentPage();
        closeModal('confirm-modal');
        showToast('Day reset successfully', 'success');
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() { closeModal('confirm-modal'); });
    }
  }

  // =====================================================
  // DASHBOARD
  // =====================================================
  function renderDashboard() {
    var day = state.dayLog;
    var s = state.settings;
    var score = S.computeDisciplineScore(day, s);
    day.disciplineScore = score;

    var greetEl = document.getElementById('hero-greeting');
    var nameEl = document.getElementById('hero-name');
    var scoreEl = document.getElementById('hero-score');
    if (greetEl) greetEl.textContent = getGreeting();
    if (nameEl) nameEl.textContent = s.userName || 'Athlete';
    if (scoreEl) scoreEl.textContent = score;

    var proteinPct = s.proteinGoal > 0 ? Math.round((day.protein / s.proteinGoal) * 100) : 0;
    setText('dash-protein', day.protein + 'g');
    setText('dash-protein-pct', proteinPct + '% of ' + s.proteinGoal + 'g goal');

    var waterL = (day.water * 1.8).toFixed(1);
    setText('dash-water', day.water);
    setText('dash-water-sub', waterL + 'L / ' + (s.waterGoal * 1.8).toFixed(1) + 'L goal');

    setText('dash-training', day.training.length);
    var totalMins = day.training.reduce(function(acc, t) { return acc + Number(t.duration || 0); }, 0);
    setText('dash-training-sub', totalMins + ' min total');

    var tasksDone = day.tasks.filter(function(t) { return t.completed; }).length;
    setText('dash-tasks', tasksDone + '/' + day.tasks.length);
    setText('dash-tasks-sub', day.tasks.length > 0
      ? Math.round((tasksDone / day.tasks.length) * 100) + '% completion'
      : 'No tasks yet');

    setProgress('pbar-protein', Math.min(proteinPct, 100));
    setProgress('pbar-water', s.waterGoal > 0 ? Math.min(Math.round((day.water / s.waterGoal) * 100), 100) : 0);

    // Recent food
    var recentFood = day.food.slice(-3).reverse();
    var foodEl = document.getElementById('dash-recent-food');
    if (foodEl) {
      if (recentFood.length === 0) {
        foodEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🍽️</div><div class="empty-title">No food logged</div></div>';
      } else {
        foodEl.innerHTML = recentFood.map(function(f) {
          return '<div class="food-item">' +
            '<div class="food-item-info">' +
            '<div class="food-item-name">' + escHtml(f.name) + '</div>' +
            '<div class="food-item-meta">' + (f.calories || 0) + ' kcal' + (f.time ? ' • ' + f.time : '') + '</div>' +
            '</div><div class="food-item-protein">' + f.protein + 'g</div></div>';
        }).join('');
      }
    }

    // Recent training
    var trainEl = document.getElementById('dash-recent-training');
    if (trainEl) {
      var recentT = day.training.slice(-2).reverse();
      if (recentT.length === 0) {
        trainEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🥊</div><div class="empty-title">No training logged</div></div>';
      } else {
        trainEl.innerHTML = recentT.map(trainingSessionHTML).join('');
      }
    }

    // Tasks
    var taskEl = document.getElementById('dash-tasks-list');
    if (taskEl) {
      if (day.tasks.length === 0) {
        taskEl.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">No tasks today</div></div>';
      } else {
        taskEl.innerHTML = day.tasks.slice(0, 5).map(function(t) { return taskItemHTML(t, false); }).join('');
        taskEl.querySelectorAll('.task-item').forEach(function(el) {
          el.addEventListener('click', function(e) {
            if (e.target.closest && e.target.closest('.task-delete')) return;
            state.dayLog = S.toggleTask(state.currentDate, el.dataset.id);
            renderDashboard();
          });
        });
      }
    }

    updateScoreGauge(score);
  }

  function updateScoreGauge(score) {
    var gauge = document.getElementById('gauge-svg');
    if (!gauge) return;
    var angle = -90 + (score / 100) * 180;
    var needleEl = gauge.querySelector('.gauge-needle');
    if (needleEl) needleEl.style.transform = 'rotate(' + angle + 'deg)';
    setText('gauge-value', score);
  }

  function getGreeting() {
    var h = new Date().getHours();
    if (h < 12) return '🌅 Good morning';
    if (h < 17) return '☀️ Good afternoon';
    return '🌙 Good evening';
  }

  // =====================================================
  // WEEKLY CHART
  // =====================================================
  function renderWeeklyChart() {
    var canvas = document.getElementById('weekly-chart');
    if (!canvas) return;
    if (!state.weeklyChart) state.weeklyChart = new window.WeeklyChart('weekly-chart');

    var weekDates = S.getWeekDates(S.parseDateStr(state.currentDate));
    var allLogs = S.getAllLogs();
    var s = state.settings;
    var todayStr = S.formatDate(new Date());

    var weekData = weekDates.map(function(date) {
      var log = allLogs[date] || S.getDayLog(date);
      var d = S.parseDateStr(date);
      return {
        date: date,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        protein: log.protein || 0,
        water: log.water || 0,
        score: log.disciplineScore || S.computeDisciplineScore(log, s),
        isToday: date === todayStr,
        proteinGoal: s.proteinGoal,
        waterGoal: s.waterGoal,
      };
    });

    state.weeklyChart.draw(weekData);
  }

  // =====================================================
  // FOOD PAGE — with Autocomplete + AI Lookup
  // =====================================================
  var _acDebounce = null;
  var _acHighlightIdx = -1;

  function setupFoodForm() {
    var form = document.getElementById('food-form');
    if (!form) return;

    var nameInput = document.getElementById('food-name');
    var dropdown = document.getElementById('food-autocomplete');
    var statusEl = document.getElementById('nutrition-status');
    var aiBtn = document.getElementById('ai-lookup-btn');

    // ---- Autocomplete on input ----
    if (nameInput) {
      nameInput.addEventListener('input', function() {
        clearTimeout(_acDebounce);
        var q = nameInput.value.trim();
        if (q.length < 2) { hideDropdown(); return; }
        _acDebounce = setTimeout(function() { showSuggestions(q); }, 250);
      });

      nameInput.addEventListener('keydown', function(e) {
        var items = dropdown ? dropdown.querySelectorAll('.autocomplete-item') : [];
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          _acHighlightIdx = Math.min(_acHighlightIdx + 1, items.length - 1);
          updateHighlight(items);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          _acHighlightIdx = Math.max(_acHighlightIdx - 1, 0);
          updateHighlight(items);
        } else if (e.key === 'Enter' && _acHighlightIdx >= 0 && items[_acHighlightIdx]) {
          e.preventDefault();
          items[_acHighlightIdx].click();
        } else if (e.key === 'Escape') {
          hideDropdown();
        }
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', function(e) {
        if (!e.target.closest('#food-name') && !e.target.closest('#food-autocomplete')) {
          hideDropdown();
        }
      });
    }

    // ---- AI Lookup Button ----
    if (aiBtn) {
      aiBtn.addEventListener('click', function() {
        var q = nameInput ? nameInput.value.trim() : '';
        if (!q) { showToast('Please type a food name first', 'warning'); return; }
        if (!state.settings.openaiKey) {
          showToast('⚠️ Add your OpenAI API key in Settings to use AI lookup', 'warning');
          return;
        }
        aiLookupNutrition(q);
      });
    }

    // ---- Form Submit ----
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var entry = {
        name: document.getElementById('food-name').value.trim(),
        calories: Number(document.getElementById('food-calories').value) || 0,
        protein: Number(document.getElementById('food-protein').value) || 0,
        carbs: Number(document.getElementById('food-carbs').value) || 0,
        fat: Number(document.getElementById('food-fat').value) || 0,
      };
      if (!entry.name) { showToast('Please enter food name', 'error'); return; }
      state.dayLog = S.addFoodEntry(state.currentDate, entry);
      // Reset form and status
      form.reset();
      hideNutritionStatus();
      hideDropdown();
      renderFoodPage();
      renderDashboard();
      showToast('✅ ' + entry.name + ' added', 'success');
    });

    // ---- Quick-add preset buttons ----
    document.querySelectorAll('.quick-food-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var data = JSON.parse(btn.dataset.food);
        fillFoodForm(data.name, data.protein, data.calories, data.carbs, data.fat, 'quick');
      });
    });
  }

  // Show autocomplete suggestions dropdown
  function showSuggestions(query) {
    var dropdown = document.getElementById('food-autocomplete');
    if (!dropdown || !window.NutritionDB) return;
    var results = window.NutritionDB.search(query, 8);
    _acHighlightIdx = -1;

    if (results.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    dropdown.innerHTML =
      '<div class="autocomplete-header">🔍 Matches from database</div>' +
      results.map(function(item, idx) {
        return '<div class="autocomplete-item" data-idx="' + idx + '">' +
          '<div class="autocomplete-emoji">' + (item.emoji || '🍽️') + '</div>' +
          '<div class="autocomplete-info">' +
            '<div class="autocomplete-name">' + escHtml(item.name) + '</div>' +
            '<div class="autocomplete-serving">' + (item.serving || '') + '</div>' +
          '</div>' +
          '<div class="autocomplete-macros">' +
            '<span class="macro-chip protein">P: ' + item.protein + 'g</span>' +
            '<span class="macro-chip cal">' + item.calories + ' kcal</span>' +
          '</div>' +
        '</div>';
      }).join('');

    dropdown.style.display = 'block';

    // Bind click on each suggestion
    dropdown.querySelectorAll('.autocomplete-item').forEach(function(el, idx) {
      el.addEventListener('mousedown', function(e) {
        e.preventDefault(); // Prevent input blur
        var item = results[idx];
        fillFoodForm(item.name, item.protein, item.calories, item.carbs, item.fat, 'db');
        hideDropdown();
      });
    });
  }

  function updateHighlight(items) {
    items.forEach(function(el, i) {
      el.classList.toggle('highlighted', i === _acHighlightIdx);
    });
  }

  function hideDropdown() {
    var dropdown = document.getElementById('food-autocomplete');
    if (dropdown) dropdown.style.display = 'none';
    _acHighlightIdx = -1;
  }

  // Auto-fill form fields with nutrition data
  function fillFoodForm(name, protein, calories, carbs, fat, source) {
    var fields = ['food-name', 'food-protein', 'food-calories', 'food-carbs', 'food-fat'];
    var values = [name, protein || '', calories || '', carbs || '', fat || ''];

    fields.forEach(function(id, i) {
      var el = document.getElementById(id);
      if (el) {
        el.value = values[i];
        // Flash animation
        el.classList.remove('autofilled');
        void el.offsetWidth; // force reflow
        el.classList.add('autofilled');
      }
    });

    // Show status
    if (source === 'db') {
      showNutritionStatus('✅ Nutrition auto-filled from database', 'found');
    } else if (source === 'ai') {
      showNutritionStatus('🤖 Nutrition estimated by AI — verify if needed', 'ai');
    } else if (source === 'quick') {
      showNutritionStatus('⚡ Quick preset loaded', 'found');
    }
  }

  function showNutritionStatus(msg, type) {
    var el = document.getElementById('nutrition-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'nutrition-status-' + type;
    el.style.display = 'block';
  }

  function hideNutritionStatus() {
    var el = document.getElementById('nutrition-status');
    if (el) el.style.display = 'none';
  }

  // AI nutrition lookup via OpenAI
  function aiLookupNutrition(foodName) {
    var aiBtn = document.getElementById('ai-lookup-btn');
    if (aiBtn) { aiBtn.disabled = true; aiBtn.textContent = '⏳ Asking AI...'; }
    showNutritionStatus('🤖 Asking AI for nutrition info...', 'loading');

    var prompt = 'Give me the approximate nutritional values for: "' + foodName + '"\n' +
      'Return ONLY a valid JSON object with these exact keys (numbers only, no units):\n' +
      '{"protein": 0, "calories": 0, "carbs": 0, "fat": 0}\n' +
      'Base values on a typical Indian serving size. No explanation, just the JSON.';

    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + state.settings.openaiKey,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 100,
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'You are a nutrition database. Return only valid JSON with nutritional data.' },
          { role: 'user', content: prompt }
        ],
      }),
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!content) throw new Error('No response');
      // Extract JSON from response
      var match = content.match(/\{[\s\S]*?\}/);
      if (!match) throw new Error('No JSON found');
      var nutrition = JSON.parse(match[0]);
      fillFoodForm(
        foodName,
        Math.round(nutrition.protein || 0),
        Math.round(nutrition.calories || 0),
        Math.round(nutrition.carbs || 0),
        Math.round(nutrition.fat || 0),
        'ai'
      );
      showToast('🤖 AI filled nutrition for: ' + foodName, 'success');
    })
    .catch(function(err) {
      showNutritionStatus('⚠️ AI lookup failed — enter values manually', 'manual');
      showToast('AI lookup failed: ' + err.message, 'error');
    })
    .then(function() {
      if (aiBtn) { aiBtn.disabled = false; aiBtn.textContent = '🤖 Ask AI'; }
    });
  }


  function renderFoodPage() {
    var day = state.dayLog;
    var s = state.settings;
    var totalProtein = day.food.reduce(function(a, f) { return a + (Number(f.protein) || 0); }, 0);
    var totalCalories = day.food.reduce(function(a, f) { return a + (Number(f.calories) || 0); }, 0);
    var totalCarbs = day.food.reduce(function(a, f) { return a + (Number(f.carbs) || 0); }, 0);
    var totalFat = day.food.reduce(function(a, f) { return a + (Number(f.fat) || 0); }, 0);

    setText('food-total-protein', totalProtein + 'g');
    setText('food-total-calories', totalCalories + ' kcal');
    setText('food-total-carbs', totalCarbs + 'g');
    setText('food-total-fat', totalFat + 'g');

    var proteinPct = s.proteinGoal > 0 ? Math.min(Math.round((totalProtein / s.proteinGoal) * 100), 100) : 0;
    setProgress('food-protein-bar', proteinPct);
    setText('food-protein-pct', proteinPct + '%');

    var listEl = document.getElementById('food-list');
    if (!listEl) return;
    if (day.food.length === 0) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🍽️</div><div class="empty-title">No food logged yet</div><div class="empty-text">Add your first meal above</div></div>';
      return;
    }
    listEl.innerHTML = day.food.slice().reverse().map(function(f) {
      return '<div class="food-item">' +
        '<div style="font-size:22px;flex-shrink:0">' + getFoodEmoji(f.name) + '</div>' +
        '<div class="food-item-info">' +
        '<div class="food-item-name">' + escHtml(f.name) + '</div>' +
        '<div class="food-item-meta">' +
        (f.calories ? f.calories + ' kcal' : '') +
        (f.carbs ? ' • C: ' + f.carbs + 'g' : '') +
        (f.fat ? ' • F: ' + f.fat + 'g' : '') +
        (f.time ? ' • ' + f.time : '') +
        '</div></div>' +
        '<div class="food-item-protein">' + f.protein + 'g</div>' +
        '<button class="food-item-delete" data-id="' + f.id + '" title="Delete">✕</button>' +
        '</div>';
    }).join('');

    listEl.querySelectorAll('.food-item-delete').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        state.dayLog = S.deleteFoodEntry(state.currentDate, btn.dataset.id);
        renderFoodPage();
        renderDashboard();
        showToast('Food entry removed', 'info');
      });
    });
  }

  // =====================================================
  // WATER PAGE
  // =====================================================
  function setupWaterControls() {
    var addBtn = document.getElementById('water-add');
    var removeBtn = document.getElementById('water-remove');
    if (addBtn) addBtn.addEventListener('click', function() {
      state.dayLog = S.setWater(state.currentDate, state.dayLog.water + 1);
      renderWaterPage();
      renderDashboard();
      showToast('💧 +1 bottle logged!', 'success');
    });
    if (removeBtn) removeBtn.addEventListener('click', function() {
      if (state.dayLog.water <= 0) return;
      state.dayLog = S.setWater(state.currentDate, state.dayLog.water - 1);
      renderWaterPage();
      renderDashboard();
    });
  }

  function renderWaterPage() {
    var day = state.dayLog;
    var s = state.settings;
    var bottles = day.water;
    var goal = s.waterGoal;
    var liters = (bottles * 1.8).toFixed(1);
    var goalLiters = (goal * 1.8).toFixed(1);
    var pct = goal > 0 ? Math.min(Math.round((bottles / goal) * 100), 100) : 0;

    setText('water-bottles-count', bottles);
    setText('water-liters', liters + 'L');
    setText('water-goal-text', 'Goal: ' + goal + ' bottles (' + goalLiters + 'L)');
    setText('water-pct', pct + '%');
    setProgress('water-progress-bar', pct);

    // Detail panel
    setText('water-liters-detail', liters + 'L');
    setText('water-goal-bottles', goal + ' bottles');
    var rem = Math.max(goal - bottles, 0);
    var remEl = document.getElementById('water-remaining');
    if (remEl) {
      remEl.textContent = rem > 0 ? rem + ' more bottle' + (rem !== 1 ? 's' : '') : '✅ Goal met!';
      remEl.style.color = rem === 0 ? 'var(--accent-green)' : 'var(--text-primary)';
    }

    // Bottle grid
    var container = document.getElementById('water-bottle-grid');
    if (!container) return;
    var displayGoal = Math.max(goal, bottles, 1);
    container.innerHTML = '';
    for (var i = 0; i < displayGoal; i++) {
      (function(idx) {
        var filled = idx < bottles;
        var btn = document.createElement('div');
        btn.className = 'water-bottle';
        btn.title = filled ? 'Bottle ' + (idx+1) + ' ✓' : 'Tap to log bottle ' + (idx+1);
        btn.innerHTML = createBottleSVG(filled, idx + 1);
        btn.addEventListener('click', function() {
          if (filled && idx === bottles - 1) {
            state.dayLog = S.setWater(state.currentDate, idx);
          } else if (!filled) {
            state.dayLog = S.setWater(state.currentDate, idx + 1);
          }
          renderWaterPage();
          renderDashboard();
        });
        container.appendChild(btn);
      })(i);
    }

    var tipEl = document.getElementById('water-tip');
    if (tipEl) tipEl.textContent = getHydrationTip(pct);
  }

  function createBottleSVG(filled, num) {
    var strokeColor = filled ? '#4c9bff' : '#2a3550';
    var fillColor = filled ? '#4c9bff' : 'transparent';
    var textColor = filled ? 'white' : '#4a5a80';
    var fillH = filled ? 33.8 : 0; // 52 * 0.65
    var fillY = filled ? 29.2 : 64; // 12 + 52 * 0.35

    return '<svg viewBox="0 0 40 70" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="13" y="2" width="14" height="7" rx="2" fill="' + strokeColor + '" opacity="0.7"/>' +
      '<rect x="14" y="8" width="12" height="5" fill="' + strokeColor + '" opacity="0.4"/>' +
      '<rect x="5" y="12" width="30" height="52" rx="6" fill="' + (filled ? 'rgba(76,155,255,0.1)' : 'transparent') + '" stroke="' + strokeColor + '" stroke-width="2"/>' +
      '<clipPath id="bc' + num + '"><rect x="5" y="12" width="30" height="52" rx="6"/></clipPath>' +
      '<rect x="5" y="' + fillY + '" width="30" height="' + fillH + '" fill="' + fillColor + '" opacity="0.85" clip-path="url(#bc' + num + ')"/>' +
      (filled ? '<line x1="10" y1="41" x2="30" y2="41" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>' : '') +
      '<text x="20" y="' + (filled ? 50 : 48) + '" text-anchor="middle" font-size="10" font-weight="700" fill="' + textColor + '" font-family="Inter,sans-serif">' + num + '</text>' +
      '</svg>';
  }

  function getHydrationTip(pct) {
    if (pct >= 100) return '🎉 Excellent! You\'ve hit your hydration goal today!';
    if (pct >= 75) return '💪 Almost there! Just a bit more water to reach your goal.';
    if (pct >= 50) return '👍 Halfway there! Keep drinking to stay hydrated.';
    if (pct >= 25) return '💧 Good start! Spread your water intake through the day.';
    return '⚠️ Low hydration! Drink water regularly to boost performance.';
  }

  // =====================================================
  // PROTEIN PAGE
  // =====================================================
  function renderProteinPage() {
    var day = state.dayLog;
    var s = state.settings;
    var protein = day.protein || 0;
    var goal = s.proteinGoal || 160;
    var remaining = Math.max(goal - protein, 0);
    var pct = goal > 0 ? Math.min(Math.round((protein / goal) * 100), 100) : 0;

    updateProteinRing(pct);
    setText('protein-current', protein + 'g');
    setText('protein-goal-display', goal + 'g');
    setText('protein-remaining', remaining + 'g');
    setText('protein-pct-display', pct + '%');

    var goalInput = document.getElementById('protein-goal-input');
    if (goalInput) {
      goalInput.value = goal;
      if (!goalInput._hasListener) {
        goalInput._hasListener = true;
        goalInput.addEventListener('change', function() {
          var val = Number(goalInput.value);
          if (val > 0 && val <= 500) {
            state.settings.proteinGoal = val;
            S.updateSetting('proteinGoal', val);
            renderProteinPage();
            showToast('Protein goal set to ' + val + 'g', 'success');
          }
        });
      }
    }

    var sourceEl = document.getElementById('protein-sources');
    if (!sourceEl) return;
    if (day.food.length === 0) {
      sourceEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🥩</div><div class="empty-title">No food logged</div></div>';
      return;
    }
    var withProtein = day.food.filter(function(f) { return f.protein > 0; });
    if (withProtein.length === 0) {
      sourceEl.innerHTML = '<div class="empty-state"><div class="empty-text">No protein sources found</div></div>';
      return;
    }
    sourceEl.innerHTML = withProtein.map(function(f) {
      var p = goal > 0 ? Math.round((f.protein / goal) * 100) : 0;
      return '<div style="margin-bottom:12px">' +
        '<div class="flex-between mb-8">' +
        '<span style="font-size:14px;font-weight:600;color:var(--text-primary)">' + escHtml(f.name) + '</span>' +
        '<span style="font-weight:700;color:var(--accent-green)">' + f.protein + 'g <span style="color:var(--text-muted);font-weight:400;font-size:12px">(' + p + '%)</span></span>' +
        '</div>' +
        '<div class="progress-bar"><div class="progress-fill green" style="width:' + Math.min(p * 2, 100) + '%"></div></div>' +
        '</div>';
    }).join('');
  }

  function updateProteinRing(pct) {
    var circle = document.getElementById('protein-ring-fill');
    if (!circle) return;
    var r = 50;
    var circumference = 2 * Math.PI * r;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference - (pct / 100) * circumference;
    setText('protein-ring-pct', pct + '%');
  }

  // =====================================================
  // TRAINING PAGE
  // =====================================================
  function setupTrainingForm() {
    document.querySelectorAll('.intensity-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        document.querySelectorAll('.intensity-option').forEach(function(o) {
          o.classList.remove('selected-low', 'selected-medium', 'selected-high');
        });
        opt.classList.add('selected-' + opt.dataset.value);
        var intEl = document.getElementById('training-intensity');
        if (intEl) intEl.value = opt.dataset.value;
      });
    });

    var form = document.getElementById('training-form');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var type = document.getElementById('training-type').value;
      var intensity = document.getElementById('training-intensity').value;
      var duration = Number(document.getElementById('training-duration').value);
      var notes = document.getElementById('training-notes').value.trim();

      if (!type) { showToast('Please select training type', 'error'); return; }
      if (!intensity) { showToast('Please select intensity', 'error'); return; }
      if (!duration || duration <= 0) { showToast('Please enter duration', 'error'); return; }

      state.dayLog = S.addTrainingSession(state.currentDate, { type: type, intensity: intensity, duration: duration, notes: notes });
      form.reset();
      document.querySelectorAll('.intensity-option').forEach(function(o) {
        o.classList.remove('selected-low', 'selected-medium', 'selected-high');
      });
      var intEl = document.getElementById('training-intensity');
      if (intEl) intEl.value = '';
      renderTrainingPage();
      renderDashboard();
      showToast('💪 ' + type + ' session logged!', 'success');
    });
  }

  function renderTrainingPage() {
    var day = state.dayLog;
    var sessions = day.training;
    var totalMins = sessions.reduce(function(a, t) { return a + Number(t.duration || 0); }, 0);
    setText('training-count', sessions.length);
    setText('training-total-mins', totalMins);
    setText('training-hours', (totalMins / 60).toFixed(1));
    setText('training-intensity-score', computeIntensityScore(sessions) + '%');

    var listEl = document.getElementById('training-list');
    if (!listEl) return;
    if (sessions.length === 0) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🥊</div><div class="empty-title">No sessions logged</div><div class="empty-text">Log your workout using the form</div></div>';
      return;
    }
    listEl.innerHTML = sessions.slice().reverse().map(function(t) {
      return '<div class="training-session ' + t.intensity + '">' +
        '<div class="training-header">' +
        '<div class="training-type">' + getTrainingEmoji(t.type) + ' ' + t.type + '</div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
        '<span class="intensity-badge ' + t.intensity + '">' + t.intensity + '</span>' +
        '<button class="food-item-delete" data-id="' + t.id + '" title="Delete" style="font-size:14px">✕</button>' +
        '</div></div>' +
        '<div class="training-meta"><span>⏱️ ' + t.duration + ' minutes</span>' + (t.time ? '<span>🕐 ' + t.time + '</span>' : '') + '</div>' +
        (t.notes ? '<div class="training-notes">"' + escHtml(t.notes) + '"</div>' : '') +
        '</div>';
    }).join('');

    listEl.querySelectorAll('.food-item-delete').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        state.dayLog = S.deleteTrainingSession(state.currentDate, btn.dataset.id);
        renderTrainingPage();
        renderDashboard();
        showToast('Training session removed', 'info');
      });
    });
  }

  function computeIntensityScore(sessions) {
    if (sessions.length === 0) return 0;
    var map = { low: 40, medium: 70, high: 100 };
    var avg = sessions.reduce(function(sum, t) { return sum + (map[t.intensity] || 0); }, 0) / sessions.length;
    return Math.round(avg);
  }

  // =====================================================
  // TASKS PAGE
  // =====================================================
  function setupTaskForm() {
    var form = document.getElementById('task-form');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var text = document.getElementById('task-input').value.trim();
      var category = document.getElementById('task-category').value;
      if (!text) { showToast('Please enter a task', 'error'); return; }
      state.dayLog = S.addTask(state.currentDate, { text: text, category: category });
      document.getElementById('task-input').value = '';
      renderTasksPage();
      renderDashboard();
      showToast('✅ Task added', 'success');
    });

    document.querySelectorAll('.quick-task-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var inp = document.getElementById('task-input');
        if (inp) { inp.value = btn.dataset.task; inp.focus(); }
      });
    });
  }

  function renderTasksPage() {
    var day = state.dayLog;
    var tasks = day.tasks;
    var done = tasks.filter(function(t) { return t.completed; }).length;
    var pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

    setText('tasks-count', done + '/' + tasks.length);
    setText('tasks-pct', pct + '%');
    setProgress('tasks-progress-bar', pct);

    var listEl = document.getElementById('tasks-list');
    if (!listEl) return;
    if (tasks.length === 0) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No tasks for today</div></div>';
      return;
    }
    var sorted = tasks.filter(function(t) { return !t.completed; }).concat(tasks.filter(function(t) { return t.completed; }));
    listEl.innerHTML = sorted.map(function(t) { return taskItemHTML(t, true); }).join('');

    listEl.querySelectorAll('.task-item').forEach(function(el) {
      el.addEventListener('click', function(e) {
        if (e.target.closest && e.target.closest('.task-delete')) return;
        state.dayLog = S.toggleTask(state.currentDate, el.dataset.id);
        renderTasksPage();
        renderDashboard();
      });
    });
    listEl.querySelectorAll('.task-delete').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        state.dayLog = S.deleteTask(state.currentDate, btn.dataset.id);
        renderTasksPage();
        renderDashboard();
        showToast('Task removed', 'info');
      });
    });
  }

  // =====================================================
  // AI PAGE
  // =====================================================
  function setupAIPage() {
    var btn = document.getElementById('ai-generate-btn');
    if (btn) btn.addEventListener('click', generateSummary);
  }

  function renderAIPage() {
    var day = state.dayLog;
    var s = state.settings;
    var el = document.getElementById('ai-summary-display');
    if (el) {
      if (day.aiSummary) {
        el.innerHTML = '<div class="ai-response">' + escHtml(day.aiSummary) + '</div>';
      } else {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">🤖</div><div class="empty-title">No AI summary yet</div><div class="empty-text">Click "Generate Summary" to get your daily analysis</div></div>';
      }
    }

    // Snapshot
    var snapshot = document.getElementById('ai-snapshot');
    if (!snapshot) return;
    var proteinPct = s.proteinGoal > 0 ? Math.round((day.protein / s.proteinGoal) * 100) : 0;
    var waterPct = s.waterGoal > 0 ? Math.round((day.water / s.waterGoal) * 100) : 0;
    var tasksDone = day.tasks.filter(function(t) { return t.completed; }).length;
    var score = S.computeDisciplineScore(day, s);
    var rows = [
      { label: '💪 Protein', value: day.protein + 'g / ' + s.proteinGoal + 'g', pct: proteinPct, color: 'orange' },
      { label: '💧 Water', value: day.water + ' bottles (' + (day.water*1.8).toFixed(1) + 'L)', pct: waterPct, color: 'blue' },
      { label: '🥊 Training', value: day.training.length + ' session' + (day.training.length !== 1 ? 's' : ''), pct: Math.min(day.training.length * 50, 100), color: 'green' },
      { label: '✅ Tasks', value: tasksDone + '/' + day.tasks.length + ' done', pct: day.tasks.length > 0 ? Math.round((tasksDone/day.tasks.length)*100) : 0, color: 'purple' },
      { label: '🎯 Score', value: score + '/100', pct: score, color: 'yellow' },
    ];
    snapshot.innerHTML = rows.map(function(r) {
      return '<div><div class="flex-between mb-8"><span style="font-size:13px;color:var(--text-secondary)">' + r.label + '</span><span style="font-size:13px;font-weight:700;color:var(--text-primary)">' + r.value + '</span></div><div class="progress-bar"><div class="progress-fill ' + r.color + '" style="width:' + Math.min(r.pct,100) + '%"></div></div></div>';
    }).join('');
  }

  function generateSummary() {
    var btn = document.getElementById('ai-generate-btn');
    var el = document.getElementById('ai-summary-display');
    if (!state.settings.openaiKey) {
      showToast('⚠️ Please add your OpenAI API key in Settings first', 'warning');
      navigateTo('settings');
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Generating...';
    el.innerHTML = '<div class="ai-loading">Analyzing your day <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>';

    window.generateAISummary(state.dayLog, state.settings)
      .then(function(summary) {
        S.saveAISummary(state.currentDate, summary);
        state.dayLog = S.getDayLog(state.currentDate);
        el.innerHTML = '<div class="ai-response">' + escHtml(summary) + '</div>';
        showToast('✨ AI summary generated!', 'success');
      })
      .catch(function(err) {
        el.innerHTML = '<div class="ai-response" style="border-color:var(--accent-red);background:var(--accent-red-dim)">❌ Error: ' + escHtml(err.message) + '</div>';
        showToast('AI generation failed', 'error');
      })
      .finally(function() {
        btn.disabled = false;
        btn.textContent = '✨ Generate Summary';
      });
  }

  // =====================================================
  // SETTINGS PAGE
  // =====================================================
  function setupSettingsPage() {
    var exportBtn = document.getElementById('export-btn');
    var importBtn = document.getElementById('import-btn');
    var fileImport = document.getElementById('file-import');

    if (exportBtn) exportBtn.addEventListener('click', function() {
      S.exportData();
      showToast('📦 Data exported!', 'success');
    });
    if (importBtn) importBtn.addEventListener('click', function() {
      if (fileImport) fileImport.click();
    });
    if (fileImport) fileImport.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        try {
          S.importData(ev.target.result);
          state.settings = S.getSettings();
          loadDayLog();
          renderSettingsPage();
          applyTheme(state.settings.theme);
          showToast('✅ Data imported!', 'success');
          refreshCurrentPage();
        } catch(err) {
          showToast('❌ Import failed: Invalid file', 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  function renderSettingsPage() {
    var s = state.settings;

    bindSettingInput('settings-username', s.userName, function(v) { s.userName = v; S.saveSettings(s); state.settings = s; });
    bindSettingInput('settings-protein-goal', s.proteinGoal, function(v) {
      var val = Number(v);
      if (val > 0) { s.proteinGoal = val; S.saveSettings(s); state.settings = s; }
    });
    bindSettingInput('settings-water-goal', s.waterGoal, function(v) {
      var val = Number(v);
      if (val > 0) { s.waterGoal = val; S.saveSettings(s); state.settings = s; }
    });

    var apiEl = document.getElementById('settings-api-key');
    if (apiEl) {
      apiEl.value = s.openaiKey || '';
      apiEl.placeholder = s.openaiKey ? '••••••••••••' : 'sk-...';
    }

    var saveApiBtn = document.getElementById('save-api-key');
    if (saveApiBtn && !saveApiBtn._hasListener) {
      saveApiBtn._hasListener = true;
      saveApiBtn.addEventListener('click', function() {
        s.openaiKey = (apiEl ? apiEl.value.trim() : '');
        S.saveSettings(s);
        state.settings = s;
        showToast('✅ API key saved', 'success');
      });
    }

    var storageEl = document.getElementById('storage-info');
    if (storageEl) {
      var all = S.getAllLogs();
      var days = Object.keys(all).length;
      var size = new Blob([JSON.stringify(all)]).size;
      storageEl.textContent = days + ' days logged • ~' + (size/1024).toFixed(1) + ' KB stored';
    }
  }

  function bindSettingInput(id, currentVal, onChange) {
    var el = document.getElementById(id);
    if (!el) return;
    el.value = currentVal;
    if (!el._settingBound) {
      el._settingBound = true;
      el.addEventListener('change', function() { onChange(el.value); });
    }
  }

  // =====================================================
  // MODALS
  // =====================================================
  function setupModals() {
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var modal = btn.closest('.modal-overlay');
        if (modal) closeModal(modal.id);
      });
    });
    document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeModal(overlay.id);
      });
    });
  }

  function openModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('open');
  }

  function closeModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  // =====================================================
  // TOAST
  // =====================================================
  function showToast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toast-container');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    var icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = '<span>' + (icons[type] || '✅') + '</span><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(function() {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, 3000);
  }

  // =====================================================
  // KEYBOARD
  // =====================================================
  function handleKeyboard(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    var shortcuts = { '1':'dashboard','2':'food','3':'water','4':'protein','5':'training','6':'tasks','7':'ai','8':'settings' };
    if (shortcuts[e.key]) navigateTo(shortcuts[e.key]);
    if (e.key === 'ArrowLeft') changeDate(-1);
    if (e.key === 'ArrowRight') changeDate(1);
  }

  // =====================================================
  // HELPER RENDERS
  // =====================================================
  function taskItemHTML(task, withDelete) {
    var catColors = { nutrition:'badge-green', training:'badge-orange', recovery:'badge-blue', mindset:'badge-purple', other:'badge-yellow' };
    return '<div class="task-item ' + (task.completed ? 'completed' : '') + '" data-id="' + task.id + '">' +
      '<div class="task-checkbox">' + (task.completed ? '✓' : '') + '</div>' +
      '<div class="task-text">' + escHtml(task.text) + '</div>' +
      (task.category ? '<span class="badge ' + (catColors[task.category] || 'badge-yellow') + '">' + task.category + '</span>' : '') +
      (withDelete ? '<button class="task-delete" data-id="' + task.id + '" title="Delete">✕</button>' : '') +
      '</div>';
  }

  function trainingSessionHTML(t) {
    return '<div class="training-session ' + t.intensity + '" style="margin-bottom:8px">' +
      '<div class="training-header">' +
      '<div class="training-type">' + getTrainingEmoji(t.type) + ' ' + t.type + '</div>' +
      '<span class="intensity-badge ' + t.intensity + '">' + t.intensity + '</span>' +
      '</div>' +
      '<div class="training-meta"><span>⏱️ ' + t.duration + ' min</span></div>' +
      '</div>';
  }

  function getTrainingEmoji(type) {
    var map = { 'Boxing':'🥊','Kickboxing':'🦵','Grappling':'🤼','Strength & Conditioning':'🏋️','Running':'🏃','HIIT':'⚡','Yoga':'🧘','Cycling':'🚴' };
    return map[type] || '💪';
  }

  function getFoodEmoji(name) {
    var n = (name || '').toLowerCase();
    if (n.includes('chicken') || n.includes('turkey')) return '🍗';
    if (n.includes('egg')) return '🥚';
    if (n.includes('fish') || n.includes('tuna') || n.includes('salmon')) return '🐟';
    if (n.includes('beef') || n.includes('steak')) return '🥩';
    if (n.includes('rice') || n.includes('pasta') || n.includes('bread')) return '🍚';
    if (n.includes('whey') || n.includes('protein') || n.includes('shake')) return '🥤';
    if (n.includes('milk') || n.includes('yogurt') || n.includes('cheese')) return '🥛';
    if (n.includes('salad') || n.includes('vegetable') || n.includes('broccoli')) return '🥗';
    if (n.includes('oat') || n.includes('cereal')) return '🥣';
    return '🍽️';
  }

  // =====================================================
  // UTILITIES
  // =====================================================
  function escHtml(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str || '')));
    return d.innerHTML;
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setProgress(id, pct) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.width = Math.max(0, Math.min(pct, 100)) + '%';
  }

  // =====================================================
  // GLOBAL EXPOSURES (for inline onclick buttons)
  // =====================================================
  window.navigateTo = navigateTo;
  window.showToast = showToast;
  window.openModal = openModal;
  window.closeModal = closeModal;

})();

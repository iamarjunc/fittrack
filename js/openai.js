/**
 * openai.js — OpenAI API integration
 * Global: window.generateAISummary
 */
(function() {
  'use strict';

  function buildPrompt(day, settings) {
    var protein = day.protein || 0;
    var proteinGoal = settings.proteinGoal || 160;
    var water = day.water || 0;
    var waterGoal = settings.waterGoal || 3;
    var tasks = day.tasks || [];
    var completedTasks = tasks.filter(function(t) { return t.completed; });
    var training = day.training || [];
    var food = day.food || [];

    var trainingInfo = training.length > 0
      ? training.map(function(t) {
          return t.type + ' (' + t.intensity + ' intensity, ' + t.duration + ' min' + (t.notes ? ' - "' + t.notes + '"' : '') + ')';
        }).join('; ')
      : 'No training today';

    var foodInfo = food.length > 0
      ? food.map(function(f) {
          return f.name + ' (' + f.protein + 'g protein, ' + f.calories + ' kcal)';
        }).join(', ')
      : 'No food logged';

    return 'Here is my fitness log for today. Please analyze and give me:\n' +
      '1. \uD83C\uDFC6 Overall discipline assessment (1-2 sentences)\n' +
      '2. \u2705 What I did well\n' +
      '3. \uD83C\uDFAF Top 2-3 suggestions for improvement\n\n' +
      '--- DAILY LOG ---\n' +
      '\uD83D\uDCCA Protein: ' + protein + 'g / ' + proteinGoal + 'g goal (' + Math.round((protein/proteinGoal)*100) + '%)\n' +
      '\uD83D\uDCA7 Water: ' + water + ' bottles (' + (water * 1.8).toFixed(1) + 'L) / ' + waterGoal + ' bottles goal\n' +
      '\uD83C\uDF7D\uFE0F Food: ' + foodInfo + '\n' +
      '\uD83D\uDCAA Training: ' + trainingInfo + '\n' +
      '\u2705 Tasks: ' + completedTasks.length + '/' + tasks.length + ' completed' +
      (tasks.length > 0 ? ' (' + completedTasks.map(function(t){return t.text;}).join(', ') + ')' : '');
  }

  function generateAISummary(dayLog, settings) {
    var apiKey = settings.openaiKey;
    if (!apiKey) {
      return Promise.reject(new Error('No OpenAI API key set. Please add your key in Settings.'));
    }

    var prompt = buildPrompt(dayLog, settings);

    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are a fitness coach AI assistant. Analyze daily fitness logs and provide motivating, concise, actionable feedback. Be encouraging but honest. Use emojis sparingly. Keep responses under 200 words. Format with clear sections.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    }).then(function(response) {
      if (!response.ok) {
        return response.json().catch(function() { return {}; }).then(function(err) {
          throw new Error((err.error && err.error.message) || ('API error: ' + response.status));
        });
      }
      return response.json();
    }).then(function(data) {
      return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || 'Could not generate summary.';
    });
  }

  window.generateAISummary = generateAISummary;

})();

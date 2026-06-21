/**
 * nutrition.js — Built-in food nutrition database
 * Focused on Indian hostel foods + common fitness foods
 * Values are per standard serving (not per 100g for usability)
 * Global: window.NutritionDB
 */
(function() {
  'use strict';

  // Database: { name, serving, protein, calories, carbs, fat, emoji }
  // Serving is the default portion described in the name
  var DB = [
    // ===================== RICE & GRAINS =====================
    { name: 'White Rice (1 cup cooked)', serving: '1 cup', protein: 4, calories: 206, carbs: 45, fat: 0, emoji: '🍚', tags: ['hostel','rice','carbs'] },
    { name: 'Brown Rice (1 cup cooked)', serving: '1 cup', protein: 5, calories: 216, carbs: 45, fat: 2, emoji: '🍚', tags: ['rice','carbs','healthy'] },
    { name: 'Jeera Rice (1 cup)', serving: '1 cup', protein: 4, calories: 230, carbs: 47, fat: 3, emoji: '🍚', tags: ['hostel','rice'] },
    { name: 'Pulao (1 cup)', serving: '1 cup', protein: 5, calories: 250, carbs: 48, fat: 5, emoji: '🍚', tags: ['hostel','rice'] },
    { name: 'Biryani (1 plate)', serving: '1 plate ~300g', protein: 18, calories: 450, carbs: 60, fat: 14, emoji: '🍛', tags: ['hostel','rice','chicken'] },
    { name: 'Chicken Biryani (1 plate)', serving: '1 plate ~300g', protein: 28, calories: 480, carbs: 58, fat: 15, emoji: '🍛', tags: ['hostel','chicken','rice'] },
    { name: 'Fried Rice (1 plate)', serving: '1 plate', protein: 8, calories: 320, carbs: 55, fat: 8, emoji: '🍳', tags: ['hostel','rice'] },

    // ===================== ROTI / BREAD =====================
    { name: 'Roti / Chapati (1 piece)', serving: '1 roti', protein: 3, calories: 100, carbs: 20, fat: 1, emoji: '🫓', tags: ['hostel','roti','bread'] },
    { name: 'Paratha (1 piece)', serving: '1 paratha', protein: 4, calories: 180, carbs: 28, fat: 6, emoji: '🫓', tags: ['hostel','bread'] },
    { name: 'Butter Roti (1 piece)', serving: '1 roti', protein: 3, calories: 130, carbs: 20, fat: 5, emoji: '🫓', tags: ['hostel','roti'] },
    { name: 'Whole Wheat Bread (2 slices)', serving: '2 slices', protein: 6, calories: 140, carbs: 26, fat: 2, emoji: '🍞', tags: ['bread','hostel'] },
    { name: 'White Bread (2 slices)', serving: '2 slices', protein: 4, calories: 150, carbs: 30, fat: 1, emoji: '🍞', tags: ['bread','hostel'] },
    { name: 'Puri (2 pieces)', serving: '2 puris', protein: 4, calories: 200, carbs: 28, fat: 9, emoji: '🫓', tags: ['hostel','fried'] },
    { name: 'Naan (1 piece)', serving: '1 naan', protein: 7, calories: 260, carbs: 45, fat: 5, emoji: '🫓', tags: ['bread'] },

    // ===================== DAL / LENTILS =====================
    { name: 'Dal (1 bowl)', serving: '1 bowl ~200ml', protein: 9, calories: 130, carbs: 20, fat: 2, emoji: '🍲', tags: ['hostel','dal','protein'] },
    { name: 'Dal Tadka (1 bowl)', serving: '1 bowl', protein: 9, calories: 160, carbs: 20, fat: 5, emoji: '🍲', tags: ['hostel','dal'] },
    { name: 'Dal Makhani (1 bowl)', serving: '1 bowl', protein: 10, calories: 200, carbs: 22, fat: 9, emoji: '🍲', tags: ['hostel','dal'] },
    { name: 'Rajma (1 bowl)', serving: '1 bowl', protein: 8, calories: 170, carbs: 28, fat: 2, emoji: '🫘', tags: ['hostel','legumes','protein'] },
    { name: 'Chole (1 bowl)', serving: '1 bowl', protein: 8, calories: 180, carbs: 28, fat: 4, emoji: '🫘', tags: ['hostel','legumes'] },
    { name: 'Sambar (1 bowl)', serving: '1 bowl ~200ml', protein: 5, calories: 100, carbs: 15, fat: 2, emoji: '🍲', tags: ['hostel','south indian','dal'] },
    { name: 'Rasam (1 cup)', serving: '1 cup', protein: 2, calories: 50, carbs: 8, fat: 1, emoji: '🍵', tags: ['hostel','south indian'] },
    { name: 'Moong Dal (1 bowl)', serving: '1 bowl', protein: 12, calories: 150, carbs: 22, fat: 1, emoji: '🍲', tags: ['dal','protein'] },
    { name: 'Chana Dal (1 bowl)', serving: '1 bowl', protein: 10, calories: 165, carbs: 26, fat: 2, emoji: '🍲', tags: ['dal','protein'] },

    // ===================== VEGETABLES =====================
    { name: 'Mixed Vegetable Curry (1 bowl)', serving: '1 bowl', protein: 4, calories: 120, carbs: 16, fat: 5, emoji: '🥗', tags: ['hostel','vegetable'] },
    { name: 'Aloo Gobi (1 bowl)', serving: '1 bowl', protein: 4, calories: 160, carbs: 22, fat: 7, emoji: '🥔', tags: ['hostel','vegetable'] },
    { name: 'Palak Paneer (1 bowl)', serving: '1 bowl', protein: 14, calories: 250, carbs: 12, fat: 16, emoji: '🥬', tags: ['hostel','paneer','protein'] },
    { name: 'Paneer Butter Masala (1 bowl)', serving: '1 bowl', protein: 16, calories: 320, carbs: 14, fat: 22, emoji: '🧀', tags: ['hostel','paneer','protein'] },
    { name: 'Paneer Bhurji (1 bowl)', serving: '1 bowl', protein: 18, calories: 280, carbs: 8, fat: 20, emoji: '🧀', tags: ['paneer','protein'] },
    { name: 'Paneer (100g)', serving: '100g', protein: 18, calories: 265, carbs: 4, fat: 21, emoji: '🧀', tags: ['paneer','protein','dairy'] },
    { name: 'Potato Sabzi (1 bowl)', serving: '1 bowl', protein: 3, calories: 150, carbs: 25, fat: 5, emoji: '🥔', tags: ['hostel','vegetable'] },
    { name: 'Bhindi (Okra) Masala (1 bowl)', serving: '1 bowl', protein: 3, calories: 120, carbs: 14, fat: 7, emoji: '🥦', tags: ['hostel','vegetable'] },

    // ===================== SOUTH INDIAN =====================
    { name: 'Idli (2 pieces)', serving: '2 idlis', protein: 4, calories: 130, carbs: 26, fat: 1, emoji: '🫓', tags: ['hostel','south indian','breakfast'] },
    { name: 'Dosa (1 plain)', serving: '1 dosa', protein: 4, calories: 160, carbs: 30, fat: 3, emoji: '🫓', tags: ['hostel','south indian','breakfast'] },
    { name: 'Masala Dosa (1 piece)', serving: '1 dosa', protein: 6, calories: 250, carbs: 40, fat: 8, emoji: '🫓', tags: ['hostel','south indian'] },
    { name: 'Upma (1 plate)', serving: '1 plate', protein: 5, calories: 200, carbs: 32, fat: 6, emoji: '🍚', tags: ['hostel','south indian','breakfast'] },
    { name: 'Pongal (1 bowl)', serving: '1 bowl', protein: 7, calories: 220, carbs: 38, fat: 5, emoji: '🍚', tags: ['hostel','south indian','breakfast'] },
    { name: 'Vada (2 pieces)', serving: '2 vadas', protein: 6, calories: 190, carbs: 22, fat: 9, emoji: '🍩', tags: ['hostel','south indian','fried'] },
    { name: 'Uttapam (1 piece)', serving: '1 piece', protein: 5, calories: 180, carbs: 30, fat: 5, emoji: '🫓', tags: ['hostel','south indian'] },

    // ===================== NORTH INDIAN =====================
    { name: 'Chole Bhature (1 plate)', serving: '1 plate', protein: 14, calories: 520, carbs: 72, fat: 18, emoji: '🍽️', tags: ['hostel','north indian'] },
    { name: 'Kadai Paneer (1 bowl)', serving: '1 bowl', protein: 16, calories: 290, carbs: 12, fat: 20, emoji: '🧀', tags: ['hostel','paneer'] },
    { name: 'Aloo Paratha (1 piece)', serving: '1 piece', protein: 5, calories: 250, carbs: 38, fat: 8, emoji: '🫓', tags: ['hostel','paratha','breakfast'] },
    { name: 'Poha (1 plate)', serving: '1 plate', protein: 4, calories: 180, carbs: 35, fat: 4, emoji: '🍚', tags: ['hostel','breakfast'] },
    { name: 'Khichdi (1 bowl)', serving: '1 bowl', protein: 8, calories: 200, carbs: 38, fat: 3, emoji: '🍲', tags: ['hostel','rice','dal'] },

    // ===================== CHICKEN / MEAT =====================
    { name: 'Chicken Breast (150g)', serving: '150g', protein: 45, calories: 165, carbs: 0, fat: 4, emoji: '🍗', tags: ['chicken','protein','fitness'] },
    { name: 'Chicken Breast (100g)', serving: '100g', protein: 31, calories: 110, carbs: 0, fat: 3, emoji: '🍗', tags: ['chicken','protein','fitness'] },
    { name: 'Chicken Curry (1 bowl)', serving: '1 bowl', protein: 25, calories: 300, carbs: 8, fat: 18, emoji: '🍗', tags: ['hostel','chicken','protein'] },
    { name: 'Chicken Leg Piece', serving: '1 piece ~100g', protein: 20, calories: 185, carbs: 0, fat: 10, emoji: '🍗', tags: ['hostel','chicken'] },
    { name: 'Chicken 65 (6 pieces)', serving: '6 pieces', protein: 24, calories: 320, carbs: 12, fat: 18, emoji: '🍗', tags: ['hostel','chicken','fried'] },
    { name: 'Chicken Kebab (4 pieces)', serving: '4 pieces', protein: 28, calories: 280, carbs: 6, fat: 14, emoji: '🍖', tags: ['chicken','protein'] },
    { name: 'Boiled Chicken (100g)', serving: '100g', protein: 30, calories: 135, carbs: 0, fat: 3, emoji: '🍗', tags: ['chicken','protein','fitness'] },
    { name: 'Mutton Curry (1 bowl)', serving: '1 bowl', protein: 22, calories: 350, carbs: 6, fat: 24, emoji: '🍖', tags: ['hostel','mutton'] },
    { name: 'Egg Curry (2 eggs)', serving: '2 eggs', protein: 14, calories: 230, carbs: 6, fat: 16, emoji: '🥚', tags: ['hostel','eggs','protein'] },

    // ===================== EGGS =====================
    { name: 'Whole Egg (boiled)', serving: '1 egg', protein: 6, calories: 70, carbs: 1, fat: 5, emoji: '🥚', tags: ['eggs','protein','fitness'] },
    { name: 'Eggs x2 (boiled)', serving: '2 eggs', protein: 12, calories: 140, carbs: 2, fat: 10, emoji: '🥚', tags: ['eggs','protein'] },
    { name: 'Eggs x3 (boiled)', serving: '3 eggs', protein: 18, calories: 210, carbs: 3, fat: 15, emoji: '🥚', tags: ['eggs','protein'] },
    { name: 'Egg White (1)', serving: '1 egg white', protein: 4, calories: 17, carbs: 0, fat: 0, emoji: '🥚', tags: ['eggs','protein','fitness'] },
    { name: 'Scrambled Eggs (2 eggs)', serving: '2 eggs', protein: 14, calories: 200, carbs: 2, fat: 14, emoji: '🍳', tags: ['eggs','protein','breakfast'] },
    { name: 'Omelette (2 eggs)', serving: '2 eggs', protein: 14, calories: 190, carbs: 2, fat: 14, emoji: '🍳', tags: ['eggs','protein','hostel'] },
    { name: 'Egg Bhurji (2 eggs)', serving: '2 eggs', protein: 14, calories: 210, carbs: 4, fat: 15, emoji: '🍳', tags: ['hostel','eggs','protein'] },

    // ===================== FISH / SEAFOOD =====================
    { name: 'Tuna Can (185g drained)', serving: '185g can', protein: 44, calories: 190, carbs: 0, fat: 1, emoji: '🐟', tags: ['fish','protein','fitness'] },
    { name: 'Fish Curry (1 piece + gravy)', serving: '1 piece', protein: 22, calories: 230, carbs: 5, fat: 13, emoji: '🐟', tags: ['hostel','fish','protein'] },
    { name: 'Grilled Fish (100g)', serving: '100g', protein: 22, calories: 130, carbs: 0, fat: 5, emoji: '🐟', tags: ['fish','protein','fitness'] },
    { name: 'Salmon (100g)', serving: '100g', protein: 25, calories: 208, carbs: 0, fat: 13, emoji: '🐟', tags: ['fish','protein','fitness'] },

    // ===================== DAIRY =====================
    { name: 'Whole Milk (1 glass 250ml)', serving: '1 glass', protein: 8, calories: 150, carbs: 12, fat: 8, emoji: '🥛', tags: ['dairy','protein','hostel'] },
    { name: 'Toned Milk (1 glass)', serving: '1 glass', protein: 7, calories: 120, carbs: 12, fat: 4, emoji: '🥛', tags: ['dairy','protein','hostel'] },
    { name: 'Greek Yogurt (200g)', serving: '200g', protein: 17, calories: 130, carbs: 9, fat: 0, emoji: '🥛', tags: ['dairy','protein','fitness'] },
    { name: 'Curd / Dahi (1 bowl)', serving: '1 bowl ~150g', protein: 5, calories: 90, carbs: 7, fat: 4, emoji: '🥛', tags: ['hostel','dairy'] },
    { name: 'Curd Rice (1 plate)', serving: '1 plate', protein: 7, calories: 280, carbs: 50, fat: 5, emoji: '🍚', tags: ['hostel','south indian','rice'] },
    { name: 'Buttermilk / Chaas (1 glass)', serving: '1 glass', protein: 3, calories: 50, carbs: 5, fat: 2, emoji: '🥛', tags: ['hostel','dairy','drink'] },
    { name: 'Lassi (1 glass)', serving: '1 glass', protein: 5, calories: 160, carbs: 22, fat: 6, emoji: '🥛', tags: ['hostel','dairy','drink'] },
    { name: 'Cheese Slice (1 slice)', serving: '1 slice 25g', protein: 5, calories: 80, carbs: 1, fat: 6, emoji: '🧀', tags: ['dairy','hostel'] },

    // ===================== PROTEIN SUPPLEMENTS =====================
    { name: 'Whey Protein Shake (1 scoop)', serving: '1 scoop ~30g', protein: 24, calories: 120, carbs: 3, fat: 2, emoji: '🥤', tags: ['fitness','protein','supplement'] },
    { name: 'Whey Protein (2 scoops)', serving: '2 scoops', protein: 48, calories: 240, carbs: 6, fat: 4, emoji: '🥤', tags: ['fitness','protein','supplement'] },
    { name: 'Casein Protein (1 scoop)', serving: '1 scoop', protein: 24, calories: 120, carbs: 4, fat: 1, emoji: '🥤', tags: ['fitness','protein','supplement'] },
    { name: 'Mass Gainer (1 serving)', serving: '1 serving', protein: 30, calories: 650, carbs: 120, fat: 5, emoji: '🥤', tags: ['fitness','supplement'] },
    { name: 'Peanut Butter (2 tbsp)', serving: '2 tbsp 32g', protein: 8, calories: 190, carbs: 7, fat: 16, emoji: '🥜', tags: ['fitness','protein','fat'] },

    // ===================== BREAKFAST =====================
    { name: 'Oats (1 cup cooked)', serving: '1 cup', protein: 6, calories: 150, carbs: 27, fat: 3, emoji: '🥣', tags: ['breakfast','fitness','hostel'] },
    { name: 'Cornflakes (1 bowl with milk)', serving: '1 bowl', protein: 8, calories: 200, carbs: 38, fat: 4, emoji: '🥣', tags: ['breakfast','hostel'] },
    { name: 'Banana (1 medium)', serving: '1 banana', protein: 1, calories: 105, carbs: 27, fat: 0, emoji: '🍌', tags: ['fruit','carbs','hostel'] },
    { name: 'Apple (1 medium)', serving: '1 apple', protein: 0, calories: 95, carbs: 25, fat: 0, emoji: '🍎', tags: ['fruit','hostel'] },
    { name: 'Boiled Peanuts (1 handful)', serving: '30g', protein: 7, calories: 165, carbs: 6, fat: 14, emoji: '🥜', tags: ['hostel','snack','protein'] },
    { name: 'Roasted Chana (1 handful)', serving: '30g', protein: 7, calories: 120, carbs: 15, fat: 3, emoji: '🫘', tags: ['hostel','snack','protein'] },
    { name: 'Sprouts (1 cup)', serving: '1 cup', protein: 14, calories: 150, carbs: 20, fat: 1, emoji: '🌱', tags: ['hostel','protein','breakfast'] },

    // ===================== SNACKS / CANTEEN =====================
    { name: 'Samosa (1 piece)', serving: '1 samosa', protein: 3, calories: 260, carbs: 32, fat: 13, emoji: '🥟', tags: ['hostel','canteen','snack','fried'] },
    { name: 'Bread Omelette (2 eggs + 2 bread)', serving: '1 serving', protein: 18, calories: 340, carbs: 30, fat: 17, emoji: '🍳', tags: ['hostel','canteen','eggs'] },
    { name: 'Maggi Noodles (1 pack cooked)', serving: '1 pack 70g dry', protein: 8, calories: 310, carbs: 44, fat: 12, emoji: '🍜', tags: ['hostel','canteen','snack'] },
    { name: 'Boiled Chana (1 cup)', serving: '1 cup', protein: 12, calories: 200, carbs: 35, fat: 3, emoji: '🫘', tags: ['hostel','snack','protein'] },
    { name: 'Groundnut Chikki (1 piece)', serving: '1 piece ~30g', protein: 5, calories: 160, carbs: 18, fat: 9, emoji: '🍬', tags: ['hostel','snack'] },
    { name: 'Biscuits (4 Marie)', serving: '4 biscuits', protein: 2, calories: 120, carbs: 22, fat: 3, emoji: '🍪', tags: ['hostel','snack'] },
    { name: 'Vada Pav (1 piece)', serving: '1 vada pav', protein: 7, calories: 290, carbs: 42, fat: 10, emoji: '🍔', tags: ['hostel','canteen','snack'] },

    // ===================== DRINKS =====================
    { name: 'Chai / Tea with milk (1 cup)', serving: '1 cup 200ml', protein: 2, calories: 55, carbs: 7, fat: 2, emoji: '☕', tags: ['hostel','drink','canteen'] },
    { name: 'Black Coffee (1 cup)', serving: '1 cup', protein: 0, calories: 5, carbs: 0, fat: 0, emoji: '☕', tags: ['drink','hostel'] },
    { name: 'Coffee with milk (1 cup)', serving: '1 cup', protein: 3, calories: 80, carbs: 9, fat: 3, emoji: '☕', tags: ['hostel','drink'] },
    { name: 'Banana Milkshake (1 glass)', serving: '1 glass', protein: 7, calories: 260, carbs: 45, fat: 6, emoji: '🍌', tags: ['hostel','drink','canteen'] },
    { name: 'Coconut Water (1 cup)', serving: '1 cup 240ml', protein: 2, calories: 46, carbs: 9, fat: 0, emoji: '🥥', tags: ['drink','hostel'] },
    { name: 'Protein Shake (milk + whey)', serving: '1 shake', protein: 32, calories: 270, carbs: 15, fat: 10, emoji: '🥤', tags: ['fitness','protein'] },

    // ===================== MESS / CANTEEN COMBOS =====================
    { name: 'Mess Thali (veg, typical)', serving: '1 thali', protein: 14, calories: 650, carbs: 110, fat: 16, emoji: '🍽️', tags: ['hostel','mess','thali'] },
    { name: 'Mess Thali (non-veg)', serving: '1 thali', protein: 35, calories: 750, carbs: 105, fat: 22, emoji: '🍽️', tags: ['hostel','mess','thali'] },
    { name: 'Canteen Lunch (rice + dal + sabzi)', serving: '1 meal', protein: 16, calories: 550, carbs: 90, fat: 12, emoji: '🍽️', tags: ['hostel','canteen','mess'] },
    { name: 'Canteen Breakfast (idli + sambar)', serving: '1 meal', protein: 9, calories: 230, carbs: 42, fat: 3, emoji: '🍽️', tags: ['hostel','canteen','breakfast'] },
  ];

  /**
   * Fuzzy search the nutrition database
   * Returns top matches sorted by relevance
   */
  function search(query, limit) {
    if (!query || query.length < 2) return [];
    limit = limit || 6;
    var q = query.toLowerCase().trim();
    var words = q.split(/\s+/);

    var scored = DB.map(function(item) {
      var nameLower = item.name.toLowerCase();
      var score = 0;

      // Exact start match — highest priority
      if (nameLower.startsWith(q)) score += 100;
      // Contains full query
      else if (nameLower.includes(q)) score += 60;
      else {
        // Word-by-word matching
        words.forEach(function(word) {
          if (word.length < 2) return;
          if (nameLower.includes(word)) score += 20;
          // Tag matching
          if (item.tags && item.tags.some(function(t) { return t.includes(word); })) score += 10;
        });
      }

      return { item: item, score: score };
    });

    return scored
      .filter(function(s) { return s.score > 0; })
      .sort(function(a, b) { return b.score - a.score; })
      .slice(0, limit)
      .map(function(s) { return s.item; });
  }

  /**
   * Get exact match by name
   */
  function getByName(name) {
    var n = name.toLowerCase().trim();
    return DB.find(function(item) { return item.name.toLowerCase() === n; }) || null;
  }

  /**
   * Get all hostel-tagged items
   */
  function getHostelFoods() {
    return DB.filter(function(item) { return item.tags && item.tags.includes('hostel'); });
  }

  window.NutritionDB = {
    search: search,
    getByName: getByName,
    getHostelFoods: getHostelFoods,
    all: DB,
  };

})();

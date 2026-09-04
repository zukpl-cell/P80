(() => {
  "use strict";

  const CONFIG = window.P80_CONFIG || {};
  const PROJECT = CONFIG.project || {};
  const LOCAL_KEY = "p80-v2-reports";
  const CUSTOM_FOODS_KEY = "p80-v2-custom-foods";
  const TYPE_LABELS = {
    meal: "Posiłek",
    snack: "Przekąska",
    drink: "Napój",
    alcohol: "Alkohol",
    supplement: "Dodatek"
  };
  const FOOD_CATEGORY_LABELS = {
    custom: "Moje produkty",
    meat: "Mięso i jaja",
    fish: "Ryby i owoce morza",
    dairy: "Nabiał",
    vegetables: "Warzywa",
    fats: "Tłuszcze",
    nuts: "Orzechy i pestki",
    supplements: "Odżywki i suplementy",
    drinks: "Napoje"
  };
  const FOOD_DATABASE = {
    chicken: { name: "Pierś z kurczaka (surowa)", category: "meat", unit: "g", kcal: 1.2, carbs: 0 },
    chickenCooked: { name: "Pierś z kurczaka (po obróbce)", category: "meat", unit: "g", kcal: 1.6, carbs: 0 },
    chickenThigh: { name: "Udko z kurczaka bez skóry (surowe)", category: "meat", unit: "g", kcal: 1.77, carbs: 0 },
    turkey: { name: "Pierś z indyka (surowa)", category: "meat", unit: "g", kcal: 1.14, carbs: 0 },
    porkNeck: { name: "Karkówka wieprzowa (surowa)", category: "meat", unit: "g", kcal: 2.67, carbs: 0 },
    porkNeckCooked: { name: "Karkówka wieprzowa (po obróbce)", category: "meat", unit: "g", kcal: 3.514, carbs: 0 },
    porkLoin: { name: "Schab wieprzowy (surowy)", category: "meat", unit: "g", kcal: 1.43, carbs: 0 },
    bacon: { name: "Boczek", category: "meat", unit: "g", kcal: 5.41, carbs: 0.014 },
    groundBeef: { name: "Wołowina mielona 20% tłuszczu", category: "meat", unit: "g", kcal: 2.54, carbs: 0 },
    beefSteak: { name: "Stek wołowy (surowy)", category: "meat", unit: "g", kcal: 2.01, carbs: 0 },
    egg: { name: "Jajko M", category: "meat", unit: "szt.", kcal: 78, carbs: 0.6 },
    eggL: { name: "Jajko L", category: "meat", unit: "szt.", kcal: 90, carbs: 0.6 },
    tuna: { name: "Tuńczyk w sosie własnym — odsączony", category: "fish", unit: "g", kcal: 1.16, carbs: 0 },
    tunaOil: { name: "Tuńczyk w oliwie — odsączony", category: "fish", unit: "g", kcal: 1.9, carbs: 0 },
    salmon: { name: "Łosoś świeży", category: "fish", unit: "g", kcal: 2.08, carbs: 0 },
    smokedMackerel: { name: "Makrela wędzona", category: "fish", unit: "g", kcal: 2.21, carbs: 0 },
    sardines: { name: "Sardynki w oleju — odsączone", category: "fish", unit: "g", kcal: 2.08, carbs: 0 },
    cod: { name: "Dorsz świeży", category: "fish", unit: "g", kcal: 0.82, carbs: 0 },
    shrimp: { name: "Krewetki gotowane", category: "fish", unit: "g", kcal: 0.99, carbs: 0.002 },
    cottageCheese: { name: "Twaróg półtłusty", category: "dairy", unit: "g", kcal: 1.33, carbs: 0.035 },
    mozzarella: { name: "Mozzarella", category: "dairy", unit: "g", kcal: 2.53, carbs: 0.02 },
    gouda: { name: "Ser gouda", category: "dairy", unit: "g", kcal: 3.56, carbs: 0.022 },
    feta: { name: "Ser feta", category: "dairy", unit: "g", kcal: 2.65, carbs: 0.039 },
    halloumi: { name: "Ser halloumi", category: "dairy", unit: "g", kcal: 3.21, carbs: 0.022 },
    cream30: { name: "Śmietanka 30%", category: "dairy", unit: "ml", kcal: 2.92, carbs: 0.03 },
    sourCream18: { name: "Śmietana 18%", category: "dairy", unit: "g", kcal: 1.86, carbs: 0.036 },
    avocado: { name: "Awokado — miąższ", category: "vegetables", unit: "g", kcal: 1.6, carbs: 0.018 },
    cauliflower: { name: "Kalafior", category: "vegetables", unit: "g", kcal: 0.25, carbs: 0.03 },
    broccoli: { name: "Brokuł", category: "vegetables", unit: "g", kcal: 0.34, carbs: 0.04 },
    babyBroccoli: { name: "Baby brokuł", category: "vegetables", unit: "g", kcal: 0.35, carbs: 0.031 },
    cucumber: { name: "Ogórek", category: "vegetables", unit: "g", kcal: 0.15, carbs: 0.018 },
    zucchini: { name: "Cukinia", category: "vegetables", unit: "g", kcal: 0.17, carbs: 0.021 },
    mushrooms: { name: "Pieczarki", category: "vegetables", unit: "g", kcal: 0.22, carbs: 0.023 },
    enoki: { name: "Grzyby enoki", category: "vegetables", unit: "g", kcal: 0.37, carbs: 0.051 },
    oysterMushrooms: { name: "Boczniaki", category: "vegetables", unit: "g", kcal: 0.33, carbs: 0.038 },
    shimeji: { name: "Grzyby shimeji", category: "vegetables", unit: "g", kcal: 0.22, carbs: 0.031 },
    spinach: { name: "Szpinak", category: "vegetables", unit: "g", kcal: 0.23, carbs: 0.014 },
    asparagus: { name: "Szparagi", category: "vegetables", unit: "g", kcal: 0.2, carbs: 0.018 },
    greenBeans: { name: "Fasolka szparagowa", category: "vegetables", unit: "g", kcal: 0.31, carbs: 0.045 },
    sauerkraut: { name: "Kapusta kiszona", category: "vegetables", unit: "g", kcal: 0.19, carbs: 0.018 },
    lettuce: { name: "Sałata", category: "vegetables", unit: "g", kcal: 0.15, carbs: 0.012 },
    saladMix: { name: "Mix sałat", category: "vegetables", unit: "g", kcal: 0.18, carbs: 0.02 },
    tomato: { name: "Pomidor", category: "vegetables", unit: "g", kcal: 0.18, carbs: 0.027 },
    bellPepper: { name: "Papryka", category: "vegetables", unit: "g", kcal: 0.31, carbs: 0.04 },
    olives: { name: "Oliwki zielone", category: "vegetables", unit: "g", kcal: 1.45, carbs: 0.008 },
    butter: { name: "Masło", category: "fats", unit: "g", kcal: 7.35, carbs: 0.006 },
    mct: { name: "Olej MCT", category: "fats", unit: "ml", kcal: 8.3, carbs: 0 },
    oliveOil: { name: "Oliwa", category: "fats", unit: "g", kcal: 8.84, carbs: 0 },
    lard: { name: "Smalec", category: "fats", unit: "g", kcal: 9, carbs: 0 },
    coconutOil: { name: "Olej kokosowy", category: "fats", unit: "g", kcal: 8.92, carbs: 0 },
    almonds: { name: "Migdały", category: "nuts", unit: "g", kcal: 5.79, carbs: 0.096 },
    walnuts: { name: "Orzechy włoskie", category: "nuts", unit: "g", kcal: 6.54, carbs: 0.07 },
    pecans: { name: "Orzechy pekan", category: "nuts", unit: "g", kcal: 6.91, carbs: 0.04 },
    macadamia: { name: "Orzechy makadamia", category: "nuts", unit: "g", kcal: 7.18, carbs: 0.054 },
    hazelnuts: { name: "Orzechy laskowe", category: "nuts", unit: "g", kcal: 6.28, carbs: 0.07 },
    pumpkinSeeds: { name: "Pestki dyni", category: "nuts", unit: "g", kcal: 5.59, carbs: 0.107 },
    wheyAllnutrition: { name: "ALLNUTRITION Whey Protein", category: "supplements", unit: "g", kcal: 4.1, carbs: 0.16 },
    coffee: { name: "Kawa czarna", category: "drinks", unit: "ml", kcal: 0.008, carbs: 0 }
  };
  const MEAL_PRESET_GROUPS = {
    breakfast: "Śniadania",
    lunch: "Obiady",
    dinner: "Kolacje",
    extras: "Shake białkowy"
  };
  const MEAL_PRESETS = {
    breakfastBulletCoffee: {
      group: "breakfast",
      entryType: "drink",
      name: "Bullet Coffee",
      ingredients: [
        { productId: "coffee", amount: 240 },
        { productId: "butter", amount: 10 },
        { productId: "mct", amount: 10 }
      ]
    },
    breakfastEggs: {
      group: "breakfast",
      name: "Jajka, sałata i oliwki",
      ingredients: [
        { productId: "eggL", amount: 4 },
        { productId: "saladMix", amount: 100 },
        { productId: "olives", amount: 50 },
        { productId: "oliveOil", amount: 10 }
      ]
    },
    breakfastTuna: {
      group: "breakfast",
      name: "Jajka z tuńczykiem",
      ingredients: [
        { productId: "eggL", amount: 4 },
        { productId: "tuna", amount: 110 },
        { productId: "saladMix", amount: 100 }
      ]
    },
    lunchChickenBroccoli: {
      group: "lunch",
      name: "Kurczak z brokułem",
      ingredients: [
        { productId: "chickenCooked", amount: 240 },
        { productId: "broccoli", amount: 250 },
        { productId: "oliveOil", amount: 25 }
      ]
    },
    lunchChickenBabyBroccoli: {
      group: "lunch",
      name: "Kurczak z baby brokułem",
      ingredients: [
        { productId: "chickenCooked", amount: 240 },
        { productId: "babyBroccoli", amount: 250 },
        { productId: "oliveOil", amount: 25 }
      ]
    },
    lunchPorkBroccoli: {
      group: "lunch",
      name: "Karkówka z brokułem",
      ingredients: [
        { productId: "porkNeckCooked", amount: 190 },
        { productId: "broccoli", amount: 250 },
        { productId: "saladMix", amount: 100 }
      ]
    },
    lunchPorkBabyBroccoli: {
      group: "lunch",
      name: "Karkówka z baby brokułem",
      ingredients: [
        { productId: "porkNeckCooked", amount: 190 },
        { productId: "babyBroccoli", amount: 250 },
        { productId: "saladMix", amount: 100 }
      ]
    },
    dinnerTunaOwnSauce: {
      group: "dinner",
      name: "Tuńczyk w sosie własnym — duża sałatka",
      ingredients: [
        { productId: "tuna", amount: 220 },
        { productId: "saladMix", amount: 150 },
        { productId: "eggL", amount: 1 },
        { productId: "olives", amount: 50 },
        { productId: "oliveOil", amount: 10 }
      ]
    },
    dinnerTunaOil: {
      group: "dinner",
      name: "Tuńczyk w oliwie — duża sałatka",
      ingredients: [
        { productId: "tunaOil", amount: 220 },
        { productId: "saladMix", amount: 150 },
        { productId: "eggL", amount: 1 },
        { productId: "olives", amount: 50 }
      ]
    },
    proteinShakeAllnutrition: {
      group: "extras",
      entryType: "supplement",
      name: "Shake ALLNUTRITION Whey Protein",
      ingredients: [
        { productId: "wheyAllnutrition", amount: 30 }
      ]
    }
  };
  const GYM_PLANS = {
    A: [
      "Uginanie nóg siedząc",
      "Wyciskanie na maszynie z podparciem",
      "Ściąganie drążka neutralnie",
      "Prostowanie nóg siedząc",
      "Odwrotny pec deck",
      "Wspięcia na łydki siedząc"
    ],
    B: [
      "Wiosłowanie z podparciem klatki",
      "Pec deck",
      "Uginanie nóg siedząc",
      "Prostowanie nóg siedząc",
      "Unoszenie bokiem siedząc",
      "Wspięcia na łydki siedząc"
    ],
    C: [
      "Wyciskanie na maszynie z podparciem",
      "Wiosłowanie z podparciem klatki",
      "Ściąganie drążka neutralnie",
      "Prostowanie nóg siedząc",
      "Uginanie nóg siedząc",
      "Odwrotny pec deck"
    ]
  };
  const TRAINING_VIDEOS = {
    "Uginanie nóg siedząc": { videoId: "t9sTSr-JYSs", note: "Ustaw maszynę i wykonuj ruch spokojnie, bez odbijania ciężaru." },
    "Wyciskanie na maszynie z podparciem": { videoId: "sqNwDkUU_Ps", note: "Plecy pozostają oparte, a ruch jest kontrolowany w obu kierunkach." },
    "Ściąganie drążka neutralnie": { videoId: "lmmShS3KLB4", note: "Prowadź łokcie w dół i nie odchylaj gwałtownie tułowia." },
    "Prostowanie nóg siedząc": { videoId: "YyvSfVjQeL0", note: "Dopasuj oś kolana do osi maszyny i nie szarp ciężarem." },
    "Odwrotny pec deck": { videoId: "3RLqAh8-9Pg", note: "Klatka pozostaje oparta, a łopatki pracują bez rozpędzania ciężaru." },
    "Wspięcia na łydki siedząc": { videoId: "ORY-ke6vcgk", note: "Pełny, spokojny zakres: rozciągnięcie na dole i zatrzymanie na górze." },
    "Wiosłowanie z podparciem klatki": { videoId: "tZUYS7X50so", note: "Utrzymuj klatkę na podparciu i prowadź łokcie za tułów." },
    "Pec deck": { videoId: "H4mVGHaK2f4", note: "Ustaw uchwyty na wysokości klatki i wracaj bez nadmiernego rozciągania barków." },
    "Unoszenie bokiem siedząc": { videoId: "xDrYB81QXmY", note: "Unoszenie wykonuj bez bujania, w kontrolowanym zakresie." }
  };

  const state = {
    reports: [],
    weeklySummaries: [],
    currentReport: null,
    currentDate: localDateKey(new Date()),
    todayDate: localDateKey(new Date()),
    supabase: null,
    user: null,
    cloudReady: false,
    chart: null,
    glucoseChart: null,
    ketoneChart: null,
    saveTimer: null,
    pendingEntryFile: null,
    pendingIngredients: [],
    customFoods: {},
    pendingWeightFile: null,
    weeklyLoading: false,
    installPrompt: null,
    trainingSession: "A",
    midnightTimer: null,
    rolloverRunning: false
  };

  const el = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheElements();
    populateMealPresets();
    bindEvents();
    renderStaticPlan();
    configureDates();
    await initializeStorage();
    await materializeMissedReports();
    openReport(state.currentDate, false);
    renderAll();
    scheduleMidnightRollover();
    registerServiceWorker();
  }

  function cacheElements() {
    const ids = [
      "syncBadge", "setupBanner", "todayLabel", "deadlineBadge", "overdueBox",
      "currentWeight", "weightDelta", "toGoal", "streakValue", "todayVerdict",
      "todayCalories", "progressPercent", "progressBar", "weightChart", "weightChartBaseline",
      "glucoseChart", "glucoseChartLatest", "glucoseChartEmpty",
      "ketoneChart", "ketoneChartLatest", "ketoneChartEmpty", "recentDays",
      "reportDate", "closedBanner", "reportForm", "weight", "glucose", "ketones",
      "weightPhoto", "weightPhotoPreview", "addEntryButton", "entriesList", "calorieSum",
      "allFoodConfirmed", "gymPlanBadge", "homeMinutes", "gymMinutes", "bikeKm",
      "bikeMinutes", "steps", "gymSession", "gymExercisesPanel", "gymExercisesList",
      "recoveryDay", "trainingNotes", "sleepHours", "hunger", "mood", "difficultMoment", "wellbeingNotes",
      "ketoYes", "ketoNo", "turningPoint", "reportCompleteConfirmed",
      "validationBox", "saveDraftButton", "closeReportButton", "evaluationCard", "reopenReportButton",
      "evaluationVerdict", "evaluationHeadline", "evaluationDetails", "historyStats",
      "historyList", "exportButton", "weeklySummaryCard", "weeklyPeriod", "weeklyVerdict",
      "weeklyStats", "weeklyHeadline", "weeklyDetails", "generateWeeklyButton", "weeklyStatus",
      "trainingTabs", "trainingSessionTitle", "trainingExerciseCount", "trainingExerciseList",
      "trainingVideoDialog", "trainingVideoTitle", "trainingVideoFrame", "trainingVideoLink", "closeTrainingVideo",
      "weeklyPlan", "cloudStatus", "authCard",
      "authEmail", "authPassword", "loginButton", "setPasswordButton", "magicLinkButton",
      "logoutButton", "authMessage", "installButton",
      "entryDialog", "entryForm", "entryDialogTitle", "closeEntryDialog", "entryId",
      "entryType", "entryTime", "entryDescription", "entryGrams", "entryCalories",
      "entryNetCarbs", "entryPhoto", "entryPhotoPreview", "entryValidation",
      "mealPresetSelect", "mealPresetPreview", "loadMealPresetButton",
      "ingredientProduct", "ingredientAmount", "addIngredientButton", "ingredientHint",
      "deleteCustomProductButton", "customProductName", "customProductUnit",
      "customProductCaloriesLabel", "customProductCalories", "customProductCarbsLabel",
      "customProductCarbs", "customProductMessage", "saveCustomProductButton",
      "ingredientsList", "saveEntryButton", "toast"
    ];
    ids.forEach(id => { el[id] = document.getElementById(id); });
  }

  function bindEvents() {
    document.querySelectorAll("[data-nav]").forEach(button => {
      button.addEventListener("click", () => navigate(button.dataset.nav));
    });

    el.reportDate.addEventListener("change", () => switchReportDate(el.reportDate.value));
    el.addEntryButton.addEventListener("click", () => openEntryDialog());
    el.closeEntryDialog.addEventListener("click", closeEntryDialog);
    el.saveEntryButton.addEventListener("click", saveEntryFromDialog);
    el.entryPhoto.addEventListener("change", handleEntryPhotoPreview);
    el.ingredientProduct.addEventListener("change", renderIngredientHint);
    el.addIngredientButton.addEventListener("click", addIngredient);
    el.mealPresetSelect.addEventListener("change", renderMealPresetPreview);
    el.loadMealPresetButton.addEventListener("click", () => applyMealPreset(el.mealPresetSelect.value));
    el.customProductUnit.addEventListener("change", renderCustomProductLabels);
    el.saveCustomProductButton.addEventListener("click", saveCustomProduct);
    el.deleteCustomProductButton.addEventListener("click", deleteSelectedCustomProduct);
    el.weightPhoto.addEventListener("change", handleWeightPhoto);
    el.gymSession.addEventListener("change", () => renderGymExercises(el.gymSession.value));
    el.saveDraftButton.addEventListener("click", () => saveDraft(true));
    el.closeReportButton.addEventListener("click", closeReport);
    el.reopenReportButton.addEventListener("click", reopenCurrentReport);
    el.exportButton.addEventListener("click", exportReports);
    el.generateWeeklyButton.addEventListener("click", () => generateLatestWeeklySummary(true));
    el.loginButton.addEventListener("click", loginWithPassword);
    el.setPasswordButton.addEventListener("click", setAccountPassword);
    el.magicLinkButton.addEventListener("click", loginWithMagicLink);
    el.logoutButton.addEventListener("click", logout);
    el.installButton.addEventListener("click", installPwa);
    el.trainingTabs.addEventListener("click", event => {
      const button = event.target.closest("[data-training-session]");
      if (!button) return;
      renderTrainingLibrary(button.dataset.trainingSession);
    });
    el.trainingExerciseList.addEventListener("click", event => {
      const button = event.target.closest("[data-training-video]");
      if (!button) return;
      openTrainingVideo(button.dataset.trainingVideo);
    });
    el.closeTrainingVideo.addEventListener("click", closeTrainingVideoDialog);
    el.trainingVideoDialog.addEventListener("close", clearTrainingVideo);
    el.trainingVideoDialog.addEventListener("click", event => {
      if (event.target === el.trainingVideoDialog) closeTrainingVideoDialog();
    });

    el.reportForm.addEventListener("input", event => {
      if (state.currentReport?.closed) return;
      if (event.target.id === "reportDate") return;
      updateCalorieTotal();
      scheduleSave();
    });

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      state.installPrompt = event;
      el.installButton.hidden = false;
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) checkDayRollover();
    });
    window.addEventListener("focus", checkDayRollover);
  }

  function configureDates() {
    el.reportDate.max = state.todayDate;
    el.reportDate.value = state.currentDate;
    el.todayLabel.textContent = formatLongDate(state.todayDate).toUpperCase();
  }

  async function initializeStorage() {
    state.reports = loadLocalReports();
    state.customFoods = loadLocalCustomFoods();
    const configured = isCloudConfigured();
    el.setupBanner.hidden = configured;

    if (!configured || !window.supabase?.createClient) {
      state.cloudReady = false;
      renderCloudState();
      return;
    }

    try {
      state.supabase = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
        auth: { persistSession: true, detectSessionInUrl: true }
      });
      const { data } = await state.supabase.auth.getSession();
      state.user = data.session?.user || null;
      state.cloudReady = true;
      if (state.user) await syncCustomFoodsWithCloud();

      state.supabase.auth.onAuthStateChange(async (_event, session) => {
        const previousUser = state.user?.id;
        state.user = session?.user || null;
        if (!state.user) state.weeklySummaries = [];
        if (state.user && state.user.id !== previousUser) {
          await syncCustomFoodsWithCloud();
          await migrateLocalReportsToCloud();
          await loadCloudReports();
          await loadWeeklySummaries();
        }
        renderAll();
      });

      if (state.user) {
        await migrateLocalReportsToCloud();
        await loadCloudReports();
        await loadWeeklySummaries();
      }
    } catch (error) {
      console.error(error);
      state.cloudReady = false;
      showToast("Nie udało się połączyć z chmurą. Działamy lokalnie.");
    }
    renderCloudState();
  }

  function isCloudConfigured() {
    return Boolean(
      CONFIG.supabaseUrl &&
      CONFIG.supabaseAnonKey &&
      !CONFIG.supabaseUrl.includes("YOUR_") &&
      !CONFIG.supabaseAnonKey.includes("YOUR_")
    );
  }

  function normalizeCustomFoods(input) {
    const normalized = {};
    if (!input || typeof input !== "object") return normalized;
    Object.entries(input).forEach(([id, product]) => {
      if (!id.startsWith("custom_") || !product || typeof product !== "object") return;
      const unit = ["g", "ml", "szt."].includes(product.unit) ? product.unit : null;
      const kcal = Number(product.kcal);
      const carbs = Number(product.carbs);
      if (!unit || !String(product.name || "").trim() || !Number.isFinite(kcal) || kcal < 0 || !Number.isFinite(carbs) || carbs < 0) return;
      normalized[id] = {
        name: String(product.name).trim().slice(0, 80),
        category: "custom",
        unit,
        kcal,
        carbs,
        custom: true,
        deleted: Boolean(product.deleted),
        updatedAt: product.updatedAt || new Date(0).toISOString()
      };
    });
    return normalized;
  }

  function loadLocalCustomFoods() {
    try {
      return normalizeCustomFoods(JSON.parse(localStorage.getItem(CUSTOM_FOODS_KEY) || "{}"));
    } catch {
      return {};
    }
  }

  function saveLocalCustomFoods() {
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(state.customFoods));
  }

  function mergeCustomFoods(localFoods, cloudFoods) {
    const merged = { ...normalizeCustomFoods(cloudFoods) };
    Object.entries(normalizeCustomFoods(localFoods)).forEach(([id, localProduct]) => {
      const cloudProduct = merged[id];
      if (!cloudProduct || String(localProduct.updatedAt) >= String(cloudProduct.updatedAt)) merged[id] = localProduct;
    });
    return merged;
  }

  async function syncCustomFoodsWithCloud() {
    if (!state.user || !state.supabase) return;
    const cloudFoods = normalizeCustomFoods(state.user.user_metadata?.p80_custom_foods || {});
    state.customFoods = mergeCustomFoods(state.customFoods, cloudFoods);
    saveLocalCustomFoods();
    if (JSON.stringify(cloudFoods) !== JSON.stringify(state.customFoods)) {
      const metadata = { ...(state.user.user_metadata || {}), p80_custom_foods: state.customFoods };
      const { data, error } = await state.supabase.auth.updateUser({ data: metadata });
      if (error) throw error;
      if (data?.user) state.user = data.user;
    }
  }

  async function persistCustomFoods() {
    saveLocalCustomFoods();
    if (!state.user || !state.supabase) return;
    const metadata = { ...(state.user.user_metadata || {}), p80_custom_foods: state.customFoods };
    const { data, error } = await state.supabase.auth.updateUser({ data: metadata });
    if (error) throw error;
    if (data?.user) state.user = data.user;
  }

  function availableFoods() {
    const custom = Object.fromEntries(Object.entries(state.customFoods).filter(([, product]) => !product.deleted));
    return { ...FOOD_DATABASE, ...custom };
  }

  function loadLocalReports() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.map(normalizeReport) : [];
    } catch {
      return [];
    }
  }

  function saveLocalReports() {
    const safe = state.reports.map(report => sanitizeReport(report));
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(safe));
    } catch (error) {
      console.error(error);
      showToast("Pamięć telefonu jest pełna. Podłącz chmurę, aby zapisywać zdjęcia.");
    }
  }

  async function loadCloudReports() {
    if (!state.supabase || !state.user) return;
    const { data, error } = await state.supabase
      .from("daily_reports")
      .select("id, report_date, data, verdict, ai_evaluation, closed_at")
      .order("report_date", { ascending: true });

    if (error) throw error;
    state.reports = (data || []).map(row => normalizeReport({
      ...row.data,
      id: row.id,
      date: row.report_date,
      verdict: row.verdict || row.data?.verdict || null,
      evaluation: row.ai_evaluation || row.data?.evaluation || null,
      closedAt: row.closed_at || row.data?.closedAt || null,
      closed: Boolean(row.closed_at || row.data?.closed)
    }));
    saveLocalReports();
  }

  async function loadWeeklySummaries() {
    if (!state.supabase || !state.user) return;
    const { data, error } = await state.supabase
      .from("weekly_summaries")
      .select("id, week_start_date, week_end_date, period_days, verdict, stats, summary, updated_at")
      .order("week_end_date", { ascending: false });
    if (error) {
      console.warn("Weekly summaries:", error.message);
      state.weeklySummaries = [];
      return;
    }
    state.weeklySummaries = (data || []).map(row => ({
      id: row.id,
      weekStartDate: row.week_start_date,
      weekEndDate: row.week_end_date,
      periodDays: row.period_days,
      verdict: row.verdict,
      stats: row.stats || {},
      summary: row.summary || {},
      updatedAt: row.updated_at
    }));
  }

  async function migrateLocalReportsToCloud() {
    if (!state.user || !state.supabase || !state.reports.length) return;
    for (const report of state.reports) {
      await migrateLocalPhotos(report);
      await persistCloudReport(report);
    }
    saveLocalReports();
  }

  async function migrateLocalPhotos(report) {
    if (report.weightPhotoPreview?.startsWith("data:") && !report.weightPhotoPath) {
      const blob = await fetch(report.weightPhotoPreview).then(response => response.blob());
      report.weightPhotoPath = await uploadBlob(blob, report.id, "weight", "morning");
    }
    for (const entry of report.entries || []) {
      if (entry.photoPreview?.startsWith("data:") && !entry.photoPath) {
        const blob = await fetch(entry.photoPreview).then(response => response.blob());
        entry.photoPath = await uploadBlob(blob, report.id, "meal", entry.id);
      }
    }
  }

  async function persistReport(report) {
    report.updatedAt = new Date().toISOString();
    const index = state.reports.findIndex(item => item.date === report.date);
    if (index >= 0) state.reports[index] = normalizeReport(report);
    else state.reports.push(normalizeReport(report));
    state.reports.sort((a, b) => a.date.localeCompare(b.date));
    saveLocalReports();

    if (state.cloudReady && state.user) {
      try {
        await persistCloudReport(report);
      } catch (error) {
        console.error(error);
        showToast("Zapisano lokalnie. Synchronizacja z chmurą nie powiodła się.");
      }
    }
  }

  async function persistCloudReport(report) {
    const payload = {
      id: report.id,
      user_id: state.user.id,
      report_date: report.date,
      data: sanitizeReport(report, true),
      total_calories: totalCalories(report),
      keto: report.keto === "yes",
      verdict: report.verdict,
      ai_evaluation: report.evaluation,
      closed_at: report.closedAt
    };
    const { error } = await state.supabase.from("daily_reports").upsert(payload, { onConflict: "user_id,report_date" });
    if (error) throw error;
  }

  async function materializeMissedReports() {
    const start = parseLocalDate(PROJECT.startDate || state.currentDate);
    const yesterday = parseLocalDate(localDateKey(new Date()));
    yesterday.setDate(yesterday.getDate() - 1);
    if (start > yesterday) return;

    let cursor = new Date(start);
    while (cursor <= yesterday) {
      const date = localDateKey(cursor);
      const existing = state.reports.find(report => report.date === date);
      const shouldRepairAutomaticClosure = existing?.closed && isAutomaticMidnightClosure(existing);
      if (!existing?.closed || shouldRepairAutomaticClosure) {
        const report = existing || defaultReport(date);
        const errors = validateReport(report);
        report.closed = true;
        report.closedAt = new Date(`${date}T23:59:59`).toISOString();
        if (errors.length) {
          report.verdict = "NIEDOWIEZIONE";
          report.evaluation = {
            verdict: "NIEDOWIEZIONE",
            headline: existing
              ? "Zapisany szkic nie był kompletny o północy."
              : "Raport nie został utworzony przed północą.",
            violations: errors,
            warnings: [],
            turning_point: "Raport nie został ukończony przed końcem dnia."
          };
        } else {
          report.evaluation = deterministicEvaluation(report);
          report.verdict = report.evaluation.verdict;
        }
        await persistReport(report);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  function isAutomaticMidnightClosure(report) {
    const headline = String(report?.evaluation?.headline || "");
    return headline === "Raport nie został zamknięty przed północą."
      || headline === "Zapisany szkic nie był kompletny o północy."
      || headline === "Raport nie został utworzony przed północą.";
  }

  function scheduleMidnightRollover() {
    clearTimeout(state.midnightTimer);
    const now = new Date();
    const nextDay = new Date(now);
    nextDay.setHours(24, 0, 1, 0);
    state.midnightTimer = setTimeout(checkDayRollover, nextDay.getTime() - now.getTime());
  }

  async function checkDayRollover() {
    if (state.rolloverRunning) return;
    const newDate = localDateKey(new Date());
    if (newDate === state.todayDate) {
      scheduleMidnightRollover();
      return;
    }

    state.rolloverRunning = true;
    try {
      const previousToday = state.todayDate;
      const wasViewingPreviousToday = state.currentReport?.date === previousToday;
      clearTimeout(state.saveTimer);
      if (state.currentReport && !state.currentReport.closed) await saveDraft(false);
      await materializeMissedReports();
      state.todayDate = newDate;
      if (wasViewingPreviousToday) state.currentDate = newDate;
      configureDates();
      if (wasViewingPreviousToday) openReport(newDate, false);
      else if (state.currentReport) {
        state.currentReport = state.reports.find(report => report.date === state.currentReport.date) || state.currentReport;
        populateReportForm();
        renderEntries();
        renderEvaluation(state.currentReport);
        setReportLocked(state.currentReport.closed);
      }
      renderAll();
      showToast("Rozpoczął się nowy dzień. Poprzedni raport został automatycznie rozliczony.");
    } finally {
      state.rolloverRunning = false;
      scheduleMidnightRollover();
    }
  }

  function defaultReport(date) {
    return normalizeReport({
      id: crypto.randomUUID(),
      date,
      weight: null,
      glucose: null,
      ketones: null,
      weightPhotoPath: null,
      weightPhotoPreview: null,
      entries: [],
      allFoodConfirmed: false,
      homeMinutes: 0,
      gymMinutes: 0,
      gymSession: "",
      gymExercises: [],
      bikeKm: 0,
      bikeMinutes: 0,
      steps: 0,
      trainingNotes: "",
      recoveryDay: false,
      sleepHours: null,
      hunger: null,
      mood: null,
      difficultMoment: "",
      wellbeingNotes: "",
      keto: "",
      turningPoint: "",
      reportCompleteConfirmed: false,
      closed: false,
      closedAt: null,
      verdict: null,
      evaluation: null,
      updatedAt: new Date().toISOString()
    });
  }

  function normalizeReport(report) {
    const normalized = {
      ...report,
      id: report.id || crypto.randomUUID(),
      entries: Array.isArray(report.entries) ? report.entries : [],
      homeMinutes: numberOrZero(report.homeMinutes),
      gymMinutes: numberOrZero(report.gymMinutes),
      bikeKm: numberOrZero(report.bikeKm),
      bikeMinutes: numberOrZero(report.bikeMinutes),
      steps: numberOrZero(report.steps),
      allFoodConfirmed: Boolean(report.allFoodConfirmed),
      reportCompleteConfirmed: Boolean(report.reportCompleteConfirmed),
      recoveryDay: Boolean(report.recoveryDay),
      closed: Boolean(report.closed)
    };
    delete normalized.painMorning;
    delete normalized.painEvening;
    delete normalized.radiation;
    delete normalized.correction;
    if (normalized.evaluation) {
      normalized.evaluation = { ...normalized.evaluation };
      delete normalized.evaluation.correction;
      delete normalized.evaluation.safety_note;
    }
    return normalized;
  }

  function sanitizeReport(report, stripAllPreviews = false) {
    const clone = JSON.parse(JSON.stringify(report));
    delete clone.painMorning;
    delete clone.painEvening;
    delete clone.radiation;
    delete clone.correction;
    if (clone.evaluation) {
      delete clone.evaluation.correction;
      delete clone.evaluation.safety_note;
    }
    if (stripAllPreviews || clone.weightPhotoPath) delete clone.weightPhotoPreview;
    clone.entries = (clone.entries || []).map(entry => {
      if (stripAllPreviews || entry.photoPath) delete entry.photoPreview;
      return entry;
    });
    return clone;
  }

  function openReport(date, shouldNavigate = true) {
    if (!date) return;
    state.currentDate = date;
    state.currentReport = state.reports.find(report => report.date === date) || defaultReport(date);
    el.reportDate.value = date;
    populateReportForm();
    renderEntries();
    renderEvaluation(state.currentReport);
    updateGymPlanBadge();
    setReportLocked(state.currentReport.closed);
    resolveStoredPreviews(state.currentReport);
    if (shouldNavigate) navigate("report");
  }

  async function switchReportDate(date, shouldNavigate = true) {
    if (!date || date === state.currentReport?.date) {
      if (shouldNavigate) navigate("report");
      return;
    }
    clearTimeout(state.saveTimer);
    if (state.currentReport && !state.currentReport.closed) await saveDraft(false);
    openReport(date, shouldNavigate);
  }

  function populateReportForm() {
    const report = state.currentReport;
    el.weight.value = decimalInputValue(report.weight);
    el.glucose.value = valueOrBlank(report.glucose);
    el.ketones.value = decimalInputValue(report.ketones);
    el.homeMinutes.value = numberOrZero(report.homeMinutes);
    el.gymMinutes.value = numberOrZero(report.gymMinutes);
    el.gymSession.value = report.gymSession || "";
    el.bikeKm.value = numberOrZero(report.bikeKm);
    el.bikeMinutes.value = numberOrZero(report.bikeMinutes);
    el.steps.value = numberOrZero(report.steps);
    el.trainingNotes.value = report.trainingNotes || "";
    el.recoveryDay.checked = Boolean(report.recoveryDay);
    el.sleepHours.value = valueOrBlank(report.sleepHours);
    el.hunger.value = valueOrBlank(report.hunger);
    el.mood.value = valueOrBlank(report.mood);
    el.difficultMoment.value = report.difficultMoment || "";
    el.wellbeingNotes.value = report.wellbeingNotes || "";
    el.ketoYes.checked = report.keto === "yes";
    el.ketoNo.checked = report.keto === "no";
    el.turningPoint.value = report.turningPoint || "";
    el.allFoodConfirmed.checked = Boolean(report.allFoodConfirmed);
    el.reportCompleteConfirmed.checked = Boolean(report.reportCompleteConfirmed);
    renderGymExercises(report.gymSession || "", report.gymExercises || []);
    renderWeightPreview(report.weightPhotoPreview);
    updateCalorieTotal();
    el.validationBox.hidden = true;
  }

  function collectReportFromForm() {
    const report = state.currentReport || defaultReport(state.currentDate);
    report.weight = numberOrNull(el.weight.value);
    report.glucose = numberOrNull(el.glucose.value);
    report.ketones = numberOrNull(el.ketones.value);
    report.homeMinutes = numberOrZero(el.homeMinutes.value);
    report.gymMinutes = numberOrZero(el.gymMinutes.value);
    report.gymSession = el.gymSession.value;
    report.gymExercises = collectGymExercises();
    report.bikeKm = numberOrZero(el.bikeKm.value);
    report.bikeMinutes = numberOrZero(el.bikeMinutes.value);
    report.steps = numberOrZero(el.steps.value);
    report.trainingNotes = el.trainingNotes.value.trim();
    report.recoveryDay = el.recoveryDay.checked;
    report.sleepHours = numberOrNull(el.sleepHours.value);
    report.hunger = numberOrNull(el.hunger.value);
    report.mood = numberOrNull(el.mood.value);
    report.difficultMoment = el.difficultMoment.value.trim();
    report.wellbeingNotes = el.wellbeingNotes.value.trim();
    report.keto = document.querySelector('input[name="keto"]:checked')?.value || "";
    report.turningPoint = el.turningPoint.value.trim();
    delete report.painMorning;
    delete report.painEvening;
    delete report.radiation;
    delete report.correction;
    report.allFoodConfirmed = el.allFoodConfirmed.checked;
    report.reportCompleteConfirmed = el.reportCompleteConfirmed.checked;
    state.currentReport = report;
    return report;
  }

  function renderGymExercises(session, saved = state.currentReport?.gymExercises || []) {
    const exercises = GYM_PLANS[session] || [];
    el.gymExercisesPanel.hidden = !exercises.length;
    if (!exercises.length) {
      el.gymExercisesList.innerHTML = "";
      return;
    }
    el.gymExercisesList.innerHTML = exercises.map(name => {
      const item = saved.find(entry => entry.name === name) || {};
      return `
        <div class="exercise-row" data-exercise="${escapeAttribute(name)}">
          <input class="exercise-done" type="checkbox" ${item.done ? "checked" : ""} aria-label="Wykonane: ${escapeAttribute(name)}">
          <span class="exercise-name">${escapeHtml(name)}</span>
          <label class="exercise-field">serie<input class="exercise-sets" type="number" min="0" max="20" step="1" value="${valueOrBlank(item.sets)}"></label>
          <label class="exercise-field">powt.<input class="exercise-reps" type="text" inputmode="numeric" value="${escapeAttribute(item.reps || "")}"></label>
          <label class="exercise-field">kg<input class="exercise-load" type="number" min="0" max="1000" step="0.5" value="${valueOrBlank(item.load)}"></label>
        </div>`;
    }).join("");
  }

  function collectGymExercises() {
    return [...el.gymExercisesList.querySelectorAll(".exercise-row")].map(row => ({
      name: row.dataset.exercise,
      done: row.querySelector(".exercise-done").checked,
      sets: numberOrNull(row.querySelector(".exercise-sets").value),
      reps: row.querySelector(".exercise-reps").value.trim(),
      load: numberOrNull(row.querySelector(".exercise-load").value)
    }));
  }

  function renderTrainingLibrary(session = state.trainingSession) {
    if (!GYM_PLANS[session]) session = "A";
    state.trainingSession = session;
    const exercises = GYM_PLANS[session];
    el.trainingTabs.querySelectorAll("[data-training-session]").forEach(button => {
      const active = button.dataset.trainingSession === session;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    el.trainingSessionTitle.textContent = `Plan ${session}`;
    el.trainingExerciseCount.textContent = `${exercises.length} ćwiczeń`;
    el.trainingExerciseList.innerHTML = exercises.map((name, index) => {
      const video = TRAINING_VIDEOS[name];
      return `
        <article class="training-exercise-item">
          <span class="training-exercise-number">${String(index + 1).padStart(2, "0")}</span>
          <div class="training-exercise-copy">
            <strong>${escapeHtml(name)}</strong>
            <small>${escapeHtml(video?.note || "Film pokazuje ustawienie i wykonanie ćwiczenia.")}</small>
          </div>
          <button class="secondary-button compact training-video-button" type="button" data-training-video="${escapeAttribute(name)}" ${video ? "" : "disabled"}>▶ Film</button>
        </article>`;
    }).join("");
  }

  function openTrainingVideo(name) {
    const video = TRAINING_VIDEOS[name];
    if (!video) return;
    el.trainingVideoTitle.textContent = name;
    el.trainingVideoFrame.title = `Technika ćwiczenia: ${name}`;
    el.trainingVideoFrame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.videoId)}?rel=0`;
    el.trainingVideoLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(video.videoId)}`;
    el.trainingVideoDialog.showModal();
  }

  function closeTrainingVideoDialog() {
    el.trainingVideoDialog.close();
  }

  function clearTrainingVideo() {
    el.trainingVideoFrame.src = "";
  }

  function scheduleSave() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(() => saveDraft(false), 650);
  }

  async function saveDraft(notify = false) {
    if (!state.currentReport || state.currentReport.closed) return;
    const report = collectReportFromForm();
    await persistReport(report);
    if (notify) showToast("Szkic zapisany.");
    renderDashboard();
  }

  function openEntryDialog(entryId = null) {
    if (state.currentReport?.closed) return;
    const entry = state.currentReport.entries.find(item => item.id === entryId);
    state.pendingEntryFile = null;
    state.pendingIngredients = Array.isArray(entry?.ingredients)
      ? entry.ingredients.map(item => ({ ...item }))
      : [];
    el.entryDialogTitle.textContent = entry ? "Edytuj pozycję" : "Dodaj pozycję";
    el.entryId.value = entry?.id || "";
    el.entryType.value = entry?.type || "meal";
    el.entryTime.value = entry?.time || currentTimeValue();
    el.entryDescription.value = entry?.description || "";
    el.entryGrams.value = valueOrBlank(entry?.grams);
    el.entryCalories.value = valueOrBlank(entry?.calories);
    el.entryNetCarbs.value = valueOrBlank(entry?.netCarbs);
    el.entryPhoto.value = "";
    populateFoodDatabase();
    el.mealPresetSelect.value = "";
    renderMealPresetPreview();
    el.ingredientAmount.value = "";
    renderIngredientsCalculator();
    renderEntryPhotoPreview(entry?.photoPreview);
    el.entryValidation.hidden = true;
    el.entryDialog.showModal();
  }

  function closeEntryDialog() {
    state.pendingEntryFile = null;
    state.pendingIngredients = [];
    el.entryDialog.close();
  }

  function populateFoodDatabase(selectedId = el.ingredientProduct.value) {
    const foods = availableFoods();
    el.ingredientProduct.innerHTML = Object.entries(FOOD_CATEGORY_LABELS).map(([category, label]) => {
      const products = Object.entries(foods)
        .filter(([, product]) => product.category === category)
        .sort(([, first], [, second]) => first.name.localeCompare(second.name, "pl"));
      if (!products.length) return "";
      return `<optgroup label="${escapeAttribute(label)}">${products
        .map(([id, product]) => `<option value="${escapeAttribute(id)}">${escapeHtml(product.name)}</option>`)
        .join("")}</optgroup>`;
    }).join("");
    if (selectedId && foods[selectedId]) el.ingredientProduct.value = selectedId;
    renderIngredientHint();
  }

  function populateMealPresets() {
    el.mealPresetSelect.innerHTML = '<option value="">Wybierz gotowy zestaw</option>' + Object.entries(MEAL_PRESET_GROUPS)
      .map(([group, label]) => {
        const options = Object.entries(MEAL_PRESETS)
          .filter(([, preset]) => preset.group === group)
          .map(([id, preset]) => `<option value="${escapeAttribute(id)}">${escapeHtml(preset.name)}</option>`)
          .join("");
        return `<optgroup label="${escapeAttribute(label)}">${options}</optgroup>`;
      })
      .join("");
    renderMealPresetPreview();
  }

  function renderMealPresetPreview() {
    const preset = MEAL_PRESETS[el.mealPresetSelect.value];
    el.loadMealPresetButton.disabled = !preset;
    if (!preset) {
      el.mealPresetPreview.innerHTML = "Wybierz zestaw, aby zobaczyć gramatury i wartości.";
      return;
    }
    const foods = availableFoods();
    const ingredients = preset.ingredients.map(item => ({ ...item, product: foods[item.productId] })).filter(item => item.product);
    const calories = ingredients.reduce((sum, item) => sum + Math.round(item.amount * item.product.kcal), 0);
    const carbs = ingredients.reduce((sum, item) => sum + Math.round(item.amount * item.product.carbs * 10) / 10, 0);
    el.mealPresetPreview.innerHTML = `
      <strong>${escapeHtml(preset.name)}</strong>
      <span>${ingredients.map(item => `${escapeHtml(item.product.name)} ${numberFormat(item.amount, item.amount % 1 ? 1 : 0)} ${escapeHtml(item.product.unit)}`).join(" · ")}</span>
      <small>${numberFormat(calories, 0)} kcal · ${numberFormat(carbs, 1)} g węglowodanów netto</small>
    `;
  }

  function renderIngredientHint() {
    const foods = availableFoods();
    const product = foods[el.ingredientProduct.value] || Object.values(foods)[0];
    if (!product) return;
    el.ingredientHint.textContent = product.custom
      ? `Podaj ilość w ${product.unit}. Wartości zapisane z etykiety.`
      : `Podaj ilość w ${product.unit}. Wartości orientacyjne — etykieta ma pierwszeństwo.`;
    el.deleteCustomProductButton.hidden = !product.custom;
  }

  function renderCustomProductLabels() {
    const unit = el.customProductUnit.value;
    const basis = unit === "szt." ? "1 sztukę" : `100 ${unit}`;
    el.customProductCaloriesLabel.textContent = `Kalorie na ${basis}`;
    el.customProductCarbsLabel.textContent = `Węglowodany netto na ${basis}`;
  }

  async function saveCustomProduct() {
    const name = el.customProductName.value.trim();
    const unit = el.customProductUnit.value;
    const caloriesAtBasis = numberOrNull(el.customProductCalories.value);
    const carbsAtBasis = numberOrNull(el.customProductCarbs.value);
    const validUnit = ["g", "ml", "szt."].includes(unit);
    if (!name || !validUnit || caloriesAtBasis === null || caloriesAtBasis < 0 || carbsAtBasis === null || carbsAtBasis < 0) {
      el.customProductMessage.textContent = "Podaj nazwę, jednostkę, kalorie i węglowodany netto z etykiety.";
      return;
    }
    if (caloriesAtBasis > 2000 || carbsAtBasis > 100) {
      el.customProductMessage.textContent = "Sprawdź wartości: maksymalnie 2000 kcal i 100 g węglowodanów dla podanej podstawy.";
      return;
    }

    const existing = Object.entries(state.customFoods).find(([, product]) => !product.deleted && product.name.toLocaleLowerCase("pl") === name.toLocaleLowerCase("pl"));
    const id = existing?.[0] || `custom_${crypto.randomUUID()}`;
    const divisor = unit === "szt." ? 1 : 100;
    state.customFoods[id] = {
      name,
      category: "custom",
      unit,
      kcal: caloriesAtBasis / divisor,
      carbs: carbsAtBasis / divisor,
      custom: true,
      deleted: false,
      updatedAt: new Date().toISOString()
    };

    el.saveCustomProductButton.disabled = true;
    try {
      await persistCustomFoods();
      populateFoodDatabase(id);
      el.customProductName.value = "";
      el.customProductCalories.value = "";
      el.customProductCarbs.value = "";
      el.customProductMessage.textContent = existing ? "Produkt zaktualizowany." : "Produkt zapisany i dodany do listy.";
      showToast(existing ? "Produkt zaktualizowany." : "Mój produkt zapisany.");
    } catch (error) {
      console.error(error);
      el.customProductMessage.textContent = "Zapis lokalny wykonany, ale synchronizacja z chmurą nie powiodła się.";
    } finally {
      el.saveCustomProductButton.disabled = false;
    }
  }

  async function deleteSelectedCustomProduct() {
    const id = el.ingredientProduct.value;
    const product = state.customFoods[id];
    if (!product || product.deleted) return;
    if (!window.confirm(`Usunąć własny produkt „${product.name}”?`)) return;
    state.customFoods[id] = { ...product, deleted: true, updatedAt: new Date().toISOString() };
    try {
      await persistCustomFoods();
    } catch (error) {
      console.error(error);
      showToast("Usunięto lokalnie. Synchronizacja z chmurą nie powiodła się.");
    }
    populateFoodDatabase();
    showToast("Własny produkt usunięty.");
  }

  function addIngredient() {
    const productId = el.ingredientProduct.value;
    const product = availableFoods()[productId];
    const amount = numberOrNull(el.ingredientAmount.value);
    if (!product || amount === null || amount <= 0) {
      showEntryError("Wybierz produkt i podaj jego ilość.");
      return;
    }
    state.pendingIngredients.push(createIngredient(productId, amount));
    el.ingredientAmount.value = "";
    el.entryValidation.hidden = true;
    applyIngredientTotals();
    renderIngredientsCalculator();
  }

  function createIngredient(productId, amount) {
    const product = availableFoods()[productId];
    if (!product) return null;
    return {
      id: crypto.randomUUID(),
      productId,
      name: product.name,
      amount,
      unit: product.unit,
      calories: Math.round(amount * product.kcal),
      netCarbs: Math.round(amount * product.carbs * 10) / 10
    };
  }

  function applyMealPreset(presetId) {
    const preset = MEAL_PRESETS[presetId];
    if (!preset) return;
    if (state.pendingIngredients.length && !window.confirm("Zastąpić obecne składniki wybranym zestawem?")) return;
    const ingredients = preset.ingredients
      .map(item => createIngredient(item.productId, item.amount))
      .filter(Boolean);
    if (ingredients.length !== preset.ingredients.length) {
      showEntryError("Nie udało się wczytać wszystkich składników zestawu.");
      return;
    }
    state.pendingIngredients = ingredients;
    el.entryType.value = preset.entryType || "meal";
    el.entryDescription.value = preset.name;
    el.entryValidation.hidden = true;
    applyIngredientTotals();
    renderIngredientsCalculator();
    showToast(`${preset.name} — zestaw wczytany.`);
  }

  function removeIngredient(id) {
    state.pendingIngredients = state.pendingIngredients.filter(item => item.id !== id);
    applyIngredientTotals();
    renderIngredientsCalculator();
  }

  function updateIngredientAmount(id, rawAmount) {
    const item = state.pendingIngredients.find(ingredient => ingredient.id === id);
    const amount = numberOrNull(rawAmount);
    if (!item || amount === null || amount <= 0) {
      showEntryError("Ilość składnika musi być większa od zera.");
      renderIngredientsCalculator();
      return;
    }
    const product = availableFoods()[item.productId];
    const caloriesPerUnit = product?.kcal ?? (item.amount ? numberOrZero(item.calories) / item.amount : 0);
    const carbsPerUnit = product?.carbs ?? (item.amount ? numberOrZero(item.netCarbs) / item.amount : 0);
    item.amount = amount;
    item.calories = Math.round(amount * caloriesPerUnit);
    item.netCarbs = Math.round(amount * carbsPerUnit * 10) / 10;
    el.entryValidation.hidden = true;
    applyIngredientTotals();
    renderIngredientsCalculator();
  }

  function applyIngredientTotals() {
    if (!state.pendingIngredients.length) return;
    const calories = state.pendingIngredients.reduce((sum, item) => sum + numberOrZero(item.calories), 0);
    const carbs = state.pendingIngredients.reduce((sum, item) => sum + numberOrZero(item.netCarbs), 0);
    const measurableMass = state.pendingIngredients
      .filter(item => item.unit === "g" || item.unit === "ml")
      .reduce((sum, item) => sum + numberOrZero(item.amount), 0);
    el.entryCalories.value = Math.round(calories);
    el.entryNetCarbs.value = (Math.round(carbs * 10) / 10).toString();
    if (measurableMass) el.entryGrams.value = Math.round(measurableMass);
    el.entryDescription.value = state.pendingIngredients
      .map(item => `${item.name} ${numberFormat(item.amount, item.amount % 1 ? 1 : 0)} ${item.unit}`)
      .join(", ");
  }

  function renderIngredientsCalculator() {
    if (!state.pendingIngredients.length) {
      el.ingredientsList.innerHTML = '<div class="ingredient-hint">Dodaj składniki, a kalorie i węglowodany uzupełnią się automatycznie.</div>';
      return;
    }
    el.ingredientsList.innerHTML = state.pendingIngredients.map(item => `
      <div class="ingredient-row">
        <div class="ingredient-details">
          <span>${escapeHtml(item.name)}</span>
          <label class="ingredient-amount-editor">
            <input type="text" inputmode="decimal" autocomplete="off" value="${escapeAttribute(decimalInputValue(item.amount))}" data-ingredient-amount="${escapeAttribute(item.id)}" aria-label="Ilość: ${escapeAttribute(item.name)}">
            <small>${escapeHtml(item.unit)}</small>
          </label>
        </div>
        <strong>${numberFormat(item.calories, 0)} kcal</strong>
        <button class="icon-button" type="button" data-remove-ingredient="${item.id}" aria-label="Usuń składnik">×</button>
      </div>
    `).join("");
    el.ingredientsList.querySelectorAll("[data-remove-ingredient]").forEach(button => {
      button.addEventListener("click", () => removeIngredient(button.dataset.removeIngredient));
    });
    el.ingredientsList.querySelectorAll("[data-ingredient-amount]").forEach(input => {
      input.addEventListener("change", () => updateIngredientAmount(input.dataset.ingredientAmount, input.value));
    });
  }

  async function handleEntryPhotoPreview(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showEntryError("Wybierz plik graficzny.");
      return;
    }
    state.pendingEntryFile = file;
    renderEntryPhotoPreview(URL.createObjectURL(file));
  }

  async function saveEntryFromDialog() {
    const description = el.entryDescription.value.trim();
    const calories = numberOrNull(el.entryCalories.value);
    if (!el.entryTime.value || !description || calories === null) {
      showEntryError("Uzupełnij godzinę, opis i kalorie.");
      return;
    }

    el.saveEntryButton.disabled = true;
    try {
      const existingId = el.entryId.value;
      const existing = state.currentReport.entries.find(item => item.id === existingId);
      const entry = {
        ...(existing || {}),
        id: existingId || crypto.randomUUID(),
        type: el.entryType.value,
        time: el.entryTime.value,
        description,
        grams: numberOrNull(el.entryGrams.value),
        calories,
        netCarbs: numberOrNull(el.entryNetCarbs.value),
        ingredients: state.pendingIngredients.map(item => ({ ...item })),
        photoPath: existing?.photoPath || null,
        photoPreview: existing?.photoPreview || null
      };

      if (state.pendingEntryFile) {
        const photo = await storePhoto(state.pendingEntryFile, "meal", entry.id);
        entry.photoPath = photo.path;
        entry.photoPreview = photo.preview;
      }

      const index = state.currentReport.entries.findIndex(item => item.id === entry.id);
      if (index >= 0) state.currentReport.entries[index] = entry;
      else state.currentReport.entries.push(entry);
      state.currentReport.entries.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
      await persistReport(collectReportFromForm());
      renderEntries();
      updateCalorieTotal();
      closeEntryDialog();
      showToast("Pozycja zapisana.");
    } catch (error) {
      console.error(error);
      showEntryError("Nie udało się zapisać zdjęcia lub pozycji.");
    } finally {
      el.saveEntryButton.disabled = false;
    }
  }

  function renderEntries() {
    const entries = state.currentReport?.entries || [];
    if (!entries.length) {
      el.entriesList.innerHTML = '<div class="empty-state">Brak wpisów. Dodaj kawę, posiłki i wszystkie napoje.</div>';
      updateCalorieTotal();
      return;
    }

    el.entriesList.innerHTML = entries.map(entry => `
      <article class="entry-item">
        <div class="entry-top">
          <span class="entry-time">${escapeHtml(entry.time || "—")}</span>
          <div>
            <h4>${escapeHtml(TYPE_LABELS[entry.type] || "Pozycja")} · ${numberFormat(entry.calories, 0)} kcal</h4>
            <p>${escapeHtml(entry.description || "")}${entry.photoPath || entry.photoPreview ? " · 📷" : ""}</p>
          </div>
          <div class="entry-actions">
            <button class="icon-button" type="button" data-edit-entry="${entry.id}" aria-label="Edytuj">✎</button>
            <button class="icon-button" type="button" data-delete-entry="${entry.id}" aria-label="Usuń">×</button>
          </div>
        </div>
      </article>
    `).join("");

    el.entriesList.querySelectorAll("[data-edit-entry]").forEach(button => {
      button.addEventListener("click", () => openEntryDialog(button.dataset.editEntry));
    });
    el.entriesList.querySelectorAll("[data-delete-entry]").forEach(button => {
      button.addEventListener("click", () => deleteEntry(button.dataset.deleteEntry));
    });
    updateCalorieTotal();
  }

  async function deleteEntry(entryId) {
    if (!confirm("Usunąć tę pozycję z raportu?")) return;
    state.currentReport.entries = state.currentReport.entries.filter(entry => entry.id !== entryId);
    await persistReport(collectReportFromForm());
    renderEntries();
  }

  async function handleWeightPhoto(event) {
    const file = event.target.files?.[0];
    if (!file || state.currentReport?.closed) return;
    try {
      const photo = await storePhoto(file, "weight", "morning");
      state.currentReport.weightPhotoPath = photo.path;
      state.currentReport.weightPhotoPreview = photo.preview;
      renderWeightPreview(photo.preview);
      await persistReport(collectReportFromForm());
    } catch (error) {
      console.error(error);
      showToast("Nie udało się zapisać zdjęcia.");
    }
  }

  async function storePhoto(file, kind, itemId) {
    const compressed = await compressImage(file);
    const preview = await blobToDataUrl(compressed);
    if (!state.cloudReady || !state.user || !state.supabase) {
      return { path: null, preview };
    }

    const path = await uploadBlob(compressed, state.currentReport.id, kind, itemId);
    return { path, preview };
  }

  async function uploadBlob(blob, reportId, kind, itemId) {
    const path = `${state.user.id}/${reportId}/${kind}-${itemId}-${Date.now()}.jpg`;
    const { error } = await state.supabase.storage
      .from("report-photos")
      .upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: false });
    if (error) throw error;
    return path;
  }

  async function resolveStoredPreviews(report) {
    if (!state.supabase || !state.user) return;
    const jobs = [];
    if (report.weightPhotoPath && !report.weightPhotoPreview) {
      jobs.push(resolvePhoto(report.weightPhotoPath).then(url => { report.weightPhotoPreview = url; }));
    }
    report.entries.forEach(entry => {
      if (entry.photoPath && !entry.photoPreview) {
        jobs.push(resolvePhoto(entry.photoPath).then(url => { entry.photoPreview = url; }));
      }
    });
    await Promise.allSettled(jobs);
    if (state.currentReport?.id === report.id) {
      renderWeightPreview(report.weightPhotoPreview);
    }
  }

  async function resolvePhoto(path) {
    const { data, error } = await state.supabase.storage.from("report-photos").createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  }

  async function compressImage(file) {
    if (file.size > 12 * 1024 * 1024) throw new Error("Plik jest za duży");
    try {
      const image = await createImageBitmap(file);
      const maxSide = 1440;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      image.close();
      return await new Promise((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Błąd kompresji")), "image/jpeg", .78);
      });
    } catch {
      return file;
    }
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function renderWeightPreview(src) {
    el.weightPhotoPreview.innerHTML = src ? `<img src="${escapeAttribute(src)}" alt="Zdjęcie pomiaru masy">` : "";
  }

  function renderEntryPhotoPreview(src) {
    el.entryPhotoPreview.innerHTML = src ? `<img src="${escapeAttribute(src)}" alt="Zdjęcie pozycji">` : "";
  }

  function updateCalorieTotal() {
    const total = totalCalories(state.currentReport);
    el.calorieSum.textContent = numberFormat(total, 0);
    const totalBox = el.calorieSum.closest(".calorie-total");
    totalBox.style.borderColor = total > PROJECT.calorieTarget ? "rgba(255,94,108,.55)" : "";
  }

  function validateReport(report) {
    const errors = [];
    if (report.weight === null) errors.push("Brak porannej masy ciała.");
    else if (report.weight < 40 || report.weight > 200) errors.push("Masa ciała musi mieścić się w zakresie 40–200 kg.");
    if (!report.entries.length) errors.push("Brak wpisów jedzenia i napojów.");
    if (!report.allFoodConfirmed) errors.push("Nie potwierdzono kompletności jedzenia i napojów.");
    if (report.sleepHours === null) errors.push("Brak liczby godzin snu.");
    if (report.hunger === null) errors.push("Brak poziomu głodu.");
    if (report.mood === null) errors.push("Brak oceny samopoczucia.");
    if (report.recoveryDay && !report.trainingNotes) errors.push("Dzień regeneracyjny wymaga podania powodu w notatce treningowej.");
    if (!report.difficultMoment) errors.push("Nie opisano trudnego momentu dnia.");
    if (!report.keto) errors.push("Nie zaznaczono, czy utrzymano keto.");
    if (!report.reportCompleteConfirmed) errors.push("Nie potwierdzono kompletności raportu.");
    return errors;
  }

  async function closeReport() {
    if (state.currentReport?.closed) return;
    const report = collectReportFromForm();
    const errors = validateReport(report);
    if (errors.length) {
      el.validationBox.hidden = false;
      el.validationBox.innerHTML = `<strong>Raport jest niekompletny:</strong><ul>${errors.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      el.validationBox.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    el.validationBox.hidden = true;
    el.closeReportButton.disabled = true;
    el.closeReportButton.textContent = "Analizuję dzień…";

    try {
      const hardEvaluation = deterministicEvaluation(report);
      let evaluation = hardEvaluation;
      if (state.cloudReady && state.user && state.supabase) {
        try {
          const { data, error } = await state.supabase.functions.invoke(CONFIG.edgeFunctionName || "analyze-report", {
            body: { mode: "daily", report: sanitizeReport(report, true), project: PROJECT, hardChecks: hardEvaluation }
          });
          if (error) throw error;
          if (data?.evaluation) evaluation = enforceHardChecks(data.evaluation, hardEvaluation);
        } catch (error) {
          console.error(error);
          showToast("AI jest chwilowo niedostępne — zastosowano twarde reguły projektu.");
        }
      }

      report.closed = true;
      report.closedAt = new Date().toISOString();
      report.evaluation = evaluation;
      report.verdict = evaluation.verdict;
      await persistReport(report);
      if (parseLocalDate(report.date).getDay() === 0 && state.cloudReady && state.user) {
        el.closeReportButton.textContent = "Podsumowuję tydzień…";
        await generateWeeklySummary(report.date, false);
      }
      renderEvaluation(report);
      setReportLocked(true);
      renderAll();
      showToast(`Raport zamknięty: ${report.verdict}`);
    } finally {
      el.closeReportButton.disabled = false;
      el.closeReportButton.textContent = "Zamknij raport i wydaj werdykt";
    }
  }

  function deterministicEvaluation(report) {
    const violations = [];
    const warnings = [];
    const calories = totalCalories(report);
    const gymPlanned = PROJECT.gymDays.includes(parseLocalDate(report.date).getDay());
    const expectedSession = expectedGymSession(report.date);

    if (calories > PROJECT.calorieTarget) violations.push(`Przekroczono limit ${PROJECT.calorieTarget} kcal: wpisano ${numberFormat(calories, 0)} kcal.`);
    if (calories < PROJECT.calorieFloor) warnings.push(`Kaloryczność ${numberFormat(calories, 0)} kcal jest poniżej docelowego zakresu ${PROJECT.calorieFloor}–${PROJECT.calorieTarget} kcal. Nie zmienia to werdyktu, ale nie powinno powtarzać się regularnie.`);
    if (report.keto !== "yes") violations.push("Nie utrzymano keto.");
    const movementIssues = [];
    if (report.homeMinutes < PROJECT.homeMinutesMin) movementIssues.push(`Trening domowy krótszy niż ${PROJECT.homeMinutesMin} minut.`);
    if (report.bikeKm < PROJECT.bikeKmMin) movementIssues.push(`Rower poniżej planu ${PROJECT.bikeKmMin} km.`);
    if (gymPlanned && report.gymMinutes <= 0) movementIssues.push("Nie wykonano zaplanowanej siłowni.");
    if (gymPlanned && !report.gymSession) movementIssues.push("Nie wskazano sesji siłowni A/B/C.");
    if (gymPlanned && report.gymSession && report.gymSession !== expectedSession) movementIssues.push(`Wykonano plan ${report.gymSession} zamiast zaplanowanego planu ${expectedSession}.`);
    if (gymPlanned && report.gymSession && (report.gymExercises || []).some(item => !item.done)) movementIssues.push("Nie wykonano wszystkich ćwiczeń zaplanowanej sesji siłowni.");
    if (gymPlanned && report.gymSession && (report.gymExercises || []).some(item => item.done && (item.sets === null || !item.reps || item.load === null))) movementIssues.push("Nie wpisano kompletu serii, powtórzeń i obciążeń dla wykonanych ćwiczeń.");
    if (report.recoveryDay) {
      if (movementIssues.length) warnings.push(`Ruch ograniczony w uzasadnionym dniu regeneracyjnym: ${movementIssues.join(" ")}`);
    } else {
      violations.push(...movementIssues);
    }

    const verdict = violations.length ? "NIEDOWIEZIONE" : "DOWIEZIONE";

    return {
      verdict,
      headline: verdict === "DOWIEZIONE"
        ? warnings.length ? "Cel dnia został dowieziony, ale raport zawiera ważne ostrzeżenia." : "Plan został wykonany. To jest dzień przybliżający Cię do 80 kg."
        : "Nie dowiozłeś założeń. Nazywamy decyzje wprost i wracamy do planu od następnej decyzji.",
      violations,
      warnings,
      turning_point: report.turningPoint || (violations.length ? "Wskaż dokładny moment pierwszego odejścia od planu." : "Nie odnotowano odejścia od planu.")
    };
  }

  function enforceHardChecks(aiEvaluation, hardEvaluation) {
    const warnings = Array.from(new Set([...(hardEvaluation.warnings || []), ...(aiEvaluation.warnings || [])]));
    return {
      verdict: hardEvaluation.verdict,
      headline: aiEvaluation.headline || hardEvaluation.headline,
      violations: hardEvaluation.violations || [],
      warnings,
      turning_point: aiEvaluation.turning_point || hardEvaluation.turning_point
    };
  }

  function renderEvaluation(report) {
    if (!report?.evaluation) {
      el.evaluationCard.hidden = true;
      el.reopenReportButton.hidden = true;
      return;
    }
    const evaluation = report.evaluation;
    const delivered = evaluation.verdict === "DOWIEZIONE";
    el.evaluationCard.hidden = false;
    el.evaluationVerdict.textContent = evaluation.verdict;
    el.evaluationVerdict.className = delivered ? "verdict-success" : "verdict-danger";
    el.evaluationHeadline.textContent = evaluation.headline || "";
    el.evaluationDetails.innerHTML = `
      ${(evaluation.violations || []).length ? `<ul class="evaluation-list">${evaluation.violations.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      ${(evaluation.warnings || []).length ? `<div class="evaluation-warning"><strong>Ostrzeżenia:</strong><ul>${evaluation.warnings.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
      <div class="evaluation-line"><strong>Moment:</strong><br>${escapeHtml(evaluation.turning_point || "—")}</div>
    `;
    const isToday = report.date === state.todayDate;
    const canEdit = canEditClosedReport(report);
    el.reopenReportButton.hidden = !report.closed || !canEdit;
    el.reopenReportButton.textContent = isToday
      ? "Popraw i przelicz dzisiejszy raport"
      : "Uzupełnij i przelicz ten raport";
  }

  async function reopenCurrentReport() {
    const report = state.currentReport;
    const isToday = report?.date === state.todayDate;
    if (!report?.closed || !canEditClosedReport(report)) return;
    const question = isToday
      ? "Otworzyć dzisiejszy raport do poprawy i ponownego przeliczenia? Wszystkie wpisane dane zostaną zachowane."
      : `Otworzyć raport ${formatShortDate(report.date)} do uzupełnienia i ponownego przeliczenia? Wszystkie odzyskane dane zostaną zachowane.`;
    if (!window.confirm(question)) return;
    report.closed = false;
    report.closedAt = null;
    report.verdict = null;
    report.evaluation = null;
    await persistReport(report);
    setReportLocked(false);
    renderEvaluation(report);
    renderAll();
    showToast("Raport otwarty. Dane zostały zachowane.");
  }

  function canEditClosedReport(report) {
    if (!report) return false;
    const editableDates = Array.isArray(PROJECT.editableReportDates) ? PROJECT.editableReportDates : [];
    return report.date === state.todayDate
      || editableDates.includes(report.date)
      || isAutomaticMidnightClosure(report);
  }

  function setReportLocked(locked) {
    const controls = el.reportForm.querySelectorAll("input, textarea, select, button");
    controls.forEach(control => { control.disabled = locked; });
    el.reportDate.disabled = false;
    el.closedBanner.hidden = !locked;
    if (locked) {
      el.closedBanner.innerHTML = `<strong>Raport zamknięty: ${escapeHtml(state.currentReport.verdict || "—")}</strong><span>${formatDateTime(state.currentReport.closedAt)}</span>`;
    }
  }

  function renderAll() {
    renderDashboard();
    renderHistory();
    renderCloudState();
    if (state.currentReport) {
      renderEntries();
      renderEvaluation(state.currentReport);
    }
  }

  function renderDashboard() {
    const sorted = [...state.reports].sort((a, b) => a.date.localeCompare(b.date));
    const weighted = sorted.filter(report => hasNumericMeasurement(report.weight));
    const glucoseReports = sorted.filter(report => hasNumericMeasurement(report.glucose)).slice(-30);
    const ketoneReports = sorted.filter(report => hasNumericMeasurement(report.ketones)).slice(-30);
    const latest = weighted.at(-1);
    const current = latest ? Number(latest.weight) : PROJECT.startWeight;
    const lost = PROJECT.startWeight - current;
    const remaining = Math.max(0, current - PROJECT.targetWeight);
    const totalPath = PROJECT.startWeight - PROJECT.targetWeight;
    const progress = clamp((lost / totalPath) * 100, 0, 100);
    const today = state.reports.find(report => report.date === localDateKey(new Date()));
    const todayOpen = today && !today.closed;
    const isOverdue = new Date().getHours() >= PROJECT.reportDeadlineHour && (!today || todayOpen);

    el.currentWeight.textContent = `${numberFormat(current, 2)} kg`;
    el.weightDelta.textContent = `Zmiana: ${lost >= 0 ? "−" : "+"}${numberFormat(Math.abs(lost), 2)} kg`;
    el.toGoal.textContent = `${numberFormat(remaining, 2)} kg`;
    el.progressPercent.textContent = `${numberFormat(progress, 0)}%`;
    el.progressBar.style.width = `${progress}%`;
    el.streakValue.textContent = `${calculateStreak(sorted)} dni`;
    el.todayVerdict.textContent = today?.verdict || "OTWARTY";
    el.todayVerdict.className = today?.verdict === "DOWIEZIONE" ? "verdict-success" : today?.verdict === "NIEDOWIEZIONE" ? "verdict-danger" : "verdict-neutral";
    el.todayCalories.textContent = `${numberFormat(totalCalories(today), 0)} / ${PROJECT.calorieTarget} kcal`;
    el.overdueBox.hidden = !isOverdue;

    renderRecentDays(sorted);
    renderWeightChart(weighted.slice(-30));
    renderMeasurementChart({
      reports: glucoseReports,
      field: "glucose",
      canvas: el.glucoseChart,
      empty: el.glucoseChartEmpty,
      latest: el.glucoseChartLatest,
      stateKey: "glucoseChart",
      color: "#55a7ff",
      background: "rgba(85,167,255,.12)",
      unit: "mg/dl",
      digits: 0,
      floorAtZero: false
    });
    renderMeasurementChart({
      reports: ketoneReports,
      field: "ketones",
      canvas: el.ketoneChart,
      empty: el.ketoneChartEmpty,
      latest: el.ketoneChartLatest,
      stateKey: "ketoneChart",
      color: "#3ddc97",
      background: "rgba(61,220,151,.12)",
      unit: "mmol/l",
      digits: 1,
      floorAtZero: true
    });
  }

  function renderRecentDays(reports) {
    const items = [...reports].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    if (!items.length) {
      el.recentDays.innerHTML = '<div class="empty-state">Pierwszy raport utworzy historię projektu.</div>';
      return;
    }
    el.recentDays.innerHTML = items.map(report => `
      <div class="recent-item">
        <div><strong>${formatShortDate(report.date)}</strong><p>${numberFormat(totalCalories(report), 0)} kcal · ${hasNumericMeasurement(report.weight) ? `${numberFormat(report.weight, 2)} kg` : "bez masy"}</p></div>
        ${verdictBadge(report.verdict)}
      </div>
    `).join("");
  }

  function renderWeightChart(reports) {
    if (!window.Chart || !el.weightChart) return;
    if (state.chart) state.chart.destroy();
    const baseline = reports.length ? Number(reports[0].weight) : Number(PROJECT.startWeight);
    const changes = reports.map(report => Number(report.weight) - baseline);
    const maxAbsoluteChange = changes.length ? Math.max(...changes.map(Math.abs)) : 0;
    const range = Math.max(0.5, Math.ceil(maxAbsoluteChange * 2) / 2);
    el.weightChartBaseline.textContent = `0 = ${numberFormat(baseline, 2)} kg`;
    const context = el.weightChart.getContext("2d");
    state.chart = new window.Chart(context, {
      type: "line",
      data: {
        labels: reports.map(report => formatShortDate(report.date)),
        datasets: [{
          data: changes,
          borderColor: "#ff5a1f",
          backgroundColor: "rgba(255,90,31,.13)",
          pointBackgroundColor: "#ff8b60",
          pointRadius: 3,
          borderWidth: 2,
          fill: true,
          tension: .28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => {
                const report = reports[context.dataIndex];
                return `${numberFormat(report.weight, 2)} kg · zmiana ${formatSignedValue(context.parsed.y, 2)} kg`;
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: "#7f8998", maxRotation: 0 }, grid: { display: false } },
          y: {
            min: -range,
            max: range,
            ticks: {
              color: "#7f8998",
              callback: value => `${formatSignedValue(value, 1)} kg`
            },
            grid: {
              color: context => Number(context.tick?.value) === 0 ? "rgba(255,122,61,.55)" : "rgba(255,255,255,.05)",
              lineWidth: context => Number(context.tick?.value) === 0 ? 2 : 1
            }
          }
        }
      }
    });
  }

  function renderMeasurementChart({ reports, field, canvas, empty, latest, stateKey, color, background, unit, digits, floorAtZero }) {
    if (!window.Chart || !canvas) return;
    if (state[stateKey]) state[stateKey].destroy();
    const hasData = reports.length > 0;
    canvas.hidden = !hasData;
    empty.hidden = hasData;
    latest.textContent = hasData
      ? `${numberFormat(reports.at(-1)[field], digits)} ${unit}`
      : unit;
    if (!hasData) {
      state[stateKey] = null;
      return;
    }

    state[stateKey] = new window.Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: reports.map(report => formatShortDate(report.date)),
        datasets: [{
          data: reports.map(report => Number(report[field])),
          borderColor: color,
          backgroundColor: background,
          pointBackgroundColor: color,
          pointRadius: 3,
          borderWidth: 2,
          fill: true,
          tension: .28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: context => `${numberFormat(context.parsed.y, digits)} ${unit}` } }
        },
        scales: {
          x: { ticks: { color: "#7f8998", maxRotation: 0 }, grid: { display: false } },
          y: {
            suggestedMin: floorAtZero ? 0 : undefined,
            ticks: { color: "#7f8998" },
            grid: { color: "rgba(255,255,255,.05)" }
          }
        }
      }
    });
  }

  function renderHistory() {
    const reports = [...state.reports].sort((a, b) => b.date.localeCompare(a.date));
    const closed = reports.filter(report => report.closed);
    const delivered = closed.filter(report => report.verdict === "DOWIEZIONE").length;
    const compliance = closed.length ? delivered / closed.length * 100 : 0;

    el.historyStats.innerHTML = `
      <article class="metric-card"><span>Raporty</span><strong>${closed.length}</strong><small>zamknięte dni</small></article>
      <article class="metric-card"><span>Dowiezione</span><strong>${delivered}</strong><small>${numberFormat(compliance, 0)}% dni</small></article>
      <article class="metric-card"><span>Niedowiezione</span><strong>${closed.length - delivered}</strong><small>bez „prawie”</small></article>
      <article class="metric-card"><span>Seria</span><strong>${calculateStreak(reports)}</strong><small>dni z rzędu</small></article>
    `;

    renderWeeklySummary();

    if (!reports.length) {
      el.historyList.innerHTML = '<div class="empty-state">Nie ma jeszcze raportów.</div>';
      return;
    }
    el.historyList.innerHTML = reports.map(report => `
      <button class="history-item" type="button" data-open-date="${report.date}">
        <div>
          <strong>${formatLongDate(report.date)}</strong>
          <p>${hasNumericMeasurement(report.weight) ? `${numberFormat(report.weight, 2)} kg` : "brak masy"} · ${numberFormat(totalCalories(report), 0)} kcal · keto: ${report.keto === "yes" ? "tak" : report.keto === "no" ? "nie" : "—"}</p>
        </div>
        ${verdictBadge(report.verdict || "SZKIC")}
      </button>
    `).join("");
    el.historyList.querySelectorAll("[data-open-date]").forEach(button => {
      button.addEventListener("click", () => switchReportDate(button.dataset.openDate));
    });
  }

  function renderWeeklySummary() {
    const latest = [...state.weeklySummaries].sort((a, b) => b.weekEndDate.localeCompare(a.weekEndDate))[0];
    const latestClosed = [...state.reports].filter(report => report.closed).sort((a, b) => b.date.localeCompare(a.date))[0];
    el.generateWeeklyButton.hidden = !state.user || !latestClosed;
    el.generateWeeklyButton.disabled = state.weeklyLoading;
    el.generateWeeklyButton.textContent = state.weeklyLoading
      ? "Analizuję…"
      : latest
      ? "Przelicz podsumowanie"
      : "Wygeneruj podsumowanie teraz";

    if (!latest) {
      el.weeklyPeriod.textContent = "PODSUMOWANIE TYGODNIA";
      el.weeklyVerdict.textContent = "Oczekuje na pierwszy okres";
      el.weeklyVerdict.className = "verdict-neutral";
      el.weeklyStats.innerHTML = "";
      el.weeklyHeadline.textContent = "Po zamknięciu niedzielnego raportu P80 automatycznie przeanalizuje ostatnie siedem dni.";
      el.weeklyDetails.innerHTML = "";
      if (!state.weeklyLoading) {
        el.weeklyStatus.textContent = state.user
          ? "Możesz utworzyć podsumowanie po zamknięciu pierwszego raportu."
          : "Zaloguj się, aby uruchomić analizę AI.";
      }
      return;
    }

    const stats = latest.stats || {};
    const summary = latest.summary || {};
    const delivered = latest.verdict === "DOWIEZIONE";
    const periodLabel = summary.period_label || (latest.periodDays === 7 ? "TYDZIEŃ" : `OKRES STARTOWY · ${latest.periodDays} DNI`);
    el.weeklyPeriod.textContent = `${periodLabel} · ${formatShortDate(latest.weekStartDate)}–${formatShortDate(latest.weekEndDate)}`;
    el.weeklyVerdict.textContent = delivered ? "DOWIEZIONE" : "NIEDOWIEZIONE";
    el.weeklyVerdict.className = delivered ? "verdict-success" : "verdict-danger";
    el.weeklyStats.innerHTML = [
      ["Dni", `${numberFormat(stats.deliveredDays, 0)}/${numberFormat(stats.expectedDays, 0)}`],
      ["Śr. kcal", stats.averageCalories === null || stats.averageCalories === undefined ? "—" : numberFormat(stats.averageCalories, 0)],
      ["Keto", `${numberFormat(stats.ketoDays, 0)}/${numberFormat(stats.closedDays, 0)}`],
      ["Masa", formatWeightChange(stats.weightChange)],
      ["Rower", `${numberFormat(stats.totalBikeKm, 1)} km`],
      ["Sen", stats.averageSleep === null || stats.averageSleep === undefined ? "—" : `${numberFormat(stats.averageSleep, 1)} h`]
    ].map(([label, value]) => `<div class="weekly-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
    el.weeklyHeadline.textContent = summary.headline || "";
    el.weeklyDetails.innerHTML = `
      ${summary.summary ? `<p>${escapeHtml(summary.summary)}</p>` : ""}
      ${renderWeeklyList("Dowiezione", summary.wins)}
      ${renderWeeklyList("Niedowiezienie", summary.failures)}
      ${summary.pattern ? `<h4>Wzorzec</h4><p>${escapeHtml(summary.pattern)}</p>` : ""}
      ${renderWeeklyList("Priorytety następnego tygodnia", summary.next_week_focus)}
    `;
    if (!state.weeklyLoading) {
      el.weeklyStatus.textContent = `Aktualizacja: ${formatDateTime(latest.updatedAt)}`;
    }
  }

  function renderWeeklyList(title, items) {
    if (!Array.isArray(items) || !items.length) return "";
    return `<h4>${escapeHtml(title)}</h4><ul>${items.map(item => `<li>${escapeHtml(String(item))}</li>`).join("")}</ul>`;
  }

  function formatWeightChange(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
    const numeric = Number(value);
    return `${numeric > 0 ? "+" : numeric < 0 ? "−" : ""}${numberFormat(Math.abs(numeric), 2)} kg`;
  }

  async function generateLatestWeeklySummary(notify = true) {
    const latestClosed = [...state.reports].filter(report => report.closed).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!latestClosed) {
      el.weeklyStatus.textContent = "Najpierw zamknij przynajmniej jeden raport dnia.";
      return false;
    }
    return generateWeeklySummary(latestClosed.date, notify);
  }

  async function generateWeeklySummary(weekEndDate, notify = true) {
    if (!state.supabase || !state.user || state.weeklyLoading) return false;
    state.weeklyLoading = true;
    el.weeklyStatus.textContent = "Analizuję raporty i zapisuję podsumowanie…";
    renderWeeklySummary();
    let finalStatus = "";

    try {
      const { data, error } = await state.supabase.functions.invoke(CONFIG.edgeFunctionName || "analyze-report", {
        body: { mode: "weekly", weekEndDate, project: PROJECT }
      });
      if (error) throw error;
      if (!data?.summary) throw new Error("Brak podsumowania");

      const record = {
        weekStartDate: data.weekStartDate,
        weekEndDate: data.weekEndDate,
        periodDays: data.periodDays,
        verdict: data.verdict,
        stats: data.stats || {},
        summary: data.summary || {},
        updatedAt: new Date().toISOString()
      };
      state.weeklySummaries = [record, ...state.weeklySummaries.filter(item => item.weekEndDate !== record.weekEndDate)];
      finalStatus = "Podsumowanie zapisane w chmurze.";
      if (notify) showToast("Podsumowanie okresu jest gotowe.");
      return true;
    } catch (error) {
      console.error(error);
      finalStatus = "Nie udało się uruchomić analizy AI. Raporty pozostają bezpiecznie zapisane.";
      if (notify) showToast("Analiza AI niedostępna — sprawdź funkcję i rozliczenie API.");
      return false;
    } finally {
      state.weeklyLoading = false;
      renderWeeklySummary();
      el.weeklyStatus.textContent = finalStatus;
    }
  }

  function renderStaticPlan() {
    const days = [
      ["Pon", "Dom 20–30 min · siłownia A · rower 20 km"],
      ["Wt", "Dom 20–30 min · rower 25 km"],
      ["Śr", "Dom 20–30 min · siłownia B · rower 20 km"],
      ["Czw", "Dom 20–30 min · rower 25 km"],
      ["Pt", "Dom 20–30 min · siłownia C · rower 20 km"],
      ["Sob", "Dom 20–30 min · rower 30 km"],
      ["Nie", "Dom 20–30 min · spokojny rower 20 km"]
    ];
    el.weeklyPlan.innerHTML = days.map(([day, plan]) => `<div class="week-row"><strong>${day}</strong><span>${plan}</span></div>`).join("");
  }

  function updateGymPlanBadge() {
    const session = expectedGymSession(state.currentDate);
    const gym = Boolean(session);
    el.gymPlanBadge.textContent = gym ? `Plan dnia: siłownia ${session}` : "Plan dnia: bez siłowni";
    el.gymPlanBadge.className = gym ? "badge badge-accent" : "badge badge-muted";
  }

  function expectedGymSession(date) {
    const day = parseLocalDate(date).getDay();
    return day === 1 ? "A" : day === 3 ? "B" : day === 5 ? "C" : "";
  }

  function renderCloudState() {
    const configured = isCloudConfigured();
    const loggedIn = Boolean(state.user);
    el.setupBanner.hidden = configured && loggedIn;
    el.syncBadge.textContent = loggedIn ? "Chmura aktywna" : configured ? "Wymaga logowania" : "Tryb lokalny";
    el.syncBadge.className = loggedIn ? "badge badge-success" : "badge badge-muted";
    el.logoutButton.hidden = !loggedIn;
    el.loginButton.hidden = loggedIn || !configured;
    el.magicLinkButton.hidden = loggedIn || !configured;
    el.setPasswordButton.hidden = !loggedIn || !configured;
    el.authEmail.disabled = loggedIn || !configured;
    el.authPassword.disabled = !configured;
    if (loggedIn && state.user.email) el.authEmail.value = state.user.email;
    el.cloudStatus.innerHTML = `
      <div class="status-line"><span>Konfiguracja Supabase</span><strong>${configured ? "gotowa" : "oczekuje"}</strong></div>
      <div class="status-line"><span>Użytkownik</span><strong>${loggedIn ? escapeHtml(state.user.email || "zalogowany") : "niezalogowany"}</strong></div>
      <div class="status-line"><span>Zdjęcia prywatne</span><strong>${loggedIn ? "aktywne" : "lokalne"}</strong></div>
      <div class="status-line"><span>Analiza AI</span><strong>${loggedIn ? "dzienna + tygodniowa" : "reguły lokalne"}</strong></div>
    `;
    if (!configured) {
      el.authMessage.textContent = "Najpierw uzupełnij config.js zgodnie z instrukcją SUPABASE_SETUP.md.";
    }
  }

  async function loginWithMagicLink() {
    if (!state.supabase) return;
    const email = el.authEmail.value.trim();
    if (!email) {
      el.authMessage.textContent = "Wpisz adres e-mail.";
      return;
    }
    el.magicLinkButton.disabled = true;
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await state.supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: redirectTo }
    });
    el.magicLinkButton.disabled = false;
    if (error) {
      el.authMessage.textContent = `Błąd: ${error.message}`;
      return;
    }
    el.authMessage.textContent = "Link startowy został wysłany. Otwórz go w Safari, a następnie ustaw hasło w aplikacji.";
  }

  async function loginWithPassword() {
    if (!state.supabase) return;
    const email = el.authEmail.value.trim();
    const password = el.authPassword.value;
    if (!email || password.length < 8) {
      el.authMessage.textContent = "Wpisz e-mail oraz hasło mające co najmniej 8 znaków.";
      return;
    }
    el.loginButton.disabled = true;
    const { data, error } = await state.supabase.auth.signInWithPassword({ email, password });
    el.loginButton.disabled = false;
    if (error || !data.session) {
      el.authMessage.textContent = `Logowanie nie powiodło się: ${error?.message || "sprawdź dane"}`;
      return;
    }
    el.authPassword.value = "";
    el.authMessage.textContent = "Zalogowano. Synchronizacja chmury jest aktywna.";
  }

  async function setAccountPassword() {
    if (!state.supabase || !state.user) return;
    const password = el.authPassword.value;
    if (password.length < 8) {
      el.authMessage.textContent = "Nowe hasło musi mieć co najmniej 8 znaków.";
      return;
    }
    el.setPasswordButton.disabled = true;
    const { error } = await state.supabase.auth.updateUser({ password });
    el.setPasswordButton.disabled = false;
    if (error) {
      el.authMessage.textContent = `Nie udało się ustawić hasła: ${error.message}`;
      return;
    }
    el.authPassword.value = "";
    el.authMessage.textContent = "Hasło zapisane. Możesz nim zalogować zainstalowaną aplikację.";
  }

  async function logout() {
    if (!state.supabase) return;
    await state.supabase.auth.signOut();
    state.user = null;
    state.weeklySummaries = [];
    renderAll();
  }

  function navigate(viewName) {
    document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === `view-${viewName}`));
    document.querySelectorAll(".nav-button").forEach(button => button.classList.toggle("active", button.dataset.nav === viewName));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (viewName === "dashboard") renderDashboard();
    if (viewName === "history") renderHistory();
    if (viewName === "training") renderTrainingLibrary();
  }

  function exportReports() {
    const payload = {
      exportedAt: new Date().toISOString(),
      project: PROJECT,
      reports: state.reports.map(sanitizeReport),
      weeklySummaries: state.weeklySummaries
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `P80-raporty-${localDateKey(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function installPwa() {
    if (!state.installPrompt) return;
    state.installPrompt.prompt();
    await state.installPrompt.userChoice;
    state.installPrompt = null;
    el.installButton.hidden = true;
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
      navigator.serviceWorker
        .register("./sw.js?v=24", { updateViaCache: "none" })
        .then(registration => registration.update())
        .catch(error => console.warn("Service worker:", error));
    }
  }

  function totalCalories(report) {
    return (report?.entries || []).reduce((sum, entry) => sum + numberOrZero(entry.calories), 0);
  }

  function calculateStreak(reports) {
    const closed = [...reports].filter(report => report.closed).sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    for (const report of closed) {
      if (report.verdict !== "DOWIEZIONE") break;
      streak += 1;
    }
    return streak;
  }

  function verdictBadge(verdict) {
    const cls = verdict === "DOWIEZIONE" ? "badge-success" : verdict === "NIEDOWIEZIONE" ? "badge-danger" : "badge-muted";
    return `<span class="badge ${cls}">${escapeHtml(verdict || "OTWARTY")}</span>`;
  }

  function showEntryError(message) {
    el.entryValidation.hidden = false;
    el.entryValidation.textContent = message;
  }

  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    el.toast.textContent = message;
    el.toast.classList.add("show");
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2600);
  }

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseLocalDate(value) {
    const [year, month, day] = String(value).split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  function formatShortDate(value) {
    return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(parseLocalDate(value));
  }

  function formatLongDate(value) {
    return new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long" }).format(parseLocalDate(value));
  }

  function formatDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  function currentTimeValue() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }

  function numberFormat(value, digits = 1) {
    return new Intl.NumberFormat("pl-PL", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value) || 0);
  }

  function numberOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(String(value).replace(",", "."));
    return Number.isFinite(number) ? number : null;
  }

  function numberOrZero(value) {
    return numberOrNull(value) ?? 0;
  }

  function hasNumericMeasurement(value) {
    return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
  }

  function formatSignedValue(value, digits = 1) {
    const number = Number(value);
    const sign = number > 0 ? "+" : number < 0 ? "−" : "";
    return `${sign}${numberFormat(Math.abs(number), digits)}`;
  }

  function valueOrBlank(value) {
    return value === null || value === undefined ? "" : value;
  }

  function decimalInputValue(value) {
    return value === null || value === undefined ? "" : String(value).replace(".", ",");
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  if (window.__P80_TEST_MODE__) {
    window.P80_TEST = {
      defaultReport,
      deterministicEvaluation,
      expectedGymSession,
      foodDatabase: availableFoods,
      totalCalories,
      validateReport
    };
  }
})();

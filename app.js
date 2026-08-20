(() => {
  "use strict";

  const CONFIG = window.P80_CONFIG || {};
  const PROJECT = CONFIG.project || {};
  const LOCAL_KEY = "p80-v2-reports";
  const TYPE_LABELS = {
    meal: "Posiłek",
    snack: "Przekąska",
    drink: "Napój",
    alcohol: "Alkohol",
    supplement: "Dodatek"
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

  const state = {
    reports: [],
    currentReport: null,
    currentDate: localDateKey(new Date()),
    supabase: null,
    user: null,
    cloudReady: false,
    chart: null,
    saveTimer: null,
    pendingEntryFile: null,
    pendingWeightFile: null,
    installPrompt: null
  };

  const el = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheElements();
    bindEvents();
    renderStaticPlan();
    configureDates();
    await initializeStorage();
    await materializeMissedReports();
    openReport(state.currentDate, false);
    renderAll();
    registerServiceWorker();
  }

  function cacheElements() {
    const ids = [
      "syncBadge", "setupBanner", "todayLabel", "deadlineBadge", "overdueBox",
      "currentWeight", "weightDelta", "toGoal", "streakValue", "todayVerdict",
      "todayCalories", "progressPercent", "progressBar", "weightChart", "recentDays",
      "reportDate", "closedBanner", "reportForm", "weight", "glucose", "ketones",
      "weightPhoto", "weightPhotoPreview", "addEntryButton", "entriesList", "calorieSum",
      "allFoodConfirmed", "gymPlanBadge", "homeMinutes", "gymMinutes", "bikeKm",
      "bikeMinutes", "steps", "gymSession", "gymExercisesPanel", "gymExercisesList",
      "trainingNotes", "sleepHours", "hunger", "mood",
      "painMorning", "painEvening", "radiation", "difficultMoment", "wellbeingNotes",
      "ketoYes", "ketoNo", "turningPoint", "correction", "reportCompleteConfirmed",
      "validationBox", "saveDraftButton", "closeReportButton", "evaluationCard",
      "evaluationVerdict", "evaluationHeadline", "evaluationDetails", "historyStats",
      "historyList", "exportButton", "weeklyPlan", "cloudStatus", "authCard",
      "authEmail", "authPassword", "loginButton", "setPasswordButton", "magicLinkButton",
      "logoutButton", "authMessage", "installButton",
      "entryDialog", "entryForm", "entryDialogTitle", "closeEntryDialog", "entryId",
      "entryType", "entryTime", "entryDescription", "entryGrams", "entryCalories",
      "entryNetCarbs", "entryPhoto", "entryPhotoPreview", "entryValidation",
      "saveEntryButton", "toast"
    ];
    ids.forEach(id => { el[id] = document.getElementById(id); });
  }

  function bindEvents() {
    document.querySelectorAll("[data-nav]").forEach(button => {
      button.addEventListener("click", () => navigate(button.dataset.nav));
    });

    el.reportDate.addEventListener("change", () => openReport(el.reportDate.value));
    el.addEntryButton.addEventListener("click", () => openEntryDialog());
    el.closeEntryDialog.addEventListener("click", closeEntryDialog);
    el.saveEntryButton.addEventListener("click", saveEntryFromDialog);
    el.entryPhoto.addEventListener("change", handleEntryPhotoPreview);
    el.weightPhoto.addEventListener("change", handleWeightPhoto);
    el.gymSession.addEventListener("change", () => renderGymExercises(el.gymSession.value));
    el.saveDraftButton.addEventListener("click", () => saveDraft(true));
    el.closeReportButton.addEventListener("click", closeReport);
    el.exportButton.addEventListener("click", exportReports);
    el.loginButton.addEventListener("click", loginWithPassword);
    el.setPasswordButton.addEventListener("click", setAccountPassword);
    el.magicLinkButton.addEventListener("click", loginWithMagicLink);
    el.logoutButton.addEventListener("click", logout);
    el.installButton.addEventListener("click", installPwa);

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
  }

  function configureDates() {
    el.reportDate.max = localDateKey(new Date());
    el.reportDate.value = state.currentDate;
    el.todayLabel.textContent = formatLongDate(state.currentDate).toUpperCase();
  }

  async function initializeStorage() {
    state.reports = loadLocalReports();
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

      state.supabase.auth.onAuthStateChange(async (_event, session) => {
        const previousUser = state.user?.id;
        state.user = session?.user || null;
        if (state.user && state.user.id !== previousUser) {
          await migrateLocalReportsToCloud();
          await loadCloudReports();
        }
        renderAll();
      });

      if (state.user) {
        await migrateLocalReportsToCloud();
        await loadCloudReports();
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
    const yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);
    if (start > yesterday) return;

    let cursor = new Date(start);
    while (cursor <= yesterday) {
      const date = localDateKey(cursor);
      if (!state.reports.some(report => report.date === date)) {
        const missed = defaultReport(date);
        missed.closed = true;
        missed.closedAt = `${date}T20:00:00`;
        missed.verdict = "NIEDOWIEZIONE";
        missed.evaluation = {
          verdict: "NIEDOWIEZIONE",
          headline: "Brak raportu oznacza dzień niedowieziony.",
          violations: ["Raport dnia nie został wysłany ani zamknięty."],
          turning_point: "Nie wykonano obowiązkowego raportu o 20:00.",
          correction: "Wrócić do planu od najbliższej decyzji i zamknąć dzisiejszy raport o 20:00.",
          safety_note: "Bez głodówki i treningu za karę."
        };
        await persistReport(missed);
      }
      cursor.setDate(cursor.getDate() + 1);
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
      sleepHours: null,
      hunger: null,
      mood: null,
      painMorning: null,
      painEvening: null,
      radiation: "",
      difficultMoment: "",
      wellbeingNotes: "",
      keto: "",
      turningPoint: "",
      correction: "",
      reportCompleteConfirmed: false,
      closed: false,
      closedAt: null,
      verdict: null,
      evaluation: null,
      updatedAt: new Date().toISOString()
    });
  }

  function normalizeReport(report) {
    return {
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
      closed: Boolean(report.closed)
    };
  }

  function sanitizeReport(report, stripAllPreviews = false) {
    const clone = JSON.parse(JSON.stringify(report));
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

  function populateReportForm() {
    const report = state.currentReport;
    el.weight.value = valueOrBlank(report.weight);
    el.glucose.value = valueOrBlank(report.glucose);
    el.ketones.value = valueOrBlank(report.ketones);
    el.homeMinutes.value = numberOrZero(report.homeMinutes);
    el.gymMinutes.value = numberOrZero(report.gymMinutes);
    el.gymSession.value = report.gymSession || "";
    el.bikeKm.value = numberOrZero(report.bikeKm);
    el.bikeMinutes.value = numberOrZero(report.bikeMinutes);
    el.steps.value = numberOrZero(report.steps);
    el.trainingNotes.value = report.trainingNotes || "";
    el.sleepHours.value = valueOrBlank(report.sleepHours);
    el.hunger.value = valueOrBlank(report.hunger);
    el.mood.value = valueOrBlank(report.mood);
    el.painMorning.value = valueOrBlank(report.painMorning);
    el.painEvening.value = valueOrBlank(report.painEvening);
    el.radiation.value = report.radiation || "";
    el.difficultMoment.value = report.difficultMoment || "";
    el.wellbeingNotes.value = report.wellbeingNotes || "";
    el.ketoYes.checked = report.keto === "yes";
    el.ketoNo.checked = report.keto === "no";
    el.turningPoint.value = report.turningPoint || "";
    el.correction.value = report.correction || "";
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
    report.sleepHours = numberOrNull(el.sleepHours.value);
    report.hunger = numberOrNull(el.hunger.value);
    report.mood = numberOrNull(el.mood.value);
    report.painMorning = numberOrNull(el.painMorning.value);
    report.painEvening = numberOrNull(el.painEvening.value);
    report.radiation = el.radiation.value;
    report.difficultMoment = el.difficultMoment.value.trim();
    report.wellbeingNotes = el.wellbeingNotes.value.trim();
    report.keto = document.querySelector('input[name="keto"]:checked')?.value || "";
    report.turningPoint = el.turningPoint.value.trim();
    report.correction = el.correction.value.trim();
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
    el.entryDialogTitle.textContent = entry ? "Edytuj pozycję" : "Dodaj pozycję";
    el.entryId.value = entry?.id || "";
    el.entryType.value = entry?.type || "meal";
    el.entryTime.value = entry?.time || currentTimeValue();
    el.entryDescription.value = entry?.description || "";
    el.entryGrams.value = valueOrBlank(entry?.grams);
    el.entryCalories.value = valueOrBlank(entry?.calories);
    el.entryNetCarbs.value = valueOrBlank(entry?.netCarbs);
    el.entryPhoto.value = "";
    renderEntryPhotoPreview(entry?.photoPreview);
    el.entryValidation.hidden = true;
    el.entryDialog.showModal();
  }

  function closeEntryDialog() {
    state.pendingEntryFile = null;
    el.entryDialog.close();
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
    if (!report.entries.length) errors.push("Brak wpisów jedzenia i napojów.");
    if (!report.allFoodConfirmed) errors.push("Nie potwierdzono kompletności jedzenia i napojów.");
    if (report.sleepHours === null) errors.push("Brak liczby godzin snu.");
    if (report.hunger === null) errors.push("Brak poziomu głodu.");
    if (report.mood === null) errors.push("Brak oceny samopoczucia.");
    if (report.painMorning === null || report.painEvening === null) errors.push("Brak oceny bólu lędźwi rano lub wieczorem.");
    if (!report.radiation) errors.push("Brak informacji o promieniowaniu bólu.");
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
            body: { report: sanitizeReport(report, true), project: PROJECT, hardChecks: hardEvaluation }
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
    const calories = totalCalories(report);
    const gymPlanned = PROJECT.gymDays.includes(parseLocalDate(report.date).getDay());
    const expectedSession = expectedGymSession(report.date);
    const painAdjustment = report.painMorning >= 5 || report.radiation === "stronger";

    if (calories > PROJECT.calorieTarget) violations.push(`Przekroczono limit ${PROJECT.calorieTarget} kcal: wpisano ${numberFormat(calories, 0)} kcal.`);
    if (calories < PROJECT.calorieFloor) violations.push(`Kaloryczność ${numberFormat(calories, 0)} kcal jest poniżej bezpiecznego zakresu projektu ${PROJECT.calorieFloor}–${PROJECT.calorieTarget} kcal.`);
    if (report.keto !== "yes") violations.push("Nie utrzymano keto.");
    if (!painAdjustment) {
      if (report.homeMinutes < PROJECT.homeMinutesMin) violations.push(`Trening domowy krótszy niż ${PROJECT.homeMinutesMin} minut.`);
      if (report.bikeKm < PROJECT.bikeKmMin) violations.push(`Rower poniżej planu ${PROJECT.bikeKmMin} km.`);
      if (gymPlanned && report.gymMinutes <= 0) violations.push("Nie wykonano zaplanowanej siłowni.");
      if (gymPlanned && !report.gymSession) violations.push("Nie wskazano sesji siłowni A/B/C.");
      if (gymPlanned && report.gymSession && report.gymSession !== expectedSession) violations.push(`Wykonano plan ${report.gymSession} zamiast zaplanowanego planu ${expectedSession}.`);
      if (gymPlanned && report.gymSession && (report.gymExercises || []).some(item => !item.done)) {
        violations.push("Nie wykonano wszystkich ćwiczeń zaplanowanej sesji siłowni.");
      }
      if (gymPlanned && report.gymSession && (report.gymExercises || []).some(item => item.done && (item.sets === null || !item.reps || item.load === null))) {
        violations.push("Nie wpisano kompletu serii, powtórzeń i obciążeń dla wykonanych ćwiczeń.");
      }
    } else if (!report.trainingNotes) {
      violations.push("Przy nasilonych objawach nie opisano bezpiecznej modyfikacji ruchu ani decyzji o konsultacji.");
    }

    const verdict = violations.length ? "NIEDOWIEZIONE" : "DOWIEZIONE";
    const painIncrease = report.painEvening - report.painMorning;
    let safety = "Bez głodówki i bez dodatkowego treningu za karę.";
    if (painIncrease >= 2 || report.radiation === "stronger") {
      safety = "Ból lub promieniowanie wzrosły: kolejny trening należy zmniejszyć i obserwować objawy; przy drętwieniu, osłabieniu albo problemach z pęcherzem/jelitami potrzebna jest pilna pomoc medyczna.";
    }

    return {
      verdict,
      headline: verdict === "DOWIEZIONE"
        ? "Plan został wykonany. To jest dzień przybliżający Cię do 80 kg."
        : "Nie dowiozłeś założeń. Nazywamy decyzje wprost i wracamy do planu od następnej decyzji.",
      violations,
      turning_point: report.turningPoint || (violations.length ? "Wskaż dokładny moment pierwszego odejścia od planu." : "Nie odnotowano odejścia od planu."),
      correction: report.correction || (violations.length ? "Najbliższy posiłek i kolejna decyzja mają być zgodne z planem — bez czekania do jutra." : "Powtórzyć ten sam standard następnego dnia."),
      safety_note: safety
    };
  }

  function enforceHardChecks(aiEvaluation, hardEvaluation) {
    const hardFail = hardEvaluation.verdict === "NIEDOWIEZIONE";
    const violations = Array.from(new Set([...(hardEvaluation.violations || []), ...(aiEvaluation.violations || [])]));
    return {
      verdict: hardFail ? "NIEDOWIEZIONE" : (aiEvaluation.verdict === "NIEDOWIEZIONE" ? "NIEDOWIEZIONE" : "DOWIEZIONE"),
      headline: aiEvaluation.headline || hardEvaluation.headline,
      violations,
      turning_point: aiEvaluation.turning_point || hardEvaluation.turning_point,
      correction: aiEvaluation.correction || hardEvaluation.correction,
      safety_note: aiEvaluation.safety_note || hardEvaluation.safety_note
    };
  }

  function renderEvaluation(report) {
    if (!report?.evaluation) {
      el.evaluationCard.hidden = true;
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
      <div class="evaluation-line"><strong>Moment:</strong><br>${escapeHtml(evaluation.turning_point || "—")}</div>
      <div class="evaluation-line"><strong>Korekta:</strong><br>${escapeHtml(evaluation.correction || "—")}</div>
      <div class="evaluation-line"><strong>Bezpieczeństwo:</strong><br>${escapeHtml(evaluation.safety_note || "—")}</div>
    `;
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
    const weighted = sorted.filter(report => Number.isFinite(Number(report.weight)));
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
  }

  function renderRecentDays(reports) {
    const items = [...reports].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    if (!items.length) {
      el.recentDays.innerHTML = '<div class="empty-state">Pierwszy raport utworzy historię projektu.</div>';
      return;
    }
    el.recentDays.innerHTML = items.map(report => `
      <div class="recent-item">
        <div><strong>${formatShortDate(report.date)}</strong><p>${numberFormat(totalCalories(report), 0)} kcal · ${report.weight ? `${numberFormat(report.weight, 2)} kg` : "bez masy"}</p></div>
        ${verdictBadge(report.verdict)}
      </div>
    `).join("");
  }

  function renderWeightChart(reports) {
    if (!window.Chart || !el.weightChart) return;
    if (state.chart) state.chart.destroy();
    const context = el.weightChart.getContext("2d");
    state.chart = new window.Chart(context, {
      type: "line",
      data: {
        labels: reports.map(report => formatShortDate(report.date)),
        datasets: [{
          data: reports.map(report => Number(report.weight)),
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
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#7f8998", maxRotation: 0 }, grid: { display: false } },
          y: { ticks: { color: "#7f8998" }, grid: { color: "rgba(255,255,255,.05)" } }
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

    if (!reports.length) {
      el.historyList.innerHTML = '<div class="empty-state">Nie ma jeszcze raportów.</div>';
      return;
    }
    el.historyList.innerHTML = reports.map(report => `
      <button class="history-item" type="button" data-open-date="${report.date}">
        <div>
          <strong>${formatLongDate(report.date)}</strong>
          <p>${report.weight ? `${numberFormat(report.weight, 2)} kg` : "brak masy"} · ${numberFormat(totalCalories(report), 0)} kcal · keto: ${report.keto === "yes" ? "tak" : report.keto === "no" ? "nie" : "—"}</p>
        </div>
        ${verdictBadge(report.verdict || "SZKIC")}
      </button>
    `).join("");
    el.historyList.querySelectorAll("[data-open-date]").forEach(button => {
      button.addEventListener("click", () => openReport(button.dataset.openDate));
    });
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
    el.gymPlanBadge.textContent = gym ? `Dziś siłownia ${session}` : "Dziś bez siłowni";
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
      <div class="status-line"><span>Werdykt AI</span><strong>${loggedIn ? "gotowy po wdrożeniu funkcji" : "reguły lokalne"}</strong></div>
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
    renderAll();
  }

  function navigate(viewName) {
    document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === `view-${viewName}`));
    document.querySelectorAll(".nav-button").forEach(button => button.classList.toggle("active", button.dataset.nav === viewName));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (viewName === "dashboard") renderDashboard();
    if (viewName === "history") renderHistory();
  }

  function exportReports() {
    const payload = {
      exportedAt: new Date().toISOString(),
      project: PROJECT,
      reports: state.reports.map(sanitizeReport)
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
      navigator.serviceWorker.register("./sw.js").catch(error => console.warn("Service worker:", error));
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

  function valueOrBlank(value) {
    return value === null || value === undefined ? "" : value;
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
      totalCalories,
      validateReport
    };
  }
})();

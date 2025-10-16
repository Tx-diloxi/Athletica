[file name]: script.js
[file content begin]
// Programme d'entraînement complet
const workoutProgram = {
    'Lundi': {
        name: 'Cardio',
        type: 'cardio',
        exercises: [
            { name: 'Course à pied', icon: '🏃', duration: '30-45 min' }
        ]
    },
    'Mardi': {
        name: 'Badminton',
        type: 'badminton',
        exercises: [
            { name: 'Badminton', icon: '🏸', duration: '1-2h' }
        ]
    },
    'Mercredi': {
        name: 'Cardio',
        type: 'cardio',
        exercises: [
            { name: 'Course à pied', icon: '🏃', duration: '30-45 min' }
        ]
    },
    'Jeudi': {
        name: 'Repos',
        type: 'rest',
        exercises: []
    },
    'Vendredi': {
        name: 'Pecs/Épaules/Triceps',
        type: 'muscu',
        warmup: 'échauffement rameur ou vélo',
        exercises: [
            { name: 'Développé couché', icon: '🏋️', sets: 3, reps: '8-12', rest: '1-2 min' },
            { name: 'Développé militaire', icon: '💪', sets: 3, reps: '8-12', rest: '1 min' },
            { name: 'Élévations latérales', icon: '🦅', sets: 3, reps: '10-12', rest: '75 sec' },
            { name: 'Dips', icon: '🤸', sets: 3, reps: '10', rest: '1 min' },
            { name: 'Extension triceps', icon: '💥', sets: 3, reps: '10-12', rest: '75 sec' }
        ]
    },
    'Samedi': {
        name: 'Dos/Biceps',
        type: 'muscu',
        warmup: 'échauffement rameur',
        exercises: [
            { name: 'Tractions/Tirage vertical', icon: '🎯', sets: 3, reps: '8-12', rest: '1-2 min' },
            { name: 'Rowing', icon: '🚣', sets: 3, reps: '8-12', rest: '1-2 min' },
            { name: 'Tirage assis', icon: '⚡', sets: 3, reps: '10', rest: '1 min' },
            { name: 'Curl barre', icon: '💪', sets: 3, reps: '10-12', rest: '1 min' },
            { name: 'Curl marteau', icon: '🔨', sets: 2, reps: '10-12', rest: '75 sec' }
        ]
    },
    'Dimanche': {
        name: 'Jambes/Abdominaux',
        type: 'muscu',
        warmup: 'échauffement vélo',
        exercises: [
            { name: 'Squat/Presse', icon: '🦵', sets: 3, reps: '8-12', rest: '1-2 min' },
            { name: 'Fentes', icon: '🏃', sets: 3, reps: '10', rest: '75-90 sec' },
            { name: 'Leg curl', icon: '🦿', sets: 3, reps: '10', rest: '1 min' },
            { name: 'Mollets debout', icon: '👟', sets: 4, reps: '12-15', rest: '1 min' },
            { name: 'Crunchs', icon: '📐', sets: 3, reps: '15', rest: '30 sec' },
            { name: 'Gainage', icon: '🧘', sets: 3, reps: '30-45 sec', rest: '30 sec' }
        ]
    }
};

// Variables globales
let currentDay = '';
let currentExerciseIndex = 0;
let currentSeriesIndex = 0;
let workoutData = {};
let waterCount = 0;
let restTimer = null;
let restTimeLeft = 0;

// Variables pour le swipe
let startX = 0;
let currentX = 0;
let isSwiping = false;
let swipeEnabled = true;

// Navigation entre sections
function showSection(sectionId) {
    // Masquer toutes les sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Montrer la section sélectionnée
    document.getElementById(sectionId).classList.add('active');
    
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activer le bouton correspondant
    document.querySelector(`.nav-btn[onclick="showSection('${sectionId}')"]`).classList.add('active');
    
    // Mettre à jour les stats si on est sur la section statistique
    if (sectionId === 'statistique') {
        updateStatsCharts();
    }
    if (sectionId === 'profil') {
        updateHistory();
    }
}

// Contrôle du swipe
function enableSwipe() {
    swipeEnabled = true;
}

function disableSwipe() {
    swipeEnabled = false;
}

// Initialisation
function init() {
    loadData();
    createDaySelector();
    updateWaterDisplay();
    loadMeals();
    updateStatsCharts();
    updateHistory();
    setupSwipeHandlers();
    
    // Sélection automatique du jour actuel
    autoSelectDay();
    
    // Initialiser les statistiques
    initializeStatsDateSelector();
}

// Sauvegarde et chargement des données
function saveData() {
    const today = new Date().toISOString().split('T')[0];
    const data = {
        workouts: workoutData,
        water: { [today]: waterCount },
        lastUpdate: today
    };
    localStorage.setItem('fitnessData', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('fitnessData');
    if (saved) {
        const data = JSON.parse(saved);
        workoutData = data.workouts || {};
        const today = new Date().toISOString().split('T')[0];
        waterCount = (data.water && data.water[today]) || 0;
    }
}

// Sélecteur de jour
function createDaySelector() {
    const selector = document.getElementById('daySelector');
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    days.forEach(day => {
        const btn = document.createElement('button');
        btn.className = 'day-btn';
        btn.textContent = day;
        btn.onclick = () => selectDay(day);
        selector.appendChild(btn);
    });
}

// Sélection automatique du jour
function autoSelectDay() {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const today = new Date().getDay();
    const todayName = days[today];
    
    selectDay(todayName);
    
    // Masquer le sélecteur de jour après sélection automatique
    document.getElementById('daySelector').style.display = 'none';
    
    // Mettre à jour le titre pour afficher le jour sélectionné
    const titleElement = document.querySelector('#accueil .card h3');
    if (titleElement) {
        titleElement.textContent = `Séance du ${todayName}`;
    }
}

function selectDay(day) {
    currentDay = day;
    currentExerciseIndex = 0;
    currentSeriesIndex = 0;
    
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === day);
    });

    displayExercise();
}

// Fonctions de gestion du swipe
function setupSwipeHandlers() {
    const container = document.getElementById('swipeContainer');
    
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);
}

function handleTouchStart(e) {
    if (!swipeEnabled || e.touches.length !== 1) return;
    
    startX = e.touches[0].clientX;
    currentX = startX;
    isSwiping = true;
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!swipeEnabled || !isSwiping) return;
    
    if (e.touches.length === 1) {
        currentX = e.touches[0].clientX;
        updateCardPosition();
        e.preventDefault();
    }
}

function handleTouchEnd() {
    if (!swipeEnabled || !isSwiping) return;
    
    handleSwipeEnd();
    isSwiping = false;
}

function handleMouseDown(e) {
    if (!swipeEnabled) return;
    
    startX = e.clientX;
    currentX = startX;
    isSwiping = true;
    e.preventDefault();
}

function handleMouseMove(e) {
    if (!swipeEnabled || !isSwiping) return;
    
    currentX = e.clientX;
    updateCardPosition();
    e.preventDefault();
}

function handleMouseUp() {
    if (!swipeEnabled || !isSwiping) return;
    
    handleSwipeEnd();
    isSwiping = false;
}

function updateCardPosition() {
    const card = document.querySelector('.exercise-card');
    if (!card) return;
    
    const deltaX = currentX - startX;
    const rotation = deltaX * 0.1;
    
    card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    card.style.transition = 'none';
    
    // Feedback visuel
    const leftFeedback = card.querySelector('.swipe-feedback.left');
    const rightFeedback = card.querySelector('.swipe-feedback.right');
    
    if (deltaX > 50) {
        card.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        if (rightFeedback) rightFeedback.style.opacity = Math.min(deltaX / 100, 1);
        if (leftFeedback) leftFeedback.style.opacity = '0';
    } else if (deltaX < -50) {
        card.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        if (leftFeedback) leftFeedback.style.opacity = Math.min(-deltaX / 100, 1);
        if (rightFeedback) rightFeedback.style.opacity = '0';
    } else {
        card.style.backgroundColor = '';
        if (leftFeedback) leftFeedback.style.opacity = '0';
        if (rightFeedback) rightFeedback.style.opacity = '0';
    }
}

function handleSwipeEnd() {
    const card = document.querySelector('.exercise-card');
    if (!card) return;
    
    const deltaX = currentX - startX;
    const swipeThreshold = 100;
    
    card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    
    if (deltaX > swipeThreshold) {
        completeCurrentAction();
    } else if (deltaX < -swipeThreshold) {
        skipCurrentAction();
    } else {
        card.style.transform = 'translateX(0) rotate(0deg)';
        card.style.backgroundColor = '';
        
        const leftFeedback = card.querySelector('.swipe-feedback.left');
        const rightFeedback = card.querySelector('.swipe-feedback.right');
        if (leftFeedback) leftFeedback.style.opacity = '0';
        if (rightFeedback) rightFeedback.style.opacity = '0';
    }
}

function completeCurrentAction() {
    const card = document.querySelector('.exercise-card');
    if (!card) return;
    
    card.style.transform = 'translateX(150%) rotate(20deg)';
    card.style.opacity = '0';
    
    setTimeout(() => {
        const workout = workoutProgram[currentDay];
        if (workout.type === 'cardio') {
            completeCardio();
        } else if (workout.type === 'badminton') {
            completeBadminton();
        } else if (workout.type === 'muscu') {
            completeSeries();
        }
    }, 300);
}

function skipCurrentAction() {
    const card = document.querySelector('.exercise-card');
    if (!card) return;
    
    card.style.transform = 'translateX(-150%) rotate(-20deg)';
    card.style.opacity = '0';
    
    setTimeout(() => {
        const workout = workoutProgram[currentDay];
        if (workout.type === 'cardio' || workout.type === 'badminton') {
            skipExercise();
        } else if (workout.type === 'muscu') {
            skipSeries();
        }
    }, 300);
}

// Affichage des exercices
function displayExercise() {
    const container = document.getElementById('swipeContainer');
    
    if (!currentDay) {
        container.innerHTML = '<div class="card no-data"><p>Sélectionnez un jour d\'entraînement</p></div>';
        return;
    }

    const workout = workoutProgram[currentDay];
    const exercises = workout.exercises;

    if (currentExerciseIndex >= exercises.length) {
        container.innerHTML = '<div class="card"><h3>✅ Séance terminée!</h3><p>Bravo! Pensez à vous hydrater et à bien récupérer.</p><button class="btn-primary" onclick="resetWorkout()">Recommencer</button></div>';
        saveWorkoutComplete();
        return;
    }

    const exercise = exercises[currentExerciseIndex];
    
    if (workout.type === 'cardio') {
        displayCardioExercise(exercise, container);
    } else if (workout.type === 'badminton') {
        displayBadmintonExercise(exercise, container);
    } else if (workout.type === 'muscu') {
        displayMuscuExercise(exercise, container);
    } else if (workout.type === 'rest') {
        container.innerHTML = '<div class="card"><h3>🛌 Jour de repos</h3><p>Profitez de votre journée de récupération!</p></div>';
    }
}

// Affichage d'un exercice de cardio
function displayCardioExercise(exercise, container) {
    enableSwipe();
    
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.innerHTML = `
        <div class="swipe-feedback left">Passer</div>
        <div class="swipe-feedback right">Terminer</div>
        
        <div class="exercise-image">${exercise.icon}</div>
        <div class="exercise-name">${exercise.name}</div>
        <div class="exercise-details">
            <p><strong>Durée recommandée:</strong> ${exercise.duration}</p>
        </div>
        <div class="cardio-inputs">
            <div class="cardio-input">
                <label>Durée réelle (minutes)</label>
                <input type="number" id="duration" placeholder="Ex: 35">
            </div>
            <div class="cardio-input">
                <label>Distance parcourue (km) - optionnel</label>
                <input type="number" id="distance" placeholder="Ex: 5.2">
            </div>
        </div>
        <div class="swipe-buttons">
            <button class="swipe-btn btn-skip" onclick="skipExercise()">✕</button>
            <button class="swipe-btn btn-done" onclick="completeCardio()">✓</button>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(card);
}

// Affichage d'un exercice de badminton
function displayBadmintonExercise(exercise, container) {
    enableSwipe();
    
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.innerHTML = `
        <div class="swipe-feedback left">Non</div>
        <div class="swipe-feedback right">Oui</div>
        
        <div class="badminton-card">
            <div class="exercise-image">${exercise.icon}</div>
            <div class="exercise-name">${exercise.name}</div>
            <div class="badminton-question">Avez-vous joué au badminton aujourd'hui?</div>
            <div class="swipe-buttons">
                <button class="swipe-btn btn-skip" onclick="skipBadminton()">✕</button>
                <button class="swipe-btn btn-done" onclick="completeBadminton()">✓</button>
            </div>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(card);
}

// Affichage d'un exercice de musculation
function displayMuscuExercise(exercise, container) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    
    // Si on est en phase de repos
    if (restTimeLeft > 0) {
        disableSwipe();
        
        card.innerHTML = `
            <div class="rest-timer">
                <div class="timer-label">⏱️ Temps de repos</div>
                <div class="timer-display" id="timerDisplay">${formatTime(restTimeLeft)}</div>
                <div class="timer-label">Prochain exercice: ${exercise.name}</div>
                <button class="skip-rest-btn" onclick="skipRest()">Passer le repos</button>
            </div>
        `;

        container.innerHTML = '';
        container.appendChild(card);
        startRestTimer();
        return;
    }
    
    enableSwipe();
    
    const totalSets = exercise.sets;
    const currentSet = currentSeriesIndex + 1;
    
    card.innerHTML = `
        <div class="swipe-feedback left">Passer</div>
        <div class="swipe-feedback right">Terminer</div>
        
        <div class="exercise-image">${exercise.icon}</div>
        <div class="exercise-name">${exercise.name}</div>
        <div class="exercise-details">
            <p><strong>Séries:</strong> ${exercise.sets}</p>
            <p><strong>Répétitions:</strong> ${exercise.reps}</p>
            <p><strong>Repos:</strong> ${exercise.rest}</p>
        </div>
        <div class="series-progress">Série ${currentSet}/${totalSets}</div>
        <div class="series-inputs">
            <div class="series-input">
                <label>Poids utilisé (kg)</label>
                <input type="number" id="weight" placeholder="Ex: 20">
            </div>
            <div class="series-input">
                <label>Répétitions effectuées</label>
                <input type="number" id="reps" placeholder="Ex: 10">
            </div>
        </div>
        <div class="swipe-buttons">
            <button class="swipe-btn btn-skip" onclick="skipSeries()">✕</button>
            <button class="swipe-btn btn-done" onclick="completeSeries()">✓</button>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(card);
}

// Complétion d'un exercice de cardio
function completeCardio() {
    const duration = document.getElementById('duration').value;
    const distance = document.getElementById('distance').value;
    const exercise = workoutProgram[currentDay].exercises[currentExerciseIndex];
    
    const today = new Date().toISOString().split('T')[0];
    if (!workoutData[today]) workoutData[today] = { day: currentDay, exercises: [] };
    
    workoutData[today].exercises.push({
        name: exercise.name,
        duration: duration || 0,
        distance: distance || 0,
        completed: true
    });

    saveData();
    currentExerciseIndex++;
    displayExercise();
}

// Complétion d'un exercice de badminton
function completeBadminton() {
    const exercise = workoutProgram[currentDay].exercises[currentExerciseIndex];
    
    const today = new Date().toISOString().split('T')[0];
    if (!workoutData[today]) workoutData[today] = { day: currentDay, exercises: [] };
    
    workoutData[today].exercises.push({
        name: exercise.name,
        completed: true
    });

    saveData();
    currentExerciseIndex++;
    displayExercise();
}

function skipBadminton() {
    const exercise = workoutProgram[currentDay].exercises[currentExerciseIndex];
    const today = new Date().toISOString().split('T')[0];
    if (!workoutData[today]) workoutData[today] = { day: currentDay, exercises: [] };
    
    workoutData[today].exercises.push({
        name: exercise.name,
        skipped: true
    });

    saveData();
    currentExerciseIndex++;
    displayExercise();
}

// Complétion d'une série de musculation
function completeSeries() {
    const weight = document.getElementById('weight').value;
    const reps = document.getElementById('reps').value;
    const exercise = workoutProgram[currentDay].exercises[currentExerciseIndex];
    
    const today = new Date().toISOString().split('T')[0];
    if (!workoutData[today]) workoutData[today] = { day: currentDay, exercises: [] };
    
    let exerciseData = workoutData[today].exercises.find(e => e.name === exercise.name);
    
    if (!exerciseData) {
        exerciseData = {
            name: exercise.name,
            series: []
        };
        workoutData[today].exercises.push(exerciseData);
    }
    
    exerciseData.series.push({
        set: currentSeriesIndex + 1,
        weight: weight || 0,
        reps: reps || 0
    });

    saveData();
    
    currentSeriesIndex++;
    
    if (currentSeriesIndex >= exercise.sets) {
        currentSeriesIndex = 0;
        currentExerciseIndex++;
        displayExercise();
    } else {
        startRestPeriod(exercise.rest);
    }
}

function skipSeries() {
    const exercise = workoutProgram[currentDay].exercises[currentExerciseIndex];
    const today = new Date().toISOString().split('T')[0];
    if (!workoutData[today]) workoutData[today] = { day: currentDay, exercises: [] };
    
    let exerciseData = workoutData[today].exercises.find(e => e.name === exercise.name);
    
    if (!exerciseData) {
        exerciseData = {
            name: exercise.name,
            series: []
        };
        workoutData[today].exercises.push(exerciseData);
    }
    
    exerciseData.series.push({
        set: currentSeriesIndex + 1,
        skipped: true
    });

    saveData();
    
    currentSeriesIndex++;
    
    if (currentSeriesIndex >= exercise.sets) {
        currentSeriesIndex = 0;
        currentExerciseIndex++;
        displayExercise();
    } else {
        startRestPeriod(exercise.rest);
    }
}

// Gestion du chrono de repos
function startRestPeriod(restTime) {
    if (restTime.includes('min')) {
        restTimeLeft = parseInt(restTime) * 60;
    } else if (restTime.includes('sec')) {
        restTimeLeft = parseInt(restTime);
    } else {
        restTimeLeft = 60;
    }
    
    displayExercise();
}

function startRestTimer() {
    if (restTimer) clearInterval(restTimer);
    
    restTimer = setInterval(() => {
        restTimeLeft--;
        document.getElementById('timerDisplay').textContent = formatTime(restTimeLeft);
        
        if (restTimeLeft <= 0) {
            clearInterval(restTimer);
            restTimer = null;
            enableSwipe();
            displayExercise();
        }
    }, 1000);
}

function skipRest() {
    if (restTimer) clearInterval(restTimer);
    restTimer = null;
    restTimeLeft = 0;
    enableSwipe();
    displayExercise();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function skipExercise() {
    currentExerciseIndex++;
    displayExercise();
}

function resetWorkout() {
    currentExerciseIndex = 0;
    currentSeriesIndex = 0;
    displayExercise();
}

// Hydratation
function changeWater(amount) {
    waterCount = Math.max(0, waterCount + amount);
    updateWaterDisplay();
    saveData();
}

function updateWaterDisplay() {
    document.getElementById('waterCount').textContent = waterCount;
}

// Nutrition
function saveMeals() {
    const meals = {};
    for (let i = 1; i <= 6; i++) {
        meals[`meal${i}`] = document.getElementById(`meal${i}`).checked;
    }
    localStorage.setItem('fitnessMeals', JSON.stringify(meals));
}

function loadMeals() {
    const saved = localStorage.getItem('fitnessMeals');
    if (saved) {
        const meals = JSON.parse(saved);
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`meal${i}`).checked = meals[`meal${i}`] || false;
        }
    }
}

// Historique
function updateHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    const sortedDates = Object.keys(workoutData).sort().reverse();
    
    if (sortedDates.length === 0) {
        historyList.innerHTML = '<p class="no-data">Aucune séance enregistrée</p>';
        return;
    }
    
    sortedDates.forEach(date => {
        const workout = workoutData[date];
        const item = document.createElement('div');
        item.className = 'history-item';
        
        let content = `<div class="history-date">${date} - ${workout.day}</div>`;
        
        if (workout.exercises && workout.exercises.length > 0) {
            workout.exercises.forEach(ex => {
                if (ex.series) {
                    content += `<div class="history-details">${ex.name}: ${ex.series.length} séries</div>`;
                } else if (ex.duration) {
                    content += `<div class="history-details">${ex.name}: ${ex.duration} min</div>`;
                } else {
                    content += `<div class="history-details">${ex.name}: ${ex.completed ? '✓' : '✕'}</div>`;
                }
            });
        }
        
        item.innerHTML = content;
        historyList.appendChild(item);
    });
}

function saveWorkoutComplete() {
    const today = new Date().toISOString().split('T')[0];
    if (workoutData[today]) {
        workoutData[today].completed = true;
        saveData();
    }
}

// Export et réinitialisation
function exportData() {
    const data = {
        workouts: workoutData,
        water: waterCount,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function clearData() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données?')) {
        localStorage.removeItem('fitnessData');
        localStorage.removeItem('fitnessMeals');
        workoutData = {};
        waterCount = 0;
        init();
    }
}

// NOUVELLES FONCTIONS POUR LES STATISTIQUES AVANCÉES
function initializeStatsDateSelector() {
    const container = document.getElementById('statsDateSelector');
    const today = new Date().toISOString().split('T')[0];
    const dates = getLast7Days();
    
    container.innerHTML = '';
    
    dates.forEach(date => {
        const btn = document.createElement('button');
        btn.className = 'date-btn';
        btn.textContent = formatDateForDisplay(date);
        btn.dataset.date = date;
        
        if (date === today) {
            btn.classList.add('active');
        }
        
        btn.onclick = () => {
            document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateStatsCharts(date);
        };
        
        container.appendChild(btn);
    });
}

function getLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}

function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Hier';
    } else {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const dayName = days[date.getDay()];
        return `${dayName} ${date.getDate()}/${date.getMonth() + 1}`;
    }
}

function getDayNameFromDate(dateString) {
    const date = new Date(dateString);
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[date.getDay()];
}

function updateStatsCharts(selectedDate = null) {
    const today = new Date().toISOString().split('T')[0];
    const dateToShow = selectedDate || today;
    
    updateWaterChart(dateToShow);
    updateExerciseChart(dateToShow);
    updateStatsSummary(dateToShow);
}

function updateWaterChart(date) {
    const container = document.getElementById('waterChart');
    const dates = getLast7Days();
    
    container.innerHTML = '';
    
    // Trouver la valeur maximale pour l'échelle
    let maxWater = 10;
    dates.forEach(d => {
        const water = getWaterForDate(d);
        if (water > maxWater) maxWater = water;
    });
    
    dates.forEach(d => {
        const water = getWaterForDate(d);
        const percentage = (water / maxWater) * 100;
        const isSelected = d === date;
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${Math.max(percentage, 5)}%`;
        bar.style.background = isSelected ? 'var(--gradient)' : 'var(--accent-light)';
        bar.style.opacity = isSelected ? '1' : '0.7';
        
        bar.innerHTML = `
            <div class="bar-value">${water}</div>
            <div class="bar-label">${formatDateForDisplay(d)}</div>
        `;
        
        container.appendChild(bar);
    });
}

function updateExerciseChart(date) {
    const container = document.getElementById('exerciseChart');
    const dates = getLast7Days();
    
    container.innerHTML = '';
    
    // Trouver la valeur maximale pour l'échelle
    let maxExercises = 1;
    dates.forEach(d => {
        const exercises = getExercisesForDate(d);
        if (exercises > maxExercises) maxExercises = exercises;
    });
    
    dates.forEach(d => {
        const exercises = getExercisesForDate(d);
        const percentage = maxExercises > 0 ? (exercises / maxExercises) * 100 : 0;
        const isSelected = d === date;
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${Math.max(percentage, 5)}%`;
        bar.style.background = isSelected ? 'var(--gradient)' : 'var(--success)';
        bar.style.opacity = isSelected ? '1' : '0.7';
        
        bar.innerHTML = `
            <div class="bar-value">${exercises}</div>
            <div class="bar-label">${formatDateForDisplay(d)}</div>
        `;
        
        container.appendChild(bar);
    });
}

function updateStatsSummary(date) {
    const container = document.getElementById('statsSummary');
    const exerciseContainer = document.getElementById('exerciseStats');
    
    // Calculer les statistiques
    const waterCount = getWaterForDate(date);
    const exerciseCount = getExercisesForDate(date);
    const dayName = getDayNameFromDate(date);
    const workout = workoutProgram[dayName];
    const expectedExercises = workout && workout.exercises ? workout.exercises.length : 0;
    const completionRate = expectedExercises > 0 ? (exerciseCount / expectedExercises) * 100 : 0;
    
    container.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${waterCount}/8</div>
            <div class="stat-name">Verres d'eau</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min((waterCount / 8) * 100, 100)}%"></div>
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${exerciseCount}/${expectedExercises}</div>
            <div class="stat-name">Exercices</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${completionRate}%"></div>
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${Math.round(completionRate)}%</div>
            <div class="stat-name">Taux complétion</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${completionRate}%"></div>
            </div>
        </div>
    `;
    
    // Afficher les exercices détaillés
    const workoutDataForDate = workoutData[date];
    if (workoutDataForDate && workoutDataForDate.exercises) {
        let exercisesHTML = '<div class="chart-title">Exercices complétés</div>';
        workoutDataForDate.exercises.forEach(exercise => {
            if (!exercise.skipped) {
                exercisesHTML += `
                    <div class="exercise-stat">
                        <span class="exercise-name">${exercise.name}</span>
                        <span class="exercise-value">✅</span>
                    </div>
                `;
            }
        });
        exerciseContainer.innerHTML = exercisesHTML;
    } else {
        exerciseContainer.innerHTML = '<div class="no-data">Aucun exercice complété ce jour</div>';
    }
}

function getWaterForDate(date) {
    // Récupérer les données d'eau depuis le stockage existant
    const saved = localStorage.getItem('fitnessData');
    if (saved) {
        const data = JSON.parse(saved);
        return (data.water && data.water[date]) || 0;
    }
    return 0;
}

function getExercisesForDate(date) {
    // Récupérer le nombre d'exercices depuis le stockage existant
    if (workoutData[date] && workoutData[date].exercises) {
        return workoutData[date].exercises.filter(ex => !ex.skipped).length;
    }
    return 0;
}

// Initialisation au chargement
window.onload = init;
[file content end]
// Constantes
const HEIGHT = 1.74; // metros

// ========== FUNCIONES DE ALMACENAMIENTO LOCAL ==========

// Función para guardar en localStorage
function setLocalStorage(key, value) {
    try {
        localStorage.setItem('gymApp_' + key, JSON.stringify(value));
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
    }
}

// Función para obtener de localStorage
function getLocalStorage(key) {
    try {
        const value = localStorage.getItem('gymApp_' + key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error('Error leyendo de localStorage:', error);
        return null;
    }
}

// ========== FUNCIONES DE NAVEGACIÓN Y MODAL ==========

// Función para abrir pestañas de días
function openDay(evt, dayName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(dayName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Función para abrir modal de imagen
function openImageModal(img, title, description, tips) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalDescription = document.getElementById('modalDescription');
    const modalTips = document.getElementById('modalTips');
    
    modal.style.display = 'block';
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    modalDescription.textContent = description;
    
    // Limpiar tips anteriores
    modalTips.innerHTML = '';
    tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        modalTips.appendChild(li);
    });
}

// Función para cerrar modal
function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// ========== FUNCIONES DE CALCULADORA BMI ==========

// Función para calcular BMI
function calculateBMI() {
    const weight = parseFloat(document.getElementById('currentWeight').value);
    if (!weight || weight <= 0) return;

    // Guardar el peso actual en localStorage
    setLocalStorage('currentWeight', weight);

    const bmi = weight / (HEIGHT * HEIGHT);
    const bmiResult = document.getElementById('bmiResult');
    const bmiCategory = document.getElementById('bmiCategory');
    const bodyFatResult = document.getElementById('bodyFatResult');
    const bodyFatCategory = document.getElementById('bodyFatCategory');
    const bmrResult = document.getElementById('bmrResult');

    // Mostrar BMI
    bmiResult.textContent = bmi.toFixed(1);

    // Determinar categoría BMI
    let category, categoryClass;
    if (bmi < 18.5) {
        category = 'Bajo peso';
        categoryClass = 'underweight';
    } else if (bmi < 25) {
        category = 'Peso normal';
        categoryClass = 'normal';
    } else if (bmi < 30) {
        category = 'Sobrepeso';
        categoryClass = 'overweight';
    } else {
        category = 'Obesidad';
        categoryClass = 'obese';
    }

    bmiCategory.textContent = category;
    bmiCategory.className = 'bmi-category ' + categoryClass;

    // Estimar grasa corporal (fórmula aproximada para hombres atléticos)
    let bodyFatPercentage;
    if (bmi < 20) {
        bodyFatPercentage = 6 + (bmi - 18.5) * 2;
    } else if (bmi < 25) {
        bodyFatPercentage = 10 + (bmi - 20) * 2;
    } else {
        bodyFatPercentage = 20 + (bmi - 25) * 1.5;
    }

    bodyFatResult.textContent = bodyFatPercentage.toFixed(1) + '%';

    // Categoría de grasa corporal
    let fatCategory;
    if (bodyFatPercentage < 10) {
        fatCategory = 'Muy bajo (atlético)';
    } else if (bodyFatPercentage < 15) {
        fatCategory = 'Bajo (fitness)';
    } else if (bodyFatPercentage < 20) {
        fatCategory = 'Normal';
    } else {
        fatCategory = 'Alto';
    }
    bodyFatCategory.textContent = fatCategory;

    // Calcular BMR (Metabolismo Basal) - Fórmula Mifflin-St Jeor para hombres
    const age = 27; // edad promedio estimada
    const bmr = 10 * weight + 6.25 * (HEIGHT * 100) - 5 * age + 5;
    bmrResult.innerHTML = `<span style="color: var(--primary-color);">${Math.round(bmr)} kcal/día</span>`;
}

// ========== FUNCIONES DE PESO CORPORAL ==========

// Función para actualizar fila de peso
function updateWeightRow(week, weight) {
    if (!weight || weight <= 0) return;

    const weightNum = parseFloat(weight);
    const bmi = weightNum / (HEIGHT * HEIGHT);
    
    // Actualizar BMI
    document.getElementById('bmi' + week).textContent = bmi.toFixed(1);
    
    // Calcular diferencia con la semana anterior
    if (week > 1) {
        const prevWeightData = getLocalStorage('week' + (week - 1) + 'Weight');
        if (prevWeightData && prevWeightData.weight) {
            const prevWeight = prevWeightData.weight;
            const diff = weightNum - prevWeight;
            const diffElement = document.getElementById('diff' + week);
            diffElement.textContent = (diff >= 0 ? '+' : '') + diff.toFixed(1) + ' kg';
            diffElement.style.color = diff <= 0 ? 'var(--accent-color)' : 'var(--primary-color)';
        }
    }
    
    // Estimar grasa corporal
    let bodyFatPercentage;
    if (bmi < 20) {
        bodyFatPercentage = 6 + (bmi - 18.5) * 2;
    } else if (bmi < 25) {
        bodyFatPercentage = 10 + (bmi - 20) * 2;
    } else {
        bodyFatPercentage = 20 + (bmi - 25) * 1.5;
    }
    
    document.getElementById('fat' + week).textContent = bodyFatPercentage.toFixed(1) + '%';
}

// Función para guardar peso corporal
function saveWeight(week, value) {
    if (!value || value === '') return;
    
    const today = new Date().toISOString().split('T')[0];
    const weightData = {
        week: week,
        weight: parseFloat(value),
        date: today
    };
    
    // Guardar peso específico de la semana
    setLocalStorage('week' + week + 'Weight', weightData);
    
    // Actualizar historial general de peso corporal
    let weightHistory = getLocalStorage('bodyWeightHistory') || [];
    
    const weekIndex = weightHistory.findIndex(entry => entry.week === week);
    
    if (weekIndex !== -1) {
        weightHistory[weekIndex] = weightData;
    } else {
        weightHistory.push(weightData);
    }
    
    weightHistory.sort((a, b) => a.week - b.week);
    setLocalStorage('bodyWeightHistory', weightHistory);
    
    console.log('Peso guardado para semana ' + week + ': ' + value + 'kg');
}

// Función para cargar pesos corporales
function loadWeights() {
    const weightTableInputs = document.querySelectorAll('#weightTableBody input[type="number"]');
    
    weightTableInputs.forEach((input, index) => {
        const weekNumber = index + 1;
        const weightData = getLocalStorage('week' + weekNumber + 'Weight');
        if (weightData && weightData.weight) {
            input.value = weightData.weight;
            updateWeightRow(weekNumber, weightData.weight);
        }
    });
    
    // Cargar peso actual en la calculadora
    const currentWeight = getLocalStorage('currentWeight');
    if (currentWeight) {
        const currentWeightInput = document.getElementById('currentWeight');
        if (currentWeightInput) {
            currentWeightInput.value = currentWeight;
            calculateBMI(); // Recalcular automáticamente
        }
    }
}

// ========== FUNCIONES DE EJERCICIOS ==========

// Función para guardar peso de ejercicios
function saveExerciseWeight(exerciseId, value) {
    if (!value || value === '') return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Obtener historial existente
    let exerciseHistory = getLocalStorage('exercise_' + exerciseId) || [];
    
    // Buscar si ya existe una entrada para hoy
    const todayIndex = exerciseHistory.findIndex(entry => entry.date === today);
    
    if (todayIndex !== -1) {
        // Actualizar entrada existente
        exerciseHistory[todayIndex].weight = parseFloat(value);
    } else {
        // Crear nueva entrada
        exerciseHistory.push({
            date: today,
            weight: parseFloat(value)
        });
    }
    
    // Mantener solo los últimos 10 registros
    if (exerciseHistory.length > 10) {
        exerciseHistory = exerciseHistory.slice(-10);
    }
    
    // Guardar en localStorage
    setLocalStorage('exercise_' + exerciseId, exerciseHistory);
    
    // Actualizar visualización del historial
    updateExerciseHistory(exerciseId);
    
    console.log('Peso guardado para ejercicio ' + exerciseId + ': ' + value);
}

// Función para actualizar la visualización del historial de ejercicios
function updateExerciseHistory(exerciseId) {
    const historyElement = document.getElementById(exerciseId + '_history');
    if (!historyElement) return;
    
    const exerciseHistory = getLocalStorage('exercise_' + exerciseId) || [];
    
    if (exerciseHistory.length === 0) {
        historyElement.textContent = '';
        return;
    }
    
    // Mostrar los últimos 3 registros
    const recentHistory = exerciseHistory.slice(-3);
    const historyText = recentHistory.map(entry => {
        const date = new Date(entry.date);
        const shortDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        return `${shortDate}: ${entry.weight}kg`;
    }).join(' | ');
    
    historyElement.textContent = `Último: ${historyText}`;
}

// Función para cargar pesos de ejercicios
function loadExerciseWeights() {
    const exercises = [
        'matrix_chest_press', 'matrix_incline_press', 'matrix_assisted_dip', 'matrix_tricep_ext', 'matrix_pec_deck',
        'matrix_leg_press', 'matrix_leg_extension', 'matrix_leg_curl', 'matrix_hip_abduction', 'matrix_hip_adduction', 'matrix_calf_raise',
        'matrix_lat_pulldown', 'matrix_seated_row', 'matrix_pullover', 'matrix_bicep_curl', 'matrix_face_pulls',
        'matrix_treadmill', 'matrix_elliptical', 'matrix_ab_crunch', 'matrix_knee_raise', 'plancha_suelo',
        'full_body_circuit'
    ];
    
    exercises.forEach(exerciseId => {
        const exerciseHistory = getLocalStorage('exercise_' + exerciseId) || [];
        
        // Buscar el input correspondiente
        const inputs = document.querySelectorAll(`input[onchange*="${exerciseId}"]`);
        if (inputs.length > 0 && exerciseHistory.length > 0) {
            const lastEntry = exerciseHistory[exerciseHistory.length - 1];
            inputs[0].value = lastEntry.weight;
        }
        
        // Actualizar historial visual
        updateExerciseHistory(exerciseId);
    });
}

// ========== FUNCIONES DE COMPLETADO DE DÍAS ==========

// Función para alternar el estado de completado de los días
function toggleCheck(element, day) {
    element.classList.toggle('checked');
    
    // Guardar estado en localStorage
    const isChecked = element.classList.contains('checked');
    setLocalStorage('day' + day + 'Checked', isChecked);
    
    console.log('Día ' + day + ' marcado como: ' + (isChecked ? 'Completado' : 'No completado'));
}

// Función para cargar estados de completado
function loadChecks() {
    for (let i = 1; i <= 5; i++) {
        const isChecked = getLocalStorage('day' + i + 'Checked');
        if (isChecked === true) {
            const checkBox = document.querySelector('#Day' + i + ' .check-box');
            if (checkBox) {
                checkBox.classList.add('checked');
            }
        }
    }
}

// ========== FUNCIONES DE UTILIDAD ==========

// Función para resetear todos los datos
function resetAllData() {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos guardados? Esta acción no se puede deshacer.')) {
        // Obtener todas las claves que empiecen con 'gymApp_'
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('gymApp_')) {
                keysToRemove.push(key);
            }
        }
        
        // Eliminar todas las claves
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        alert('Todos los datos han sido eliminados.');
        location.reload();
    }
}

// Función para obtener la semana actual
function getCurrentWeek() {
    const bodyWeightHistory = getLocalStorage('bodyWeightHistory') || [];
    return bodyWeightHistory.length + 1;
}

// Función para exportar datos (útil para backup)
function exportData() {
    const allData = {};
    
    // Recopilar todos los datos del localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('gymApp_')) {
            const cleanKey = key.replace('gymApp_', '');
            allData[cleanKey] = getLocalStorage(cleanKey);
        }
    }
    
    // Crear archivo de descarga
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'datos_rutina_gym_' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
}

// ========== INICIALIZACIÓN ==========

// Función principal de inicialización
function initializeApp() {
    console.log('Inicializando aplicación de rutina de ejercicios...');
    
    // Verificar soporte de localStorage
    if (typeof(Storage) === "undefined") {
        alert('Tu navegador no soporta localStorage. Los datos no se guardarán.');
        return;
    }
    
    // Abrir primera pestaña por defecto
    const defaultButton = document.getElementById("defaultOpen");
    if (defaultButton) {
        defaultButton.click();
    }
    
    // Cargar datos guardados
    loadChecks();
    loadWeights();
    loadExerciseWeights();
    
    console.log('Aplicación cargada correctamente. Datos guardados en localStorage.');
    
    // Mostrar información de debug en consola
    console.log('Para resetear todos los datos, ejecuta: resetAllData()');
    console.log('Para exportar datos, ejecuta: exportData()');
}

// Event listener para cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ========== FUNCIONES GLOBALES ==========

// Exponer funciones útiles globalmente
window.resetWorkoutData = resetAllData;
window.getCurrentWeek = getCurrentWeek;
window.exportGymData = exportData;
window.resetAllData = resetAllData;
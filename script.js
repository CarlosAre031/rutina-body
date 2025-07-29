  const HEIGHT = 1.74; // metros

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

        // Función para calcular BMI
        function calculateBMI() {
            const weight = parseFloat(document.getElementById('currentWeight').value);
            if (!weight || weight <= 0) return;

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
            // Esta es una estimación basada en BMI, no es 100% precisa
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
            // Asumiendo edad promedio de 25-30 años
            const age = 27; // edad promedio estimada
            const bmr = 10 * weight + 6.25 * (HEIGHT * 100) - 5 * age + 5;
            bmrResult.innerHTML = `<span style="color: var(--primary-color);">${Math.round(bmr)} kcal/día</span>`;
        }

        // Función para actualizar fila de peso
        function updateWeightRow(week, weight) {
            if (!weight || weight <= 0) return;

            const weightNum = parseFloat(weight);
            const bmi = weightNum / (HEIGHT * HEIGHT);
            
            // Actualizar BMI
            document.getElementById('bmi' + week).textContent = bmi.toFixed(1);
            
            // Calcular diferencia con la semana anterior
            const prevWeekInput = document.querySelector(`#weightTableBody tr:nth-child(${week - 1}) input`);
            if (prevWeekInput && prevWeekInput.value) {
                const prevWeight = parseFloat(prevWeekInput.value);
                const diff = weightNum - prevWeight;
                const diffElement = document.getElementById('diff' + week);
                diffElement.textContent = (diff >= 0 ? '+' : '') + diff.toFixed(1) + ' kg';
                diffElement.style.color = diff <= 0 ? 'var(--accent-color)' : 'var(--primary-color)';
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

        // Función para alternar el estado de completado de los días
        function toggleCheck(element, day) {
            element.classList.toggle('checked');
            // Usamos variables en memoria en lugar de localStorage
            if (!window.gymData) window.gymData = {};
            window.gymData['day' + day + 'Checked'] = element.classList.contains('checked');
        }

        // Funciones de almacenamiento en memoria
        function setMemoryStorage(key, value) {
            if (!window.gymData) window.gymData = {};
            window.gymData[key] = value;
        }

        function getMemoryStorage(key) {
            if (!window.gymData) window.gymData = {};
            return window.gymData[key] || null;
        }

        // Función para guardar peso de ejercicios
        function saveExerciseWeight(exerciseId, value) {
            if (!value || value === '') return;
            
            const today = new Date().toISOString().split('T')[0];
            
            let exerciseHistory = getMemoryStorage('exercise_' + exerciseId) || [];
            
            const todayIndex = exerciseHistory.findIndex(entry => entry.date === today);
            
            if (todayIndex !== -1) {
                exerciseHistory[todayIndex].weight = parseFloat(value);
            } else {
                exerciseHistory.push({
                    date: today,
                    weight: parseFloat(value)
                });
            }
            
            if (exerciseHistory.length > 10) {
                exerciseHistory = exerciseHistory.slice(-10);
            }
            
            setMemoryStorage('exercise_' + exerciseId, exerciseHistory);
            updateExerciseHistory(exerciseId);
        }

        // Función para actualizar la visualización del historial de ejercicios
        function updateExerciseHistory(exerciseId) {
            const historyElement = document.getElementById(exerciseId + '_history');
            if (!historyElement) return;
            
            const exerciseHistory = getMemoryStorage('exercise_' + exerciseId) || [];
            
            if (exerciseHistory.length === 0) {
                historyElement.textContent = '';
                return;
            }
            
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
                const exerciseHistory = getMemoryStorage('exercise_' + exerciseId) || [];
                
                const inputs = document.querySelectorAll(`input[onchange*="${exerciseId}"]`);
                if (inputs.length > 0 && exerciseHistory.length > 0) {
                    const lastEntry = exerciseHistory[exerciseHistory.length - 1];
                    inputs[0].value = lastEntry.weight;
                }
                
                updateExerciseHistory(exerciseId);
            });
        }

        // Función para cargar estados de completado
        function loadChecks() {
            for (var i = 1; i <= 5; i++) {
                var checked = getMemoryStorage('day' + i + 'Checked');
                if (checked === true) {
                    const checkBox = document.querySelector('#Day' + i + ' .check-box');
                    if (checkBox) {
                        checkBox.classList.add('checked');
                    }
                }
            }
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
            
            setMemoryStorage('week' + week + 'Weight', weightData);
            
            let weightHistory = getMemoryStorage('bodyWeightHistory') || [];
            
            const weekIndex = weightHistory.findIndex(entry => entry.week === week);
            
            if (weekIndex !== -1) {
                weightHistory[weekIndex] = weightData;
            } else {
                weightHistory.push(weightData);
            }
            
            weightHistory.sort((a, b) => a.week - b.week);
            setMemoryStorage('bodyWeightHistory', weightHistory);
        }

        // Función para cargar pesos corporales
        function loadWeights() {
            const inputs = document.querySelectorAll('#WeightTracker input[type="number"]');
            // Excluir el input de peso actual de la calculadora
            const weightInputs = Array.from(inputs).filter(input => input.id !== 'currentWeight');
            
            weightInputs.forEach((input, index) => {
                const weekNumber = index + 1;
                const weightData = getMemoryStorage('week' + weekNumber + 'Weight');
                if (weightData && weightData.weight) {
                    input.value = weightData.weight;
                    updateWeightRow(weekNumber, weightData.weight);
                }
            });
        }

        // Función principal de inicialización
        function initializeApp() {
            // Inicializar datos en memoria
            if (!window.gymData) window.gymData = {};
            
            const defaultButton = document.getElementById("defaultOpen");
            if (defaultButton) {
                defaultButton.click();
            }
            
            loadChecks();
            loadWeights();
            loadExerciseWeights();
            
            console.log('Aplicación de rutina de ejercicios cargada correctamente');
            console.log('Datos guardados en memoria del navegador');
        }

        // Event listener para cuando se carga el DOM
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        // Funciones de utilidad adicionales
        function resetAllData() {
            if (confirm('¿Estás seguro de que quieres borrar todos los datos guardados?')) {
                window.gymData = {};
                location.reload();
            }
        }

        function getCurrentWeek() {
            const bodyWeightHistory = getMemoryStorage('bodyWeightHistory') || [];
            return bodyWeightHistory.length + 1;
        }

        // Exponer algunas funciones globalmente
        window.resetWorkoutData = resetAllData;
        window.getCurrentWeek = getCurrentWeek;
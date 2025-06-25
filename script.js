// --- INICIO DEL CÓDIGO JAVASCRIPT COMPLETO ---
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM - Formulario de entrada
    const inputFecha = document.getElementById('inputFecha');
    const inputHoras = document.getElementById('inputHoras');
    const btnAgregar = document.getElementById('btnAgregar');
    const tablaEntradasBody = document.getElementById('tablaEntradas').getElementsByTagName('tbody')[0];

    // Elementos del DOM - Resumen
    const displayMultiplicador = document.getElementById('displayMultiplicador');
    const inputMultiplicador = document.getElementById('inputMultiplicador');
    const displaySumaHoras = document.getElementById('displaySumaHoras');
    const displayTotalFinal = document.getElementById('displayTotalFinal');
    const btnResetTodo = document.getElementById('btnResetTodo');

    let entradas = [];
    let multiplicador = 1.000;

    // --- CARGAR DATOS ---
    function cargarDatos() {
        const entradasGuardadas = localStorage.getItem('horasTrabajadas_entradas');
        if (entradasGuardadas) {
            entradas = JSON.parse(entradasGuardadas);
        }
        const multiplicadorGuardado = localStorage.getItem('horasTrabajadas_multiplicador');
        if (multiplicadorGuardado) {
            multiplicador = parseFloat(multiplicadorGuardado);
        }
        renderizarTabla();
        actualizarResumen();
        displayMultiplicador.textContent = multiplicador.toFixed(3);
    }

    // --- GUARDAR DATOS ---
    function guardarDatos() {
        localStorage.setItem('horasTrabajadas_entradas', JSON.stringify(entradas));
        localStorage.setItem('horasTrabajadas_multiplicador', multiplicador.toString());
    }

    // --- FORMATEAR FECHA ---
    function formatearFecha(fechaString) {
        if (!fechaString) return '';
        const [year, month, day] = fechaString.split('-');
        return `${day}/${month}/${year.slice(-2)}`;
    }
    
    // --- RENDERIZAR TABLA ---
    function renderizarTabla() {
        tablaEntradasBody.innerHTML = '';
        entradas.forEach((entrada) => {
            const fila = tablaEntradasBody.insertRow();
            fila.dataset.id = entrada.id;

            fila.insertCell().textContent = formatearFecha(entrada.fecha);
            fila.insertCell().textContent = parseFloat(entrada.horas).toFixed(1);
            
            const celdaAcciones = fila.insertCell();
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'EDITAR';
            btnEditar.classList.add('acciones-btn', 'btn-editar');
            btnEditar.onclick = () => editarEntrada(entrada.id);
            
            const btnBorrar = document.createElement('button');
            btnBorrar.textContent = 'BORRAR';
            btnBorrar.classList.add('acciones-btn', 'btn-borrar');
            btnBorrar.onclick = () => borrarEntrada(entrada.id);

            celdaAcciones.appendChild(btnEditar);
            celdaAcciones.appendChild(btnBorrar);
        });
    }

    // --- ACTUALIZAR RESUMEN ---
    function actualizarResumen() {
        const sumaHoras = entradas.reduce((acc, curr) => acc + parseFloat(curr.horas), 0);
        const totalFinal = sumaHoras * multiplicador;
        displaySumaHoras.textContent = sumaHoras.toFixed(1);
        displayTotalFinal.textContent = totalFinal.toFixed(3);
    }

    // --- FUNCIÓN REUTILIZABLE PARA PROCESAR LA ENTRADA ---
    // Esta función contiene la lógica de validación y agregado que antes estaba solo en el click del botón.
    function procesarNuevaEntrada() {
        const fecha = inputFecha.value;
        const horas = parseFloat(inputHoras.value);

        if (!fecha) {
            alert('Por favor, selecciona una fecha.');
            inputFecha.focus(); // Devuelve el foco al campo de fecha si está vacío
            return false; // Indica que la validación falló
        }
        if (isNaN(horas) || horas <= 0) {
            alert('Por favor, introduce un número de horas válido.');
            inputHoras.focus(); // Mantiene el foco en el campo de horas
            inputHoras.select(); // Selecciona el contenido para fácil corrección
            return false; // Indica que la validación falló
        }

        const nuevaEntrada = {
            id: Date.now(),
            fecha: fecha,
            horas: horas
        };
        entradas.push(nuevaEntrada);
        
        renderizarTabla();
        actualizarResumen();
        guardarDatos();

        inputHoras.value = ''; // Limpiar input de horas
        
        // --- CAMBIO: OCULTAR TECLADO (DESENFOCANDO EL INPUT ACTIVO) ---
        // La forma más simple de intentar ocultar el teclado es quitar el foco del input.
        // Si el foco estaba en inputHoras, desenfocarlo.
        // Si el foco pasó al botón "Agregar" (en caso de clic), el teclado usualmente se oculta.
        // Si fue por Enter en inputHoras, desenfocarlo es clave.
        if (document.activeElement === inputHoras || document.activeElement === inputFecha) {
            document.activeElement.blur(); 
        }
        // No siempre es necesario devolver el foco a inputFecha, puede ser mejor no tener foco
        // inputFecha.focus(); // Opcional: devolver el foco al campo de fecha para la siguiente entrada

        return true; // Indica que la entrada fue procesada exitosamente
    }

    // --- AGREGAR ENTRADA (POR CLIC EN BOTÓN) ---
    btnAgregar.addEventListener('click', () => {
        procesarNuevaEntrada();
        // El teclado debería ocultarse naturalmente al hacer clic en un botón que no es un input.
        // Si no es así, la llamada a .blur() dentro de procesarNuevaEntrada (si el foco estaba en un input) ayudará.
    });

    // --- CAMBIO: AGREGAR ENTRADA CON TECLA "INTRO" EN EL CAMPO DE HORAS ---
    inputHoras.addEventListener('keypress', (event) => {
        // 'Enter' tiene keyCode 13 o key 'Enter'
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault(); // Prevenir el comportamiento por defecto (ej. submit de formulario si existiera)
            procesarNuevaEntrada(); // Llama a la misma lógica que el botón agregar
        }
    });

    // --- CAMBIO: PERMITIR "INTRO" EN FECHA PARA PASAR A HORAS (OPCIONAL MEJORA UX) ---
    inputFecha.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            inputHoras.focus(); // Mueve el foco al campo de horas
        }
    });


    // --- EDITAR ENTRADA ---
    function editarEntrada(id) {
        const entrada = entradas.find(e => e.id === id);
        if (!entrada) return;

        const nuevaFecha = prompt(`Editar fecha (YYYY-MM-DD) para ${formatearFecha(entrada.fecha)}:`, entrada.fecha);
        if (nuevaFecha !== null && !/^\d{4}-\d{2}-\d{2}$/.test(nuevaFecha)) {
            alert("Formato de fecha incorrecto. Debe ser YYYY-MM-DD.");
            return;
        }

        const nuevasHorasStr = prompt(`Editar horas para ${formatearFecha(nuevaFecha || entrada.fecha)} (actual: ${entrada.horas}):`, entrada.horas);
        const nuevasHoras = parseFloat(nuevasHorasStr);

        if (nuevaFecha !== null) entrada.fecha = nuevaFecha;
        if (nuevasHorasStr !== null && !isNaN(nuevasHoras) && nuevasHoras > 0) {
            entrada.horas = nuevasHoras;
        } else if (nuevasHorasStr !== null) {
            alert('Valor de horas inválido.');
            return;
        }
        
        renderizarTabla();
        actualizarResumen();
        guardarDatos();
    }

    // --- BORRAR ENTRADA ---
    function borrarEntrada(id) {
        if (confirm('¿Estás seguro de que quieres borrar esta entrada?')) {
            entradas = entradas.filter(e => e.id !== id);
            renderizarTabla();
            actualizarResumen();
            guardarDatos();
        }
    }

    // --- EDITAR MULTIPLICADOR ---
    displayMultiplicador.addEventListener('dblclick', () => {
        displayMultiplicador.style.display = 'none';
        inputMultiplicador.style.display = 'inline-block';
        inputMultiplicador.value = multiplicador.toFixed(3);
        inputMultiplicador.focus();
        inputMultiplicador.select();
    });

    inputMultiplicador.addEventListener('blur', guardarNuevoMultiplicador);
    inputMultiplicador.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            guardarNuevoMultiplicador();
        }
    });

    function guardarNuevoMultiplicador() {
        const nuevoValor = parseFloat(inputMultiplicador.value);
        if (!isNaN(nuevoValor) && nuevoValor >= 0) {
            multiplicador = nuevoValor;
        } else {
            alert("Por favor, introduce un valor multiplicador numérico válido.");
        }
        displayMultiplicador.textContent = multiplicador.toFixed(3);
        displayMultiplicador.style.display = 'inline-block';
        inputMultiplicador.style.display = 'none';
        
        actualizarResumen();
        guardarDatos();
    }

    // --- REINICIAR TODO ---
    btnResetTodo.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar TODAS las entradas y reiniciar el multiplicador? Esta acción no se puede deshacer.')) {
            entradas = [];
            multiplicador = 1.000;
            localStorage.removeItem('horasTrabajadas_entradas');
            localStorage.removeItem('horasTrabajadas_multiplicador');
            
            renderizarTabla();
            actualizarResumen();
            displayMultiplicador.textContent = multiplicador.toFixed(3);
            inputFecha.value = '';
            inputHoras.value = '';
            inicializarFecha();
            // Ocultar teclado si algún input tenía foco
            if (document.activeElement === inputHoras || document.activeElement === inputFecha) {
                document.activeElement.blur();
            }
        }
    });

     // --- INICIALIZACIÓN ---
    function inicializarFecha() {
        const hoy = new Date();
        const offset = hoy.getTimezoneOffset();
        const hoyLocal = new Date(hoy.getTime() - (offset * 60 * 1000));
        inputFecha.value = hoyLocal.toISOString().split('T')[0];
    }

    inicializarFecha();
    cargarDatos();
});
// --- FIN DEL CÓDIGO JAVASCRIPT COMPLETO ---
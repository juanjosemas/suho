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
    let multiplicador = 1.00;

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
        displayMultiplicador.textContent = multiplicador.toFixed(2);
    }

    // --- GUARDAR DATOS ---
    function guardarDatos() {
        localStorage.setItem('horasTrabajadas_entradas', JSON.stringify(entradas));
        localStorage.setItem('horasTrabajadas_multiplicador', multiplicador.toString());
    }

    // --- FORMATEAR FECHA (para mostrar como DD/MM/YYYY) ---
    function formatearFecha(fechaString) { // fechaString es YYYY-MM-DD
        if (!fechaString) return '';
        const [year, month, day] = fechaString.split('-');
        return `${day}/${month}/${year.slice(-2)}`; // DD/MM/YY
    }
    
    // --- RENDERIZAR TABLA ---
    function renderizarTabla() {
        tablaEntradasBody.innerHTML = '';
        entradas.forEach((entrada, index) => {
            const fila = tablaEntradasBody.insertRow();
            fila.dataset.id = entrada.id; // Guardar ID para edición/borrado

            fila.insertCell().textContent = formatearFecha(entrada.fecha);
            fila.insertCell().textContent = parseFloat(entrada.horas).toFixed(2);
            
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

        displaySumaHoras.textContent = sumaHoras.toFixed(2);
        displayTotalFinal.textContent = totalFinal.toFixed(3); // Tres decimales como en tu Excel
    }

    // --- AGREGAR ENTRADA ---
    btnAgregar.addEventListener('click', () => {
        const fecha = inputFecha.value;
        const horas = parseFloat(inputHoras.value);

        if (!fecha) {
            alert('Por favor, selecciona una fecha.');
            return;
        }
        if (isNaN(horas) || horas <= 0) {
            alert('Por favor, introduce un número de horas válido.');
            return;
        }

        const nuevaEntrada = {
            id: Date.now(), // ID único
            fecha: fecha,
            horas: horas
        };
        entradas.push(nuevaEntrada);
        
        renderizarTabla();
        actualizarResumen();
        guardarDatos();

        inputHoras.value = ''; // Limpiar input de horas, mantener fecha por si se añaden varias el mismo día
        inputHoras.focus();
    });

    // --- EDITAR ENTRADA ---
    function editarEntrada(id) {
        const entrada = entradas.find(e => e.id === id);
        if (!entrada) return;

        const nuevaFecha = prompt(`Editar fecha (YYYY-MM-DD) para ${formatearFecha(entrada.fecha)}:`, entrada.fecha);
        // Validación básica de formato de fecha YYYY-MM-DD
        if (nuevaFecha !== null && !/^\d{4}-\d{2}-\d{2}$/.test(nuevaFecha)) {
            alert("Formato de fecha incorrecto. Debe ser YYYY-MM-DD.");
            return;
        }

        const nuevasHorasStr = prompt(`Editar horas para ${formatearFecha(nuevaFecha || entrada.fecha)} (actual: ${entrada.horas}):`, entrada.horas);
        const nuevasHoras = parseFloat(nuevasHorasStr);

        if (nuevaFecha !== null) entrada.fecha = nuevaFecha; // Solo actualiza si no se canceló el prompt
        if (nuevasHorasStr !== null && !isNaN(nuevasHoras) && nuevasHoras > 0) {
            entrada.horas = nuevasHoras;
        } else if (nuevasHorasStr !== null) {
            alert('Valor de horas inválido.');
            return; // No continuar si las horas son inválidas pero se intentó cambiar
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
        inputMultiplicador.value = multiplicador.toFixed(2);
        inputMultiplicador.focus();
        inputMultiplicador.select();
    });

    inputMultiplicador.addEventListener('blur', guardarNuevoMultiplicador);
    inputMultiplicador.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evitar submit si estuviera en un form
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
        displayMultiplicador.textContent = multiplicador.toFixed(2);
        displayMultiplicador.style.display = 'inline-block';
        inputMultiplicador.style.display = 'none';
        
        actualizarResumen(); // Recalcular el total final
        guardarDatos();
    }

    // --- REINICIAR TODO ---
    btnResetTodo.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar TODAS las entradas y reiniciar el multiplicador? Esta acción no se puede deshacer.')) {
            entradas = [];
            multiplicador = 1.00; // O el valor por defecto que prefieras
            localStorage.removeItem('horasTrabajadas_entradas');
            localStorage.removeItem('horasTrabajadas_multiplicador');
            
            renderizarTabla();
            actualizarResumen();
            displayMultiplicador.textContent = multiplicador.toFixed(2);
            inputFecha.value = '';
            inputHoras.value = '';
            inicializarFecha(); // Poner fecha actual
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
    cargarDatos(); // Cargar datos al iniciar la página
});
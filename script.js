// --- INICIO DEL CÓDIGO JAVASCRIPT COMPLETO ---
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM - Formulario de entrada
    const inputFecha = document.getElementById('inputFecha');
    const inputHoras = document.getElementById('inputHoras');
    const btnAgregar = document.getElementById('btnAgregar');
    const tablaEntradasBody = document.getElementById('tablaEntradas').getElementsByTagName('tbody')[0];

    // Elementos del DOM - Resumen
    const displayMultiplicador = document.getElementById('displayMultiplicador');
    const inputMultiplicador = document.getElementById('inputMultiplicador'); // Input para editar el multiplicador
    const displaySumaHoras = document.getElementById('displaySumaHoras');
    const displayTotalFinal = document.getElementById('displayTotalFinal');
    const btnResetTodo = document.getElementById('btnResetTodo');

    let entradas = []; // Array para almacenar los objetos de cada entrada (fecha, horas, id)
    let multiplicador = 1.000; // Valor inicial del multiplicador, ahora con 3 decimales

    // --- CARGAR DATOS ---
    // Función para cargar los datos guardados en localStorage al iniciar la página
    function cargarDatos() {
        const entradasGuardadas = localStorage.getItem('horasTrabajadas_entradas');
        if (entradasGuardadas) {
            entradas = JSON.parse(entradasGuardadas); // Convierte el string JSON de vuelta a un array de objetos
        }
        const multiplicadorGuardado = localStorage.getItem('horasTrabajadas_multiplicador');
        if (multiplicadorGuardado) {
            multiplicador = parseFloat(multiplicadorGuardado); // Convierte el string a número flotante
        }
        renderizarTabla(); // Actualiza la tabla en la página con los datos cargados
        actualizarResumen(); // Actualiza los cálculos del resumen
        displayMultiplicador.textContent = multiplicador.toFixed(3); // Muestra el multiplicador con 3 decimales
    }

    // --- GUARDAR DATOS ---
    // Función para guardar el estado actual de las entradas y el multiplicador en localStorage
    function guardarDatos() {
        localStorage.setItem('horasTrabajadas_entradas', JSON.stringify(entradas)); // Convierte el array a string JSON
        localStorage.setItem('horasTrabajadas_multiplicador', multiplicador.toString()); // Convierte el número a string
    }

    // --- FORMATEAR FECHA (para mostrar como DD/MM/YY) ---
    // Función para cambiar el formato de fecha de YYYY-MM-DD a DD/MM/YY
    function formatearFecha(fechaString) { 
        if (!fechaString) return ''; // Si no hay fecha, devuelve string vacío
        const [year, month, day] = fechaString.split('-'); // Divide la fecha en partes
        return `${day}/${month}/${year.slice(-2)}`; // Recompone en formato DD/MM/YY (usando los últimos 2 dígitos del año)
    }
    
    // --- RENDERIZAR TABLA ---
    // Función para dibujar/actualizar la tabla de entradas en el HTML
    function renderizarTabla() {
        tablaEntradasBody.innerHTML = ''; // Limpia el contenido actual de la tabla
        entradas.forEach((entrada) => { // Itera sobre cada objeto 'entrada' en el array 'entradas'
            const fila = tablaEntradasBody.insertRow(); // Crea una nueva fila <tr>
            fila.dataset.id = entrada.id; // Asigna el ID de la entrada al atributo data-id de la fila (útil para editar/borrar)

            fila.insertCell().textContent = formatearFecha(entrada.fecha); // Inserta celda para la fecha formateada
            // --- CAMBIO: HORAS EN TABLA A 1 DECIMAL ---
            fila.insertCell().textContent = parseFloat(entrada.horas).toFixed(1); // Inserta celda para las horas, formateadas a 1 decimal
            
            const celdaAcciones = fila.insertCell(); // Inserta celda para los botones de acciones
            const btnEditar = document.createElement('button'); // Crea el botón de editar
            btnEditar.textContent = 'EDITAR';
            btnEditar.classList.add('acciones-btn', 'btn-editar'); // Añade clases CSS para estilo
            btnEditar.onclick = () => editarEntrada(entrada.id); // Asigna la función de editar al hacer clic
            
            const btnBorrar = document.createElement('button'); // Crea el botón de borrar
            btnBorrar.textContent = 'BORRAR';
            btnBorrar.classList.add('acciones-btn', 'btn-borrar'); // Añade clases CSS
            btnBorrar.onclick = () => borrarEntrada(entrada.id); // Asigna la función de borrar al hacer clic

            celdaAcciones.appendChild(btnEditar); // Añade el botón de editar a la celda de acciones
            celdaAcciones.appendChild(btnBorrar); // Añade el botón de borrar a la celda de acciones
        });
    }

    // --- ACTUALIZAR RESUMEN ---
    // Función para recalcular y mostrar la suma de horas, y el total final
    function actualizarResumen() {
        const sumaHoras = entradas.reduce((acc, curr) => acc + parseFloat(curr.horas), 0); // Suma todas las horas de las entradas
        const totalFinal = sumaHoras * multiplicador; // Calcula el total multiplicando suma de horas por el multiplicador

        // --- CAMBIO: SUMA DE HORAS A 1 DECIMAL ---
        displaySumaHoras.textContent = sumaHoras.toFixed(1); // Muestra la suma de horas formateada a 1 decimal
        displayTotalFinal.textContent = totalFinal.toFixed(3); // Muestra el total final formateado a 3 decimales
    }

    // --- AGREGAR ENTRADA ---
    // Event listener para el botón 'Agregar'
    btnAgregar.addEventListener('click', () => {
        const fecha = inputFecha.value; // Obtiene el valor del input de fecha
        const horas = parseFloat(inputHoras.value); // Obtiene y convierte a número las horas del input

        if (!fecha) { // Validación: si no hay fecha
            alert('Por favor, selecciona una fecha.');
            return; // Detiene la ejecución de la función
        }
        if (isNaN(horas) || horas <= 0) { // Validación: si las horas no son un número válido o son cero o negativas
            alert('Por favor, introduce un número de horas válido.');
            return; // Detiene la ejecución
        }

        const nuevaEntrada = { // Crea un nuevo objeto para la entrada
            id: Date.now(), // ID único basado en la fecha y hora actual (timestamp)
            fecha: fecha,
            horas: horas
        };
        entradas.push(nuevaEntrada); // Añade la nueva entrada al array 'entradas'
        
        renderizarTabla(); // Actualiza la tabla en pantalla
        actualizarResumen(); // Actualiza los cálculos del resumen
        guardarDatos(); // Guarda los datos en localStorage

        inputHoras.value = ''; // Limpia el input de horas
        inputHoras.focus(); // Pone el foco de nuevo en el input de horas para facilitar la siguiente entrada
    });

    // --- EDITAR ENTRADA ---
    // Función para editar una entrada existente (se llama desde el botón 'EDITAR' de una fila)
    function editarEntrada(id) {
        const entrada = entradas.find(e => e.id === id); // Busca la entrada en el array por su ID
        if (!entrada) return; // Si no se encuentra la entrada, no hace nada

        // Pide al usuario la nueva fecha
        const nuevaFecha = prompt(`Editar fecha (YYYY-MM-DD) para ${formatearFecha(entrada.fecha)}:`, entrada.fecha);
        if (nuevaFecha !== null && !/^\d{4}-\d{2}-\d{2}$/.test(nuevaFecha)) { // Validación del formato de fecha
            alert("Formato de fecha incorrecto. Debe ser YYYY-MM-DD.");
            return;
        }

        // Pide al usuario las nuevas horas
        const nuevasHorasStr = prompt(`Editar horas para ${formatearFecha(nuevaFecha || entrada.fecha)} (actual: ${entrada.horas}):`, entrada.horas);
        const nuevasHoras = parseFloat(nuevasHorasStr);

        if (nuevaFecha !== null) entrada.fecha = nuevaFecha; // Actualiza la fecha si el usuario ingresó algo
        
        // Actualiza las horas si el usuario ingresó un valor válido
        if (nuevasHorasStr !== null && !isNaN(nuevasHoras) && nuevasHoras > 0) {
            entrada.horas = nuevasHoras;
        } else if (nuevasHorasStr !== null) { // Si ingresó algo pero no es válido
            alert('Valor de horas inválido.');
            return; 
        }
        
        renderizarTabla(); // Actualiza la tabla
        actualizarResumen(); // Actualiza el resumen
        guardarDatos(); // Guarda los cambios
    }

    // --- BORRAR ENTRADA ---
    // Función para borrar una entrada (se llama desde el botón 'BORRAR' de una fila)
    function borrarEntrada(id) {
        if (confirm('¿Estás seguro de que quieres borrar esta entrada?')) { // Pide confirmación al usuario
            entradas = entradas.filter(e => e.id !== id); // Crea un nuevo array excluyendo la entrada con el ID a borrar
            renderizarTabla(); // Actualiza la tabla
            actualizarResumen(); // Actualiza el resumen
            guardarDatos(); // Guarda los cambios
        }
    }

    // --- EDITAR MULTIPLICADOR ---
    // Event listener para hacer editable el multiplicador con doble clic
    displayMultiplicador.addEventListener('dblclick', () => {
        displayMultiplicador.style.display = 'none'; // Oculta el span que muestra el valor
        inputMultiplicador.style.display = 'inline-block'; // Muestra el input para editar
        // --- CAMBIO: MULTIPLICADOR INPUT A 3 DECIMALES ---
        inputMultiplicador.value = multiplicador.toFixed(3); // Pone el valor actual en el input, con 3 decimales
        inputMultiplicador.focus(); // Pone el foco en el input
        inputMultiplicador.select(); // Selecciona el texto del input
    });

    // Event listeners para guardar el nuevo multiplicador cuando el input pierde el foco o se presiona Enter
    inputMultiplicador.addEventListener('blur', guardarNuevoMultiplicador);
    inputMultiplicador.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evita el comportamiento por defecto de Enter en un formulario
            guardarNuevoMultiplicador();
        }
    });

    // Función para guardar el nuevo valor del multiplicador
    function guardarNuevoMultiplicador() {
        const nuevoValor = parseFloat(inputMultiplicador.value); // Obtiene y convierte el valor del input
        if (!isNaN(nuevoValor) && nuevoValor >= 0) { // Validación: si es un número válido y no negativo
            multiplicador = nuevoValor;
        } else {
            alert("Por favor, introduce un valor multiplicador numérico válido.");
        }
        // --- CAMBIO: MULTIPLICADOR DISPLAY A 3 DECIMALES ---
        displayMultiplicador.textContent = multiplicador.toFixed(3); // Muestra el nuevo multiplicador con 3 decimales
        displayMultiplicador.style.display = 'inline-block'; // Muestra de nuevo el span
        inputMultiplicador.style.display = 'none'; // Oculta el input
        
        actualizarResumen(); // Recalcula el total final con el nuevo multiplicador
        guardarDatos(); // Guarda el nuevo multiplicador
    }

    // --- REINICIAR TODO ---
    // Event listener para el botón 'Reiniciar Todo'
    btnResetTodo.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar TODAS las entradas y reiniciar el multiplicador? Esta acción no se puede deshacer.')) {
            entradas = []; // Vacía el array de entradas
            multiplicador = 1.000; // Restablece el multiplicador a su valor por defecto (con 3 decimales)
            localStorage.removeItem('horasTrabajadas_entradas'); // Elimina las entradas de localStorage
            localStorage.removeItem('horasTrabajadas_multiplicador'); // Elimina el multiplicador de localStorage
            
            renderizarTabla(); // Actualiza la tabla (quedará vacía)
            actualizarResumen(); // Actualiza el resumen (quedará en ceros)
            // --- CAMBIO: MULTIPLICADOR DISPLAY A 3 DECIMALES AL RESETEAR ---
            displayMultiplicador.textContent = multiplicador.toFixed(3); // Muestra el multiplicador reseteado con 3 decimales
            inputFecha.value = ''; // Limpia el input de fecha
            inputHoras.value = ''; // Limpia el input de horas
            inicializarFecha(); // Pone la fecha actual en el input de fecha
        }
    });

     // --- INICIALIZACIÓN ---
     // Función para poner la fecha actual en el input de fecha al cargar la página
    function inicializarFecha() {
        const hoy = new Date(); // Crea un objeto Date con la fecha y hora actual
        const offset = hoy.getTimezoneOffset(); // Obtiene la diferencia en minutos con UTC (zona horaria)
        const hoyLocal = new Date(hoy.getTime() - (offset * 60 * 1000)); // Ajusta la fecha a la zona horaria local
        inputFecha.value = hoyLocal.toISOString().split('T')[0]; // Formatea a YYYY-MM-DD y la asigna al input
    }

    inicializarFecha(); // Llama a la función para inicializar la fecha
    cargarDatos(); // Carga los datos guardados al iniciar la página
});
// --- FIN DEL CÓDIGO JAVASCRIPT COMPLETO ---
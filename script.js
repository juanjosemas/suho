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

    // Elemento del DOM para el botón de exportar
    const btnExportarPDF = document.getElementById('btnExportarPDF');

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
    function procesarNuevaEntrada() {
        const fecha = inputFecha.value;
        const horas = parseFloat(inputHoras.value);

        if (!fecha) {
            alert('Por favor, selecciona una fecha.');
            inputFecha.focus();
            return false;
        }
        if (isNaN(horas) || horas <= 0) {
            alert('Por favor, introduce un número de horas válido.');
            inputHoras.focus();
            inputHoras.select();
            return false;
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

        inputHoras.value = '';
        
        if (document.activeElement === inputHoras || document.activeElement === inputFecha) {
            document.activeElement.blur(); 
        }

        return true;
    }

    // --- EVENTOS DE LA INTERFAZ DE USUARIO ---
    btnAgregar.addEventListener('click', procesarNuevaEntrada);
    inputHoras.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            procesarNuevaEntrada();
        }
    });
    inputFecha.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            inputHoras.focus();
        }
    });

    // --- EDITAR Y BORRAR ENTRADAS ---
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

            if (document.activeElement === inputHoras || document.activeElement === inputFecha) {
                document.activeElement.blur();
            }
        }
    });

    // --- MODIFICACIÓN DEFINITIVA: FUNCIÓN PARA EXPORTAR A PDF USANDO ÁREA INVISIBLE ---
    function exportarAPDF() {
        // 1. Obtener los elementos de la zona de impresión invisible
        const areaImprimible = document.getElementById('area-imprimible');
        const tablaImprimibleBody = document.getElementById('tabla-imprimible').getElementsByTagName('tbody')[0];
        const resumenImprimible = document.getElementById('resumen-imprimible');

        // 2. Limpiar cualquier contenido anterior
        tablaImprimibleBody.innerHTML = '';
        resumenImprimible.innerHTML = '';

        // 3. Poblar la tabla invisible con los datos actuales
        entradas.forEach(entrada => {
            const fila = tablaImprimibleBody.insertRow();
            fila.insertCell().textContent = formatearFecha(entrada.fecha);
            fila.insertCell().textContent = parseFloat(entrada.horas).toFixed(1);
        });

        // 4. Poblar el resumen invisible con los datos actuales
        const sumaHoras = entradas.reduce((acc, curr) => acc + parseFloat(curr.horas), 0);
        const totalFinal = sumaHoras * multiplicador;

        resumenImprimible.innerHTML = `
            <div class="fila-resumen-imprimible">
                <span>MULTIPLICADOR:</span>
                <span>${multiplicador.toFixed(3)}</span>
            </div>
            <div class="fila-resumen-imprimible">
                <span>SUMA DE LAS HORAS:</span>
                <span>${sumaHoras.toFixed(1)}</span>
            </div>
            <div class="fila-resumen-imprimible gran-total-imprimible">
                <span>TOTAL:</span>
                <span>${totalFinal.toFixed(3)}</span>
            </div>
        `;

        // 5. Configurar y generar el PDF a partir del área invisible ya preparada
        const hoy = new Date().toISOString().split('T')[0];
        const nombreArchivo = `Horas_Trabajadas_${hoy}.pdf`;
        const opt = {
          margin:       10,
          filename:     nombreArchivo,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(areaImprimible).save();
    }

    btnExportarPDF.addEventListener('click', exportarAPDF);

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
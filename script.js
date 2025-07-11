// --- INICIO DEL CÓDIGO JAVASCRIPT COMPLETO ---
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const inputFecha = document.getElementById('inputFecha');
    const inputHoras = document.getElementById('inputHoras');
    const btnAgregar = document.getElementById('btnAgregar');
    const tablaEntradasBody = document.getElementById('tablaEntradas').getElementsByTagName('tbody')[0];
    const displayMultiplicador = document.getElementById('displayMultiplicador');
    const inputMultiplicador = document.getElementById('inputMultiplicador');
    const displaySumaHoras = document.getElementById('displaySumaHoras');
    const displayTotalFinal = document.getElementById('displayTotalFinal');
    const btnResetTodo = document.getElementById('btnResetTodo');
    const btnExportarPDF = document.getElementById('btnExportarPDF');

    // Variables de estado
    let entradas = [];
    let multiplicador = 1.000;

    // --- LÓGICA DE DATOS ---
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

    function guardarDatos() {
        localStorage.setItem('horasTrabajadas_entradas', JSON.stringify(entradas));
        localStorage.setItem('horasTrabajadas_multiplicador', multiplicador.toString());
    }

    function formatearFecha(fechaString) {
        if (!fechaString) return '';
        const [year, month, day] = fechaString.split('-');
        return `${day}/${month}/${year.slice(-2)}`;
    }
    
    // --- RENDERIZADO Y ACTUALIZACIÓN DE LA UI ---
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

    function actualizarResumen() {
        const sumaHoras = entradas.reduce((acc, curr) => acc + parseFloat(curr.horas), 0);
        const totalFinal = sumaHoras * multiplicador;
        displaySumaHoras.textContent = sumaHoras.toFixed(1);
        displayTotalFinal.textContent = totalFinal.toFixed(3);
    }

    // --- MANEJO DE ENTRADAS DEL USUARIO ---
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
        const nuevaEntrada = { id: Date.now(), fecha: fecha, horas: horas };
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

    function guardarNuevoMultiplicador() {
        const nuevoValor = parseFloat(inputMultiplicador.value);
        if (!isNaN(nuevoValor) && nuevoValor >= 0) {
            multiplicador = nuevoValor;
        }
        displayMultiplicador.textContent = multiplicador.toFixed(3);
        displayMultiplicador.style.display = 'inline-block';
        inputMultiplicador.style.display = 'none';
        actualizarResumen();
        guardarDatos();
    }

    displayMultiplicador.addEventListener('dblclick', () => {
        displayMultiplicador.style.display = 'none';
        inputMultiplicador.style.display = 'inline-block';
        inputMultiplicador.value = multiplicador.toFixed(3);
        inputMultiplicador.focus();
        inputMultiplicador.select();
    });

    btnResetTodo.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar TODAS las entradas y reiniciar el multiplicador? Esta acción no se puede deshacer.')) {
            entradas = [];
            multiplicador = 1.000;
            localStorage.clear();
            renderizarTabla();
            actualizarResumen();
            displayMultiplicador.textContent = multiplicador.toFixed(3);
            inicializarFecha();
        }
    });

    // --- ASIGNACIÓN DE EVENTOS ---
    btnAgregar.addEventListener('click', procesarNuevaEntrada);
    inputHoras.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); procesarNuevaEntrada(); } });
    inputFecha.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); inputHoras.focus(); } });
    inputMultiplicador.addEventListener('blur', guardarNuevoMultiplicador);
    inputMultiplicador.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); guardarNuevoMultiplicador(); } });
    btnExportarPDF.addEventListener('click', exportarAPDF);

    // --- FUNCIÓN DE EXPORTACIÓN A PDF (VERSIÓN DEFINITIVA CON jsPDF-AutoTable) ---
    function exportarAPDF() {
        // Obtenemos el constructor de jsPDF del objeto window
        const { jsPDF } = window.jspdf;

        // Creamos un nuevo documento PDF
        const doc = new jsPDF();

        // 1. Preparamos los datos para la tabla del PDF
        const tableHead = [['FECHA', 'HORAS']];
        const tableBody = entradas.map(entrada => [
            formatearFecha(entrada.fecha),
            parseFloat(entrada.horas).toFixed(1)
        ]);

        // 2. Añadimos el título al PDF
        doc.setFontSize(18);
        doc.text('Registro de Horas Trabajadas', 14, 22);

        // 3. Usamos autoTable para dibujar la tabla
        doc.autoTable({
            head: tableHead,
            body: tableBody,
            startY: 30, // Posición Y donde empieza la tabla
            headStyles: { fillColor: [22, 160, 133] }, // Color de la cabecera
            styles: { halign: 'center' }, // Centrar texto en celdas
            columnStyles: { 0: { halign: 'left' }, 1: { halign: 'right' } } // Alinear columnas
        });

        // 4. Calculamos los totales del resumen
        const sumaHoras = entradas.reduce((acc, curr) => acc + parseFloat(curr.horas), 0);
        const totalFinal = sumaHoras * multiplicador;

        // 5. Añadimos el resumen al final del documento
        // Obtenemos la posición Y donde terminó la tabla para dibujar el resumen debajo
        let finalY = doc.lastAutoTable.finalY || 50;
        doc.setFontSize(10);
        doc.text(`Multiplicador: ${multiplicador.toFixed(3)}`, 14, finalY + 10);
        doc.text(`Suma de las Horas: ${sumaHoras.toFixed(1)}`, 14, finalY + 15);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`TOTAL: ${totalFinal.toFixed(3)}`, 14, finalY + 22);
        
        // 6. Guardamos el archivo
        const hoy = new Date().toISOString().split('T')[0];
        const nombreArchivo = `Horas_Trabajadas_${hoy}.pdf`;
        doc.save(nombreArchivo);
    }

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
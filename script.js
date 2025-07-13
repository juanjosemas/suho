// --- INICIO DEL CÓDIGO JAVASCRIPT COMPLETO Y COMENTADO ---
document.addEventListener('DOMContentLoaded', () => {

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
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

    // --- VARIABLES GLOBALES ---
    let entradas = [];
    let multiplicador = 1.000;

    // --- GESTIÓN DE DATOS ---
    function cargarDatos() {
        const entradasGuardadas = localStorage.getItem('horasTrabajadas_entradas');
        if (entradasGuardadas) { entradas = JSON.parse(entradasGuardadas); }
        const multiplicadorGuardado = localStorage.getItem('horasTrabajadas_multiplicador');
        if (multiplicadorGuardado) { multiplicador = parseFloat(multiplicadorGuardado); }
        ordenarEntradas();
        renderizarTabla();
        actualizarResumen();
        displayMultiplicador.textContent = multiplicador.toFixed(3);
    }
    function guardarDatos() {
        localStorage.setItem('horasTrabajadas_entradas', JSON.stringify(entradas));
        localStorage.setItem('horasTrabajadas_multiplicador', multiplicador.toString());
    }
    function ordenarEntradas() {
        entradas.sort((a, b) => a.fecha.localeCompare(b.fecha));
    }

    // --- INTERFAZ DE USUARIO (UI) ---
    function formatearFecha(fechaString) {
        if (!fechaString) return '';
        const [year, month, day] = fechaString.split('-');
        return `${day}/${month}/${year.slice(-2)}`;
    }
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
            btnEditar.type = 'button';
            btnEditar.classList.add('acciones-btn', 'btn-editar');
            btnEditar.onclick = () => editarEntrada(entrada.id);
            const btnBorrar = document.createElement('button');
            btnBorrar.textContent = 'BORRAR';
            btnBorrar.type = 'button';
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

    // --- LÓGICA DE LA APLICACIÓN ---
    function procesarNuevaEntrada() {
        const fecha = inputFecha.value;
        const horas = parseFloat(inputHoras.value);
        if (!fecha) { alert('Por favor, selecciona una fecha.'); inputFecha.focus(); return false; }
        if (isNaN(horas) || horas <= 0) { alert('Por favor, introduce un número de horas válido.'); inputHoras.focus(); inputHoras.select(); return false; }
        const nuevaEntrada = { id: Date.now(), fecha: fecha, horas: horas };
        entradas.push(nuevaEntrada);
        ordenarEntradas();
        renderizarTabla();
        actualizarResumen();
        guardarDatos();
        inputHoras.value = ''; 
        if (document.activeElement === inputHoras || document.activeElement === inputFecha) { document.activeElement.blur(); }
        return true; 
    }
    function editarEntrada(id) {
        const entrada = entradas.find(e => e.id === id);
        if (!entrada) return;
        const nuevaFecha = prompt(`Editar fecha (YYYY-MM-DD) para ${formatearFecha(entrada.fecha)}:`, entrada.fecha);
        if (nuevaFecha !== null && !/^\d{4}-\d{2}-\d{2}$/.test(nuevaFecha)) { alert("Formato de fecha incorrecto. Debe ser YYYY-MM-DD."); return; }
        const nuevasHorasStr = prompt(`Editar horas para ${formatearFecha(nuevaFecha || entrada.fecha)} (actual: ${entrada.horas}):`, entrada.horas);
        const nuevasHoras = parseFloat(nuevasHorasStr);
        if (nuevaFecha !== null) entrada.fecha = nuevaFecha;
        if (nuevasHorasStr !== null && !isNaN(nuevasHoras) && nuevasHoras > 0) { entrada.horas = nuevasHoras; } else if (nuevasHorasStr !== null) { alert('Valor de horas inválido.'); return; }
        ordenarEntradas();
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
        if (!isNaN(nuevoValor) && nuevoValor >= 0) { multiplicador = nuevoValor; } else { alert("Por favor, introduce un valor multiplicador numérico válido."); }
        displayMultiplicador.textContent = multiplicador.toFixed(3);
        displayMultiplicador.style.display = 'inline-block';
        inputMultiplicador.style.display = 'none';
        actualizarResumen();
        guardarDatos();
    }

    // --- FUNCIÓN DE EXPORTACIÓN (MÉTODO FINAL Y ROBUSTO) ---
    function exportarAPDF() {
        // 1. Recopilar datos
        const sumaHoras = parseFloat(displaySumaHoras.textContent);
        const totalFinal = parseFloat(displayTotalFinal.textContent);
        const filasTablaReporte = entradas.map(entrada => `<tr><td>${formatearFecha(entrada.fecha)}</td><td>${parseFloat(entrada.horas).toFixed(1)}</td></tr>`).join('');

        // 2. Definir los estilos CSS para la página de impresión
        const estilosPDF = `
            body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 15px; }
            h1 { color: #111; text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 10px; font-size: 24px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #e9e9e9; font-weight: bold; text-align: center; }
            td:nth-child(2) { text-align: center; }
            .reporte-resumen { border: 1px solid #ddd; background-color: #f9f9f9; padding: 15px; margin-top: 20px; border-radius: 5px; }
            .reporte-resumen p { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
            .reporte-resumen p strong { font-weight: bold; }
            .reporte-footer { text-align: center; margin-top: 30px; font-size: 10px; color: #888; }
        `;

        // 3. Abrir una nueva ventana en blanco
        const printWindow = window.open('', '_blank');

        // 4. Escribir el HTML completo del informe en esa nueva ventana
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Informe de Horas</title>
                <!-- Ya NO usamos la fuente personalizada para evitar errores de renderizado -->
                <style>${estilosPDF}</style>
                <!-- Se inyecta la librería DENTRO de la nueva ventana -->
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
            </head>
            <body>
                <div id="informe-para-exportar">
                    <h1>Informe de Horas Trabajadas</h1>
                    <table>
                        <thead><tr><th>FECHA</th><th>HORAS</th></tr></thead>
                        <tbody>${filasTablaReporte}</tbody>
                    </table>
                    <div class="reporte-resumen">
                        <p><strong>SUMA DE LAS HORAS:</strong> <span>${sumaHoras.toFixed(1)}</span></p>
                        <p><strong>MULTIPLICADOR:</strong> <span>${multiplicador.toFixed(3)}</span></p>
                        <p><strong>TOTAL FINAL:</strong> <span>${totalFinal.toFixed(3)}</span></p>
                    </div>
                    <div class="reporte-footer">
                        <p>Informe generado el ${new Date().toLocaleString('es-ES')}</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        
        // 5. Cerrar el flujo de escritura
        printWindow.document.close();
        printWindow.focus(); 
        
        // 6. Ejecutar html2pdf DENTRO de la nueva ventana
        // Usamos un pequeño retardo para asegurar que la librería se ha cargado en la nueva ventana
        setTimeout(() => { 
            const elemento = printWindow.document.getElementById('informe-para-exportar');
            const opt = {
              margin: 15,
              filename: `informe_horas_${new Date().toISOString().split('T')[0]}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            // Llamamos a html2pdf desde el contexto de la nueva ventana
            printWindow.html2pdf().from(elemento).set(opt).save().then(() => {
                printWindow.close(); // Cerrar la ventana emergente después de guardar
            });
        }, 500); // Medio segundo de retardo para más seguridad
    }

    // --- EVENTOS (Listeners) ---
    btnAgregar.addEventListener('click', procesarNuevaEntrada);
    inputHoras.addEventListener('keypress', (event) => { if (event.key === 'Enter' || event.keyCode === 13) { event.preventDefault(); procesarNuevaEntrada(); } });
    inputFecha.addEventListener('keypress', (event) => { if (event.key === 'Enter' || event.keyCode === 13) { event.preventDefault(); inputHoras.focus(); } });
    displayMultiplicador.addEventListener('dblclick', () => { displayMultiplicador.style.display = 'none'; inputMultiplicador.style.display = 'inline-block'; inputMultiplicador.value = multiplicador.toFixed(3); inputMultiplicador.focus(); inputMultiplicador.select(); });
    inputMultiplicador.addEventListener('blur', guardarNuevoMultiplicador);
    inputMultiplicador.addEventListener('keypress', (event) => { if (event.key === 'Enter' || event.keyCode === 13) { event.preventDefault(); guardarNuevoMultiplicador(); } });
    btnResetTodo.addEventListener('click', () => { if (confirm('¿Estás seguro de que quieres borrar TODAS las entradas? El multiplicador no cambiará. Esta acción no se puede deshacer.')) { entradas = []; localStorage.removeItem('horasTrabajadas_entradas'); renderizarTabla(); actualizarResumen(); inicializarFecha(); inputHoras.value = ''; if (document.activeElement === inputHoras || document.activeElement === inputFecha) { document.activeElement.blur(); } } });
    btnExportarPDF.addEventListener('click', exportarAPDF);

    // --- INICIALIZACIÓN DE LA APLICACIÓN ---
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
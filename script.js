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
    
    // --- CAMBIO: Se cambia la referencia al nuevo ID del botón ---
    const btnImprimir = document.getElementById('btnImprimir');

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
        ordenarEntradas();
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
    
    // --- FUNCIÓN PARA ORDENAR POR FECHA ---
    function ordenarEntradas() {
        entradas.sort((a, b) => a.fecha.localeCompare(b.fecha));
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
        
        ordenarEntradas();
        renderizarTabla();
        actualizarResumen();
        guardarDatos();

        inputHoras.value = ''; 
        
        if (document.activeElement === inputHoras || document.activeElement === inputFecha) {
            document.activeElement.blur(); 
        }

        return true; 
    }

    // --- AGREGAR ENTRADA (POR CLIC EN BOTÓN) ---
    btnAgregar.addEventListener('click', () => {
        procesarNuevaEntrada();
    });

    // --- AGREGAR ENTRADA CON TECLA "INTRO" EN EL CAMPO DE HORAS ---
    inputHoras.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault(); 
            procesarNuevaEntrada(); 
        }
    });

    // --- PERMITIR "INTRO" EN FECHA PARA PASAR A HORAS ---
    inputFecha.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            inputHoras.focus(); 
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
        
        ordenarEntradas();
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
        if (confirm('¿Estás seguro de que quieres borrar TODAS las entradas? El multiplicador no cambiará. Esta acción no se puede deshacer.')) {
            entradas = [];
            localStorage.removeItem('horasTrabajadas_entradas');
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

    // --- CAMBIO: FUNCIÓN DEFINITIVA PARA IMPRIMIR O GUARDAR COMO PDF ---
    function imprimirInforme() {
        if (entradas.length === 0) {
            alert("No hay datos para exportar. Agrega al menos una entrada.");
            return;
        }

        // 1. Crear los estilos para el informe
        const estilos = `
            <style>
                body { font-family: Arial, sans-serif; margin: 30px; }
                table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .resumen { float: right; width: 350px; margin-top: 25px; border-top: 2px solid #333; padding-top: 10px; }
                .resumen-fila { display: flex; justify-content: space-between; padding: 5px; }
                .total-final { font-weight: bold; font-size: 1.1em; }
            </style>
        `;

        // 2. Crear las filas de la tabla principal
        let filasHtml = '';
        entradas.forEach(entrada => {
            filasHtml += `
                <tr>
                    <td>${formatearFecha(entrada.fecha)}</td>
                    <td>${parseFloat(entrada.horas).toFixed(1)}</td>
                </tr>
            `;
        });

        // 3. Obtener los totales
        const totalHoras = displaySumaHoras.textContent;
        const totalFinal = displayTotalFinal.textContent;

        // 4. Montar el HTML completo del informe
        const contenidoHtml = `
            <html>
            <head>
                <title>Informe de Horas Trabajadas</title>
                ${estilos}
            </head>
            <body>
                <h1>Informe de Horas Trabajadas</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Horas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasHtml}
                    </tbody>
                </table>
                <div class="resumen">
                    <div class="resumen-fila">
                        <span>Total de Horas:</span>
                        <span>${totalHoras}</span>
                    </div>
                    <div class="resumen-fila total-final">
                        <span>Total a Cobrar (€):</span>
                        <span>${totalFinal}</span>
                    </div>
                </div>
            </body>
            </html>
        `;

        // 5. Abrir una nueva ventana, escribir el HTML y llamar a imprimir
        const win = window.open('', '', 'height=700,width=700');
        win.document.write(contenidoHtml);
        win.document.close(); // Necesario para que la carga finalice
        win.print(); // Abre el diálogo de impresión
    }

    btnImprimir.addEventListener('click', imprimirInforme);

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

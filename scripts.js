document.addEventListener('DOMContentLoaded', function () {
    const scheduleForm = document.getElementById('scheduleForm'); // Formulario para ingresar datos
    const scheduleTable = document.getElementById('scheduleTable').getElementsByTagName('tbody')[0]; // Cuerpo de la tabla donde se agregarán las filas
    const totalHoursElement = document.getElementById('totalHours'); // Elemento para mostrar el total de horas trabajadas
    const multiplierInput = document.getElementById('multiplier'); // Input para el multiplicador
    const resultElement = document.getElementById('result'); // Elemento para mostrar el resultado
    let totalHours = 0; // Variable para almacenar el total de horas trabajadas
    let editRowIndex = -1; // Índice de la fila que se está editando

    // Función para formatear la fecha en el formato "día/mes/año"
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Función para actualizar el total de horas trabajadas
    function updateTotalHours() {
        totalHours = Array.from(scheduleTable.rows).reduce((total, row) => {
            return total + parseFloat(row.cells[1].textContent);
        }, 0);
        totalHoursElement.textContent = totalHours.toFixed(2);
        updateResult();
    }

    // Función para actualizar el resultado del multiplicador
    function updateResult() {
        const multiplier = parseFloat(multiplierInput.value) || 0;
        const result = totalHours * multiplier;
        resultElement.textContent = result.toFixed(3);
    }

    // Función para guardar las entradas en localStorage
    function saveToLocalStorage() {
        const entries = Array.from(scheduleTable.rows).map(row => ({
            day: row.cells[0].textContent,
            hours: parseFloat(row.cells[1].textContent)
        }));
        localStorage.setItem('scheduleEntries', JSON.stringify(entries));
    }

    // Función para cargar las entradas desde localStorage
    function loadFromLocalStorage() {
        const entries = JSON.parse(localStorage.getItem('scheduleEntries')) || [];
        entries.forEach(entry => addRowToTable(entry.day, entry.hours));
        updateTotalHours();
    }

    // Función para agregar una fila a la tabla
    function addRowToTable(day, hours, index = -1) {
        const newRow = scheduleTable.insertRow(index); // Crear una nueva fila en la tabla
        const dayCell = newRow.insertCell(0); // Celda para la fecha
        const hoursCell = newRow.insertCell(1); // Celda para las horas trabajadas
        const actionsCell = newRow.insertCell(2); // Celda para los botones de acción

        dayCell.textContent = day;
        hoursCell.textContent = hours;
        hoursCell.className = 'horas'; // Aplicar la clase 'horas' a la celda de horas trabajadas

        // Crear el botón de editar
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.className = 'edit'; // Clase para el botón de editar
        editButton.setAttribute('aria-label', 'Editar entrada'); // Agregar atributo aria-label para accesibilidad
        editButton.addEventListener('click', function () {
            editRow(newRow); // Llamar a la función para editar la fila
        });
        actionsCell.appendChild(editButton);

        // Crear el botón de eliminar
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.className = 'delete'; // Clase para el botón de eliminar
        deleteButton.setAttribute('aria-label', 'Eliminar entrada'); // Agregar atributo aria-label para accesibilidad
        deleteButton.addEventListener('click', function () {
            if (confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
                newRow.remove(); // Eliminar la fila correspondiente
                updateTotalHours(); // Actualizar el total de horas
                saveToLocalStorage(); // Guardar cambios en localStorage
            }
        });
        actionsCell.appendChild(deleteButton); // Agregar el botón de eliminar a la celda de acciones
    }

    // Función para editar una fila en la tabla
    function editRow(row) {
        editRowIndex = row.rowIndex - 1; // Almacenar el índice de la fila que se está editando
        const day = row.cells[0].textContent;
        const hours = row.cells[1].textContent;

        // Formatear la fecha al formato requerido por el input type="date"
        document.getElementById('day').value = formatToInputDate(day);
        document.getElementById('hours').value = hours;

        // Eliminar la fila original
        row.remove();
        updateTotalHours();
        saveToLocalStorage();
    }

    // Función para formatear la fecha a un formato compatible con el input type="date"
    function formatToInputDate(dateString) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Manejador de eventos para el formulario
    scheduleForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        const day = document.getElementById('day').value; // Obtener el valor del campo de fecha
        const hours = parseFloat(document.getElementById('hours').value); // Obtener el valor del campo de horas

        if (day && !isNaN(hours)) {
            const formattedDay = formatDate(day); // Formatear la fecha
            addRowToTable(formattedDay, hours, editRowIndex); // Agregar la nueva fila a la tabla
            editRowIndex = -1; // Restablecer el índice de edición
            updateTotalHours(); // Actualizar el total de horas
            saveToLocalStorage(); // Guardar cambios en localStorage
            scheduleForm.reset(); // Resetear el formulario
        }
    });

    // Manejador de eventos para el input del multiplicador
    multiplierInput.addEventListener('input', updateResult);

    loadFromLocalStorage(); // Cargar datos desde localStorage cuando la página se carga
});
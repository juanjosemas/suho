document.addEventListener('DOMContentLoaded', function () {
    const scheduleForm = document.getElementById('scheduleForm'); // Formulario para ingresar datos
    const scheduleTable = document.getElementById('scheduleTable').getElementsByTagName('tbody')[0]; // Cuerpo de la tabla donde se agregarán las filas
    const totalHoursElement = document.getElementById('totalHours'); // Elemento para mostrar el total de horas trabajadas
    let totalHours = 0; // Variable para almacenar el total de horas trabajadas

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
    function addRowToTable(day, hours) {
        const newRow = scheduleTable.insertRow(); // Crear una nueva fila en la tabla
        const dayCell = newRow.insertCell(0); // Celda para la fecha
        const hoursCell = newRow.insertCell(1); // Celda para las horas trabajadas
        const actionsCell = newRow.insertCell(2); // Celda para los botones de acción

        dayCell.textContent = day;
        hoursCell.textContent = hours;
        hoursCell.className = 'narrow'; // Aplicar la clase narrow a la celda de horas trabajadas

        // Crear el botón de eliminar
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.className = 'delete';
        deleteButton.addEventListener('click', function () {
            newRow.remove(); // Eliminar la fila correspondiente
            updateTotalHours(); // Actualizar el total de horas
            saveToLocalStorage(); // Guardar cambios en localStorage
        });
        actionsCell.appendChild(deleteButton); // Agregar el botón de eliminar a la celda de acciones
    }

    // Manejador de eventos para el formulario
    scheduleForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        const day = document.getElementById('day').value; // Obtener el valor del campo de fecha
        const hours = parseFloat(document.getElementById('hours').value); // Obtener el valor del campo de horas

        if (day && !isNaN(hours)) {
            const formattedDay = formatDate(day); // Formatear la fecha
            addRowToTable(formattedDay, hours); // Agregar la nueva fila a la tabla
            updateTotalHours(); // Actualizar el total de horas
            saveToLocalStorage(); // Guardar cambios en localStorage
            scheduleForm.reset(); // Resetear el formulario
        }
    });

    loadFromLocalStorage(); // Cargar datos desde localStorage cuando la página se carga
});
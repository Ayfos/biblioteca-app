let myLibrary = []; // Array que contendrá los libros

// =======================================================
// LÓGICA DE PERSISTENCIA
// =======================================================

function saveLocal() {
    // Guarda el array convertido a JSON en el navegador
    localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
}

function restoreLocal() {
    const libraryJson = localStorage.getItem('myLibrary');

    if (libraryJson) {
        const tempLibrary = JSON.parse(libraryJson);
        // Reconstruye los objetos Book manteniendo los IDs existentes
        myLibrary = tempLibrary.map(book => new Book(book.title, book.author, book.pages, book.read, book.id));
    } else {
        // Añadimos libros de ejemplo solo la primera vez que no hay datos
        addBookToLibrary('The Great Gatsby', 'F. Scott Fitzgerald', 180, true);
        addBookToLibrary('To Kill a Mockingbird', 'Harper Lee', 281, false);
        addBookToLibrary('1984', 'George Orwell', 328, true);
        addBookToLibrary('Pride and Prejudice', 'Jane Austen', 279, false);
        // Las llamadas a addBookToLibrary ya llaman a saveLocal() y render()
        return; 
    }
}

// =======================================================
// LÓGICA DE FORMATO DE DATOS
// =======================================================

function titleCase(str) {
    if (!str) return '';
    // Convierte a minúsculas, divide por espacios, capitaliza la primera letra de cada palabra y las une
    return str.toLowerCase().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// =======================================================
// SELECTORES GLOBALES
// =======================================================

const modal = document.getElementById('book-form-modal');
const addBookBtn = document.getElementById('add-book-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const newBookForm = document.getElementById('new-book-form');
const booksGrid = document.getElementById('book-grid');

// =======================================================
// LÓGICA DE EVENTOS DEL MODAL (Abierto/Cerrado/Envío)
// =======================================================

addBookBtn.addEventListener('click', () => {
    newBookForm.reset();
    modal.showModal();
});

closeModalBtn.addEventListener('click', () => {
    modal.close();
});

// Event listener para manejar el envío del formulario
newBookForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formElements = newBookForm.elements;

    // APLICACIÓN DEL FORMATO:
    const title = titleCase(formElements.title.value);
    const author = titleCase(formElements.author.value);

    const pages = parseInt(formElements.pages.value);
    const read = formElements.read.checked;

    addBookToLibrary(title, author, pages, read);
    modal.close();
});

// =======================================================
// CONSTRUCTOR Y LÓGICA DE DATOS
// =======================================================

function Book(title, author, pages, read, id = crypto.randomUUID()) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
    this.id = id;
}

function addBookToLibrary(title, author, pages, read) {
    const newBook = new Book(title, author, pages, read);
    myLibrary.push(newBook);
    saveLocal();
    render();
}

function removeBook(bookId) {
    myLibrary = myLibrary.filter(book => book.id !== bookId);
    saveLocal();
    render();
}

function toggleReadStatus(bookId) {
    const bookIndex = myLibrary.findIndex(book => book.id === bookId);

    if (bookIndex !== -1) {
        myLibrary[bookIndex].read = !myLibrary[bookIndex].read;
    }
    saveLocal();
    render();
}

// =======================================================
// EVENTOS DE INICIO Y DELEGACIÓN DE ACCIONES
// =======================================================

// Inicialización: Carga los datos guardados o los ejemplos iniciales
restoreLocal();
render();

// Delegación de eventos para los botones de las tarjetas
booksGrid.addEventListener('click', (e) => {
    const bookId = e.target.dataset.bookId;

    if (!bookId) return;

    if (e.target.classList.contains('delete-btn')) {
        removeBook(bookId);
    }

    if (e.target.classList.contains('toggle-read-btn')) {
        toggleReadStatus(bookId);
    }
});

// =======================================================
// FUNCIÓN PARA RENDERIZAR LOS LIBROS
// =======================================================

function render() {
    const libraryContainer = document.getElementById('book-grid');
    libraryContainer.innerHTML = '';

    myLibrary.forEach((book) => {
        const bookDiv = document.createElement('div');
        bookDiv.classList.add('book-card');

        // Estilo dinámico según estado de lectura
        if (book.read) {
            bookDiv.style.borderLeft = '8px solid var(--read-color)';
        } else {
            bookDiv.style.borderLeft = '8px solid var(--unread-color)';
        }

        // Título
        const title = document.createElement('h3');
        title.textContent = `"${book.title}"`;

        // Autor
        const author = document.createElement('p');
        author.textContent = `Autor: ${book.author}`;

        // Páginas
        const pages = document.createElement('p');
        pages.textContent = `Páginas: ${book.pages}`;

        // Estado de Lectura
        const readStatus = document.createElement('p');
        readStatus.textContent = book.read ? 'Leído' : 'No leído';

        // Botón de eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.dataset.bookId = book.id;

        // Botón de cambio de estado de lectura
        const toggleReadBtn = document.createElement('button');
        toggleReadBtn.textContent = book.read ? 'Marcar como No leído' : 'Marcar como Leído';
        toggleReadBtn.classList.add('toggle-read-btn');
        toggleReadBtn.dataset.bookId = book.id;

        // CREACIÓN DEL CONTENEDOR DE BOTONES (Clave para el CSS gap)
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group'); 
        
        buttonGroup.appendChild(deleteBtn);
        buttonGroup.appendChild(toggleReadBtn);
        
        // Añadir elementos al bookDiv
        bookDiv.appendChild(title);
        bookDiv.appendChild(author);
        bookDiv.appendChild(pages);
        bookDiv.appendChild(readStatus);
        bookDiv.appendChild(buttonGroup); // <-- Añadir el grupo de botones

        libraryContainer.appendChild(bookDiv);
    });
}
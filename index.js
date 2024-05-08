const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4099;



app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
   res.status(500).json({ error: 'Internal Server Error' });
});

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
//configuracion de archivos estaticos 

// Ruta de bienvenida
app.get('/inicio', (req, res) => {
    // Datos que quieres pasar a la vista
    const data = {
        message: 'Bienvenido a Buscalibros'
    };

    // Renderizar la vista 'inicio.ejs' y pasar los datos
    res.render('inicio', data);
});


// Ruta para buscar libros por término 
app.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        const books = response.data.items.map(item => ({
            title: item.volumeInfo.title || 'Title not available',
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
            description: item.volumeInfo.description || 'No description available',
            coverURL: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/150'
        }));
        res.render('search', { books }); // aca renderizo la vista 'search.ejs' y pasa los datos de los libros
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});


// Ruta para obtener detalles de un libro por ID

app.get('/books/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`);
        const book = {
            title: response.data.volumeInfo.title,
            author: response.data.volumeInfo.authors ? response.data.volumeInfo.authors.join(', ') : 'Unknown Author',
            description: response.data.volumeInfo.description || 'No description available',
            coverURL: response.data.volumeInfo.imageLinks ? response.data.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/150'
        };
        res.json(book);
    } catch (error) {
        next(error);
    }
});


// Ruta para manejar  favoritos
let favoriteBooks = [];

// Obtener lista de libros favoritos
app.get('/favorites', (req, res) => {
    console.log('Datos de libros favoritos:', favoriteBooks);
    res.render('favorites', { books : favoriteBooks });
});

// Agregar libro a favoritos
app.post('/favorites/add', (req, res) => {

    console.log('Datos recibidos para agregar libro a favoritos:', req.body);
   

    const { title, author, description, coverURL } = req.body;

    //objeto para representar el libro
    const newBook = {
        title: title,
        author: author,
        description: description,
        coverURL: coverURL
    };
    console.log('Nuevo libro:', newBook);

    // Agregar el libro a la lista de favoritos
    favoriteBooks.push(newBook);
    
    console.log('Libros favoritos:', favoriteBooks);
    
    res.redirect('/favorites'); // Redirigir a la página de favoritos después de agregar el libro
});

// Eliminar libro de favoritos
app.post('/favorites/remove', (req, res) => {
    const { id } = req.body;
    favoriteBooks = favoriteBooks.filter(book => book.id !== id);
    res.send('Eliminado correctamente');
});




// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`servidor ejecutandose correctamente en puerto ${PORT}`);
});

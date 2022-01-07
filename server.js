const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const Product = require('./models/products.js');
require('dotenv').config();
const productSeed = require('./models/productSeed.js')
const methodOverride = require('method-override')

// Database Connection
mongoose.connect(process.env.DATABASE_URL)

// Database Connection Error/Success
// Define callback functions for various events
const db = mongoose.connection
db.on("error", (err) => console.log(err.message + " is mongo not running?"))
db.on("connected", () => console.log("mongo connected"))
db.on("disconnected", () => console.log("mongo disconnected"))

app.set('view engine', 'ejs')

// Middleware
// Body parser middleware: give us access to req.body
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'))

app.use('/public', express.static('public'));

app.get('/products/seed', (req, res) => {
    // to remove any repeat instances of seed data
    Product.deleteMany({}, (error, allProducts) => {});

    Product.create(productSeed, (error, data) => {
            res.redirect('/products');
        }
    );
});

app.get('/', (req, res) => res.redirect('/products'));


// Index
app.get('/products', (req, res) => {
    Product.find({}, (err, allProducts) => {
        res.render('index', {
            products: allProducts
        })
    });
})

// New 
app.get('/products/new', (req, res) => {
    res.render('new')
})

// Delete
app.delete("/products/:id", (req, res) => {
    Product.findByIdAndDelete(req.params.id, (err, data) => {
        res.redirect('/products')
    })
  })

// Update
app.put("/products/:id", (req, res) => {
    Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
      (error, updatedProduct) => {
        res.redirect(`/products/${req.params.id}`)
      }
    )
  })

  app.put('/products/:id/buy', (req, res) => {
    Product.updateOne({_id: req.params.id}, {$inc:{'qty' : -1}},
    (error, product) => {
        res.redirect(`/products/${req.params.id}`)
    });
});

// Create
app.post('/products', (req, res) => {
    Product.create(req.body, (error, createdProduct) => {
        res.redirect('/products');
    });
})
// Edit 
app.get('/products/:id/edit', (req, res) => {
    Product.findById(req.params.id, (err, foundProduct) => {
        res.render('edit', {
            product: foundProduct,
        })
    })
})

// Show 
app.get('/products/:id', (req, res) => {
    Product.findById(req.params.id, (err, foundProduct) => {
        res.render('show', {product: foundProduct})
    })
})

app.use(morgan('dev'));
// Listener
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`server is listning on port: ${PORT}`));
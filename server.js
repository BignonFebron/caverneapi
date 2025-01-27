const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./src/routes/user');
const authRoutes = require('./src/routes/auth');
const settingsRoutes = require('./src/routes/settings');
const productRoutes = require('./src/routes/product');
const orderRoutes = require('./src/routes/order');
const deliveryZoneRoutes = require('./src/routes/delivery');
const weightPriceRoutes = require('./src/routes/weightPrice');
const cartRoutes = require('./src/routes/cart');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();

// Middleware JSON
app.use(express.json());

// Configuration CORS
app.use(cors({
    origin: 'http://localhost:3000', // Origine autorisée
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Méthodes HTTP autorisées
    allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/cart', cartRoutes); // Routes pour le panier
app.use('/delivery-zones', deliveryZoneRoutes); // Routes pour les zones de livraison
app.use('/weight-prices', weightPriceRoutes); // Routes pour les prix-poids


// Serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


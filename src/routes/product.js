const express = require("express");
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");

const router = express.Router();

// Configuration de Multer pour les images
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});
const upload = multer({ storage });

// Validation des données
const validateProduct = [
	body("name").notEmpty().withMessage("Le nom est requis"),
	body("description").notEmpty().withMessage("La description est requise"),
	body("storePrice")
		.isFloat({ min: 0 })
		.withMessage("Le prix magasin doit être positif"),
	body("dhlPrice")
		.isFloat({ min: 0 })
		.withMessage("Le prix DHL doit être positif"),
	body("shipPrice")
		.isFloat({ min: 0 })
		.withMessage("Le prix bateau doit être positif"),
	body("productCode").notEmpty().withMessage("Le code produit est requis"),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	},
];

// Routes
router.get("/list", async (req, res) => {
	try {
		const products = await Product.find();
		res.json(products);
	} catch (error) {
		res.status(500).json({
			error: "Erreur lors de la récupération des produits",
		});
	}
});

router.post(
	"/add",
	upload.array("images", 5),
	validateProduct,
	async (req, res) => {
		try {
			const newProduct = new Product({
				name: req.body.name,
				description: req.body.description,
				images: req.files.map((file) => file.path),
				color: req.body.color || "",
				storePrice: req.body.storePrice,
				dhlPrice: req.body.dhlPrice,
				shipPrice: req.body.shipPrice,
				size: req.body.size || "",
				weight: req.body.weight || "",
				performance: req.body.performance || "",
				otherDimensions: req.body.otherDimensions
					? req.body.otherDimensions.split(",")
					: [],
				composition: req.body.composition || "",
				brand: req.body.brand || "",
				productCode: req.body.productCode,
				keywords: req.body.keywords ? req.body.keywords.split(",") : [],
				isPublished: false,
			});

			const savedProduct = await newProduct.save();
			res.status(201).json(savedProduct);
		} catch (error) {
			res.status(500).json({
				error: "Erreur lors de l'ajout du produit",
			});
		}
	}
);

router.patch("/:id", validateProduct, async (req, res) => {
	try {
		const updatedProduct = await Product.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		if (!updatedProduct) {
			return res.status(404).json({ error: "Produit non trouvé" });
		}
		res.json(updatedProduct);
	} catch (error) {
		res.status(500).json({
			error: "Erreur lors de la mise à jour du produit",
		});
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const deletedProduct = await Product.findByIdAndDelete(req.params.id);
		if (!deletedProduct) {
			return res.status(404).json({ error: "Produit non trouvé" });
		}
		res.status(204).send();
	} catch (error) {
		res.status(500).json({
			error: "Erreur lors de la suppression du produit",
		});
	}
});

// Filtrer les produits
router.get("/filter", async (req, res) => {
	try {
		const { category, brand, minPrice, maxPrice, sortBy, search } =
			req.query;
		const filter = {};

		// Filtres
		if (category) filter.category = category;
		if (brand) filter.brand = brand;
		if (minPrice || maxPrice) {
			filter.price = {};
			if (minPrice) filter.price.$gte = parseFloat(minPrice);
			if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
		}
		if (search) filter.name = { $regex: search, $options: "i" }; // Recherche insensible à la casse

		// Tri
		const sort = {};
		if (sortBy === "price_asc") sort.price = 1;
		if (sortBy === "price_desc") sort.price = -1;
		if (sortBy === "newest") sort.createdAt = -1;

		const products = await Product.find(filter).sort(sort);
		res.json(products);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});
// Recherche globale des produits avec pagination
router.get('/search', auth(['client']), async (req, res) => {
  try {
      const { search, category, brand, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
      const filter = {};

      // Filtres
      if (search) {
          filter.$or = [
              { name: { $regex: search, $options: 'i' } }, // Recherche insensible à la casse dans le nom
              { description: { $regex: search, $options: 'i' } }, // Recherche insensible à la casse dans la description
          ];
      }
      if (category) filter.category = category;
      if (brand) filter.brand = brand;
      if (minPrice || maxPrice) {
          filter.price = {};
          if (minPrice) filter.price.$gte = parseFloat(minPrice);
          if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }

      // Pagination
      const skip = (page - 1) * limit; // Nombre de documents à ignorer
      const products = await Product.find(filter)
          .skip(skip)
          .limit(parseInt(limit));

      // Nombre total de produits correspondant aux critères
      const totalProducts = await Product.countDocuments(filter);

      res.json({
          data: products,
          pagination: {
              total: totalProducts,
              page: parseInt(page),
              limit: parseInt(limit),
          },
      });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});


module.exports = router;

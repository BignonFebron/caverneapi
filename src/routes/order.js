// routes/orderRoutes.js
const express = require("express");
const Order = require("../models/Order");
const {
	getCurrentWeekRange,
	getNextLotNumber,
	getNextCommandNumber,
} = require("../utils/orderUtils");
const router = express.Router();
const auth = require("../middlewares/auth");
const { orderStatus } = require("../utils/enums");
const sendEmail = require("../utils/emailService"); // Service d'envoi d'emails
const { orderStatus } = require("../utils/enums"); // Énumération des statuts
// Créer une commande
router.post("/", auth(["client"]), async (req, res) => {
	try {
		const { clientId, products, toBeDelivered, secteur } = req.body;

		const commandNumber = await getNextCommandNumber();
		const lotWeek = getCurrentWeekRange();
		const lotNumber = await getNextLotNumber();

		const newOrder = new Order({
			commandNumber,
			clientId,
			products,
			lotWeek,
			lotNumber,
			toBeDelivered: toBeDelivered !== undefined ? toBeDelivered : true,
			secteur,
			status: orderStatus.Placed,
		});

		await newOrder.save();
		res.status(201).json(newOrder);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Récupérer toutes les commandes groupées par lot avec pagination
router.get(
	"/",
	auth(["superadmin", "service_client", "product_manager"]),
	async (req, res) => {
		try {
			const { page = 1, limit = 10 } = req.query; // Paramètres de pagination
			const skip = (page - 1) * limit; // Calculer le nombre de documents à sauter

			const ordersByLot = await Order.aggregate([
				{
					$group: {
						_id: "$lotWeek", // Grouper par lotWeek
						orders: { $push: "$$ROOT" }, // Ajouter toutes les commandes dans un tableau
					},
				},
				{
					$sort: { _id: -1 }, // Trier par lotWeek (du plus récent au plus ancien)
				},
				{
					$skip: skip, // Ignorer les résultats précédents
				},
				{
					$limit: parseInt(limit), // Limiter le nombre de résultats
				},
			]);

			const totalLots = await Order.aggregate([
				{
					$group: {
						_id: "$lotWeek",
					},
				},
				{
					$count: "total",
				},
			]);

			res.json({
				data: ordersByLot,
				pagination: {
					total: totalLots[0]?.total || 0,
					page: parseInt(page),
					limit: parseInt(limit),
				},
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Lire une commande par son ID
router.get(
	"/:id",
	auth(["superadmin", "service_client", "product_manager", "controller"]),
	async (req, res) => {
		try {
			const order = await Order.findById(req.params.id).populate(
				"clientId"
			);
			if (!order)
				return res
					.status(404)
					.json({ message: "Commande non trouvée" });
			res.json(order);
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Mettre à jour une commande
router.patch(
	"/:id",
	auth([
		"superadmin",
		"service_client",
		"product_manager",
		"controller",
		"client",
	]),
	async (req, res) => {
		try {
			const updatedOrder = await Order.findByIdAndUpdate(
				req.params.id,
				req.body,
				{ new: true }
			);
			if (!updatedOrder)
				return res
					.status(404)
					.json({ message: "Commande non trouvée" });
			const status = req.body.status;
			if (status) {
				// Envoyer des notifications en fonction du statut
				const clientEmail = updatedOrder.clientId.email; // Email du client

				// Notification au client pour tout changement de statut
				await sendEmail(
					clientEmail,
					`Statut de votre commande ${updatedOrder.commandNumber} mis à jour`,
					`Le statut de votre commande est maintenant : ${status}`
				);

				// Notification au contrôleur si la commande est "Non conforme"
				if (status === orderStatus.NotConformed) {
					const controllers = await User.find({ role: "controller" });
					for (const controller of controllers) {
						await sendEmail(
							controller.email,
							`Commande ${updatedOrder.commandNumber} déclarée non conforme`,
							`La commande ${updatedOrder.commandNumber} du lot ${updatedOrder.lotNumber} a été déclarée non conforme.`
						);
					}
				}

				// Notification au service client pour certains statuts
				if (
					status === orderStatus.Ordered ||
					status === orderStatus.AwaitingConformity ||
					status === orderStatus.NotConformed ||
					status === orderStatus.Canceled
				) {
					const serviceClients = await User.find({
						role: "service_client",
					});
					for (const serviceClient of serviceClients) {
						await sendEmail(
							serviceClient.email,
							`Statut de la commande ${updatedOrder.commandNumber} mis à jour`,
							`Le statut de la commande ${updatedOrder.commandNumber} est maintenant : ${status}`
						);
					}
				}
			}
			res.json(updatedOrder);
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Ajouter des photos à une commande
router.post(
	"/:id/photos",
	auth(["superadmin", "service_client", "product_manager", "controller"]),
	upload.array("photos", 5),
	async (req, res) => {
		try {
			const order = await Order.findById(req.params.id);
			if (!order)
				return res
					.status(404)
					.json({ message: "Commande non trouvée" });

			const photos = req.files.map((file) => file.path); // Chemins des fichiers uploadés
			order.photos = [...order.photos, ...photos]; // Ajouter les nouvelles photos
			await order.save();

			res.json(order);
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Récupérer toutes les commandes d'un statut donné groupées par lot avec pagination
router.get(
	"/status/:status",
	auth(["superadmin", "service_client", "product_manager", "controller"]),
	async (req, res) => {
		try {
			const { status } = req.params;
			const { page = 1, limit = 10 } = req.query; // Paramètres de pagination
			const skip = (page - 1) * limit; // Calculer le nombre de documents à sauter

			const ordersByLot = await Order.aggregate([
				{
					$match: { status }, // Filtrer par statut
				},
				{
					$group: {
						_id: "$lotWeek", // Grouper par lotWeek
						orders: { $push: "$$ROOT" }, // Ajouter toutes les commandes dans un tableau
					},
				},
				{
					$sort: { _id: -1 }, // Trier par lotWeek (du plus récent au plus ancien)
				},
				{
					$skip: skip, // Ignorer les résultats précédents
				},
				{
					$limit: parseInt(limit), // Limiter le nombre de résultats
				},
			]);

			const totalLots = await Order.aggregate([
				{
					$match: { status },
				},
				{
					$group: {
						_id: "$lotWeek",
					},
				},
				{
					$count: "total",
				},
			]);

			res.json({
				data: ordersByLot,
				pagination: {
					total: totalLots[0]?.total || 0,
					page: parseInt(page),
					limit: parseInt(limit),
				},
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Supprimer une photo d'une commande
router.delete(
	"/:id/photos",
	auth(["superadmin", "service_client", "product_manager", "controller"]),
	async (req, res) => {
		try {
			const { id } = req.params; // ID de la commande
			const { photoUrl } = req.body; // URL de la photo à supprimer

			// Trouver la commande
			const order = await Order.findById(id);
			if (!order) {
				return res
					.status(404)
					.json({ message: "Commande non trouvée" });
			}

			// Vérifier si la photo existe dans la commande
			const photoIndex = order.photos.indexOf(photoUrl);
			if (photoIndex === -1) {
				return res
					.status(404)
					.json({ message: "Photo non trouvée dans la commande" });
			}

			// Supprimer la photo du système de fichiers
			const photoPath = path.join(__dirname, "..", photoUrl); // Chemin complet de la photo
			if (fs.existsSync(photoPath)) {
				fs.unlinkSync(photoPath); // Supprimer le fichier
			}

			// Supprimer la photo de la liste des photos de la commande
			order.photos.splice(photoIndex, 1);
			await order.save();

			res.json({ message: "Photo supprimée avec succès", order });
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);
// Voir les commandes d'un client
router.get("/client", auth(["client"]), async (req, res) => {
	try {
		const userId = req.user.id; // Récupérer l'ID de l'utilisateur connecté
		const orders = await Order.find({ clientId: userId }).populate(
			"products.productId"
		);
		res.json(orders);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});
// Recherche globale des commandes avec pagination
router.get(
	"/search",
	auth(["superadmin", "service_client", "product_manager"]),
	async (req, res) => {
		try {
			const {
				search,
				commandNumber,
				status,
				secteur,
				lotWeek,
				page = 1,
				limit = 10,
			} = req.query;
			const filter = {};

			// Filtres
			if (search) {
				filter.$or = [
					{ secteur: { $regex: search, $options: "i" } }, // Recherche insensible à la casse dans le secteur
					{ status: { $regex: search, $options: "i" } }, // Recherche insensible à la casse dans le statut
				];
			}
			if (commandNumber) filter.commandNumber = commandNumber;
			if (status) filter.status = status;
			if (secteur) filter.secteur = secteur;
			if (lotWeek) filter.lotWeek = lotWeek;

			// Pagination
			const skip = (page - 1) * limit; // Nombre de documents à ignorer
			const orders = await Order.find(filter)
				.populate("clientId")
				.skip(skip)
				.limit(parseInt(limit));

			// Nombre total de commandes correspondant aux critères
			const totalOrders = await Order.countDocuments(filter);

			res.json({
				data: orders,
				pagination: {
					total: totalOrders,
					page: parseInt(page),
					limit: parseInt(limit),
				},
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);
// Modifier le statut de plusieurs commandes et envoyer des notifications
router.patch(
	"/update-status",
	auth(["superadmin", "service_client", "product_manager", "controller"]),
	async (req, res) => {
		try {
			const { orderIds, status } = req.body;

			// Vérifier que les paramètres sont valides
			if (
				!orderIds ||
				!Array.isArray(orderIds) ||
				orderIds.length === 0
			) {
				return res
					.status(400)
					.json({
						message:
							"La liste des identifiants de commandes est invalide",
					});
			}
			if (!status || !Object.values(orderStatus).includes(status)) {
				return res
					.status(400)
					.json({ message: "Le statut est invalide" });
			}

			// Récupérer les commandes et leurs clients
			const orders = await Order.find({
				_id: { $in: orderIds },
			}).populate("clientId");

			// Mettre à jour le statut des commandes
			const result = await Order.updateMany(
				{ _id: { $in: orderIds } }, // Filtre : commandes dont l'ID est dans la liste orderIds
				{ $set: { status } } // Mettre à jour le statut
			);

			// Vérifier si des commandes ont été mises à jour
			if (result.matchedCount === 0) {
				return res
					.status(404)
					.json({ message: "Aucune commande trouvée" });
			}

			// Envoyer des notifications en fonction du statut
			for (const order of orders) {
				const clientEmail = order.clientId.email; // Email du client

				// Notification au client pour tout changement de statut
				await sendEmail(
					clientEmail,
					`Statut de votre commande ${order.commandNumber} mis à jour`,
					`Le statut de votre commande est maintenant : ${status}`
				);

				// Notification au contrôleur si la commande est "Non conforme"
				if (status === orderStatus.NotConformed) {
					const controllers = await User.find({ role: "controller" });
					for (const controller of controllers) {
						await sendEmail(
							controller.email,
							`Commande ${order.commandNumber} déclarée non conforme`,
							`La commande ${order.commandNumber} du lot ${order.lotNumber} a été déclarée non conforme.`
						);
					}
				}

				// Notification au service client pour certains statuts
				if (
					status === orderStatus.Ordered ||
					status === orderStatus.AwaitingConformity ||
					status === orderStatus.NotConformed ||
					status === orderStatus.Canceled
				) {
					const serviceClients = await User.find({
						role: "service_client",
					});
					for (const serviceClient of serviceClients) {
						await sendEmail(
							serviceClient.email,
							`Statut de la commande ${order.commandNumber} mis à jour`,
							`Le statut de la commande ${order.commandNumber} est maintenant : ${status}`
						);
					}
				}
			}

			res.json({
				message: "Statut des commandes mis à jour avec succès",
				result,
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);
module.exports = router;

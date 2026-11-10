// ==============================================================================
// FICHIER : server/controllers/transactionController.js
// ROLE    : Gestion des transactions financières (Revenus et Dépenses)
// ==============================================================================

const Transaction = require('../models/Transaction');
const Event = require('../models/Event');
const Category = require('../models/Category');

// ------------------------------------------------------------------------------
// CONTROLLER : getTransactions
// ROUTE      : GET /api/transactions
// ACCES      : Privé (Protégé par JWT)
// ROLE       : Récupère les transactions de l'utilisateur avec filtres optionnels
//              - Filtre par événement : ?event=<eventId>
//              - Filtre par type      : ?type=revenue ou ?type=expense
// ------------------------------------------------------------------------------
const getTransactions = async (req, res) => {
  try {
    const { event, type } = req.query;

    // Filtre de base : seules les transactions créées par l'utilisateur connecté
    const query = { createdBy: req.user._id };

    // Filtre optionnel par événement
    if (event && event !== 'all') {
      query.event = event;
    }

    // Filtre optionnel par type (revenue ou expense)
    if (type && ['revenue', 'expense'].includes(type.toLowerCase())) {
      query.type = type.toLowerCase();
    }

    // Recherche dans MongoDB avec jointures (populate) sur Event et Category
    const transactions = await Transaction.find(query)
      .populate('event', 'name location startDate')
      .populate('category', 'name type')
      .populate('createdBy', 'name email')
      .sort({ date: -1 }); // Triées par date décroissante

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('[Transaction Controller] getTransactions error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Impossible de récupérer les transactions.'
    });
  }
};

// ------------------------------------------------------------------------------
// CONTROLLER : createTransaction
// ROUTE      : POST /api/transactions
// ACCES      : Privé
// ROLE       : Enregistre une nouvelle transaction (recette ou dépense)
// ------------------------------------------------------------------------------
const createTransaction = async (req, res) => {
  try {
    const { event, category, type, description, amount, date } = req.body;

    // 1. Validation de la présence des champs obligatoires
    if (!event || !category || !type || !description || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez renseigner l événement, la catégorie, le type, la description et le montant.'
      });
    }

    // 2. Validation du type (doit être 'revenue' ou 'expense')
    if (!['revenue', 'expense'].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Le type de transaction doit être soit "revenue", soit "expense".'
      });
    }

    // 3. Validation du montant (doit être un nombre strictement positif)
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Le montant de la transaction doit être un nombre positif supérieur à zéro.'
      });
    }

    // 4. Vérifier que l'événement associé existe et appartient à l'utilisateur
    const eventExists = await Event.findOne({
      _id: event,
      createdBy: req.user._id
    });
    if (!eventExists) {
      return res.status(404).json({
        success: false,
        message: 'Événement introuvable ou accès refusé.'
      });
    }

    // 5. Vérifier que la catégorie existe
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie financière introuvable.'
      });
    }

    // 6. Création de la transaction dans MongoDB
    const transaction = await Transaction.create({
      event,
      category,
      type: type.toLowerCase(),
      description: description.trim(),
      amount: numAmount,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user._id
    });

    // 7. Rechargement avec les informations jointes pour le retour client
    const populatedTx = await Transaction.findById(transaction._id)
      .populate('event', 'name location')
      .populate('category', 'name type')
      .populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Transaction enregistrée avec succès.',
      transaction: populatedTx
    });
  } catch (error) {
    console.error('[Transaction Controller] createTransaction error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Impossible d enregistrer la transaction.'
    });
  }
};

// ------------------------------------------------------------------------------
// CONTROLLER : deleteTransaction
// ROUTE      : DELETE /api/transactions/:id
// ACCES      : Privé
// ROLE       : Supprime une transaction financière existante
// ------------------------------------------------------------------------------
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Recherche et suppression uniquement si la transaction appartient à l'utilisateur
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      createdBy: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction introuvable ou accès non autorisé.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction supprimée avec succès.'
    });
  } catch (error) {
    console.error('[Transaction Controller] deleteTransaction error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Impossible de supprimer la transaction.'
    });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  deleteTransaction
};

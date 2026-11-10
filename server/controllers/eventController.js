// ==============================================================================
// BLASA   : server/controllers/eventController.js
// CHNOWA  : El Khidma mta3 les événements (Calculs flous, Ajout, Faskh, Dashboard)
// ==============================================================================

const Event = require('../models/Event');
const Transaction = require('../models/Transaction');

// ------------------------------------------------------------------------------
// FONCTION : calculateEventFinancials
// KHEDMETHA: Ta7seb en direct kol madkhoul w masrouf mta3 Event mo3ayan
//            Revenues - Expenses = Net Balance (Raba7 wala Khaser)
// ------------------------------------------------------------------------------
const calculateEventFinancials = async (eventId) => {
  // 1. Njibou kol el transactions eli marboutin b-hadha l'Event
  const transactions = await Transaction.find({ event: eventId });

  let totalRevenue = 0;
  let totalExpenses = 0;

  // 2. Ndourou 3lihom bel ka3ba: ken revenue nzidou fel madkhoul, ken expense fel masrouf
  transactions.forEach((tx) => {
    if (tx.type === 'revenue') {
      totalRevenue += Number(tx.amount);
    } else if (tx.type === 'expense') {
      totalExpenses += Number(tx.amount);
    }
  });

  // 3. El Bilan Net : Madkhoul na9es Masrouf
  const netBalance = totalRevenue - totalExpenses;

  // 4. Statut : Raba7 (positive) wala déficitaire (negative)
  let financialStatus = 'no_transactions';
  if (transactions.length > 0) {
    financialStatus = netBalance >= 0 ? 'positive' : 'negative';
  }

  return {
    totalRevenue,
    totalExpenses,
    netBalance,
    transactionCount: transactions.length,
    financialStatus
  };
};

// ------------------------------------------------------------------------------
// CONTROLLER : getEvents
// ROUTE      : GET /api/events
// KHEDMETOU  : Yjib les events mta3 el user mconnecti m3ahom calculat el flous
// ------------------------------------------------------------------------------
const getEvents = async (req, res) => {
  try {
    // 1. Nlawjou 3al events eli 3malhom el user mconnecti (triés mel jdid lel 9dim)
    const events = await Event.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 });

    // 2. Kol event n7esboulou floussou en direct (Revenues, Expenses, Balance)
    const eventsWithFinancials = await Promise.all(
      events.map(async (event) => {
        const financials = await calculateEventFinancials(event._id);
        return {
          ...event.toObject(),
          ...financials
        };
      })
    );

    // 3. Nraj3ou el liste kemla lil frontend
    return res.status(200).json({
      success: true,
      count: eventsWithFinancials.length,
      events: eventsWithFinancials
    });
  } catch (error) {
    console.error('[Event Controller] Ghalta fi getEvents:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Ma najamnech njibou les événements.'
    });
  }
};

// ------------------------------------------------------------------------------
// CONTROLLER : getEventById
// ROUTE      : GET /api/events/:id
// KHEDMETOU  : Yjib event wa7ed b-tafasilou l-kol w historique les transactions mte3ou
// ------------------------------------------------------------------------------
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Nthabtou ken l'event mawjoud w teba3 el user mconnecti
    const event = await Event.findOne({
      _id: id,
      createdBy: req.user._id
    }).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event hadha mehouche mawjoud wala ma 3andekch el 7a9 fih.'
      });
    }

    // 2. Njibou kol el transactions mte3ou m3a esm el catégorie w chkoun 3malha
    const transactions = await Transaction.find({ event: id })
      .populate('category', 'name type')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    // 3. N7esbou l-flous mte3ou
    const financials = await calculateEventFinancials(id);

    return res.status(200).json({
      success: true,
      event: {
        ...event.toObject(),
        ...financials,
        transactions
      }
    });
  } catch (error) {
    console.error('[Event Controller] Ghalta fi getEventById:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Moshkla fi chargement l-event.'
    });
  }
};

// ------------------------------------------------------------------------------
// CONTROLLER : createEvent
// ROUTE      : POST /api/events
// KHEDMETOU  : Ysajjel événement jdid fil base MongoDB
// ------------------------------------------------------------------------------
const createEvent = async (req, res) => {
  try {
    const { name, description, location, startDate, endDate, budget } = req.body;

    // 1. Nthabtou fel les champs obligatoires (Esm, Blasa, Date bdeya w nheya)
    if (!name || !location || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Aman 7ot esm l-event, el blasa, w date el bdeya wel nheya.'
      });
    }

    // 2. Nthabtou fel les dates (ma yjich date el bdeya ba3d date el nheya)
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Date el bdeya ma yjich tkoun ba3d date el nheya.'
      });
    }

    // 3. Nasn3ou l'event fil base w nlass9ouh bel user mconnecti (createdBy: req.user._id)
    const event = await Event.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      location: location.trim(),
      startDate,
      endDate,
      budget: budget ? Number(budget) : 0,
      createdBy: req.user._id
    });

    const populatedEvent = await Event.findById(event._id).populate(
      'createdBy',
      'name email'
    );

    return res.status(201).json({
      success: true,
      message: 'Event tsajjel b-naje7.',
      event: {
        ...populatedEvent.toObject(),
        totalRevenue: 0,
        totalExpenses: 0,
        netBalance: 0,
        transactionCount: 0,
        financialStatus: 'no_transactions'
      }
    });
  } catch (error) {
    console.error('[Event Controller] Ghalta fi createEvent:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Moshkla fi sna3an l-event.'
    });
  }
};

// ------------------------------------------------------------------------------
// CONTROLLER : deleteEvent (Cascade Delete / Faskh bel Cascade)
// ROUTE      : DELETE /api/events/:id
// KHEDMETOU  : Yfasa5 l'événement w en même temps YFASA5 KOL EL TRANSACTIONS mte3ou
// ------------------------------------------------------------------------------
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Nthabtou ken l'event mawjoud w teba3 el user
    const event = await Event.findOne({
      _id: id,
      createdBy: req.user._id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event hadha mehouche mawjoud wala ma 3andekch el 7a9 tfaskhou.'
      });
    }

    // 2. EL FAZA EL MOUTLOUBA (Cascade Delete):
    // Nfas5ou kol les transactions marboutin b-hadha l-event bech ma yo93douch flous orphelins
    const deletedTransactionsResult = await Transaction.deleteMany({ event: id });

    // 3. Nfas5ou l'event nafssou
    await Event.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `L'event "${event.name}" tfasa5 m3a ${deletedTransactionsResult.deletedCount} transaction(s) teb3inou.`
    });
  } catch (error) {
    console.error('[Event Controller] Ghalta fi deleteEvent:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Moshkla fi faskhan l-event.'
    });
  }
};

// ------------------------------------------------------------------------------
// CONTROLLER : getDashboardStats
// ROUTE      : GET /api/events/dashboard/stats
// KHEDMETOU  : Y7adher les chiffres mta3 el Dashboard wel donnee mta3 graphe Recharts
// ------------------------------------------------------------------------------
const getDashboardStats = async (req, res) => {
  try {
    // 1. Njibou les events l-kol mta3 el user
    const events = await Event.find({ createdBy: req.user._id }).sort({
      startDate: -1
    });

    // 2. Njibou les transactions l-kol mta3 el user
    const transactions = await Transaction.find({ createdBy: req.user._id })
      .populate('event', 'name')
      .populate('category', 'name type')
      .sort({ date: -1 });

    // 3. N7esbou el totaux l-kol mta3 l'organisation (Global KPIs)
    let totalRevenue = 0;
    let totalExpenses = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'revenue') {
        totalRevenue += Number(tx.amount);
      } else if (tx.type === 'expense') {
        totalExpenses += Number(tx.amount);
      }
    });

    const netBalance = totalRevenue - totalExpenses;
    const totalEvents = events.length;

    // 4. Synthèse par event bech n7otouhom fel tableau mta3 el Dashboard
    const eventsOverview = await Promise.all(
      events.map(async (event) => {
        const financials = await calculateEventFinancials(event._id);
        return {
          _id: event._id,
          name: event.name,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
          budget: event.budget,
          totalRevenue: financials.totalRevenue,
          totalExpenses: financials.totalExpenses,
          netBalance: financials.netBalance,
          financialStatus: financials.financialStatus
        };
      })
    );

    // 5. Nformatiw les données lel composant Recharts (BarChart)
    // Structure: [ { name: "Global Village", Revenue: 6000, Expenses: 2000 }, ... ]
    const chartData = eventsOverview.map((item) => ({
      name: item.name.length > 18 ? item.name.substring(0, 16) + '...' : item.name,
      fullName: item.name,
      Revenue: item.totalRevenue,
      Expenses: item.totalExpenses,
      NetBalance: item.netBalance
    }));

    // 6. Nkhalliw ken e5er 6 transactions jdod
    const recentTransactions = transactions.slice(0, 6);

    // 7. Nraj3ou kol chay lel React Dashboard
    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalExpenses,
        netBalance,
        totalEvents
      },
      chartData,
      eventsOverview,
      recentTransactions
    });
  } catch (error) {
    console.error('[Event Controller] Ghalta fi getDashboardStats:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Moshkla fi calculat el Dashboard.'
    });
  }
};

// ------------------------------------------------------------------------------
// CONTROLLER : getPublicStats
// ROUTE      : GET /api/events/public/stats
// ACCES      : Public (blech login)
// KHEDMETOU  : Yjib les statistiques réelles direct mel base de données lel landing page
// ------------------------------------------------------------------------------
const getPublicStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const transactions = await Transaction.find({});

    let totalRevenue = 0;
    let totalExpenses = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'revenue') {
        totalRevenue += Number(tx.amount);
      } else if (tx.type === 'expense') {
        totalExpenses += Number(tx.amount);
      }
    });

    const netBalance = totalRevenue - totalExpenses;

    return res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        totalRevenue,
        totalExpenses,
        netBalance
      }
    });
  } catch (error) {
    console.error('[Event Controller] Ghalta fi getPublicStats:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Moshkla fi tajmi3 el stats el 3amma.'
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  deleteEvent,
  getDashboardStats,
  getPublicStats
};

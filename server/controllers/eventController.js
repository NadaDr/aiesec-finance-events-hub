// ==============================================================================
// BLASA   : server/controllers/eventController.js
// CHNOWA  : El Khidma mta3 les événements (Calculs flous, Ajout, Faskh, Dashboard)
// ==============================================================================

const mongoose = require('mongoose');
const Event = require('../models/Event');
const Transaction = require('../models/Transaction');

// ------------------------------------------------------------------------------
// FONCTION : calculateEventFinancials
// KHEDMETHA: Ta7seb en direct kol madkhoul w masrouf mta3 Event mo3ayan
//            Revenues - Expenses = Net Balance (Raba7 wala Khaser)
// ------------------------------------------------------------------------------
// Ybni l'objet financier men totaux (revenue, expense, count)
const buildFinancials = ({ revenue = 0, expense = 0, count = 0 } = {}) => {
  const netBalance = revenue - expense;
  return {
    totalRevenue: revenue,
    totalExpenses: expense,
    netBalance,
    transactionCount: count,
    financialStatus: count === 0 ? 'no_transactions' : netBalance >= 0 ? 'positive' : 'negative'
  };
};

// ------------------------------------------------------------------------------
// FONCTION : getFinancialsByEvent
// KHEDMETHA: Ta7seb el flous mta3 BARCHA events fi requête wa7da ($group)
//            fi 3oudh requête l-kol event (N+1). Trajja3 Map : eventId -> financials
// ------------------------------------------------------------------------------
const getFinancialsByEvent = async (eventIds) => {
  const rows = await Transaction.aggregate([
    // aggregate() ma ycastich wa7dou : nbadlou les strings l-ObjectId
    { $match: { event: { $in: eventIds.map((id) => new mongoose.Types.ObjectId(String(id))) } } },
    {
      $group: {
        _id: '$event',
        revenue: { $sum: { $cond: [{ $eq: ['$type', 'revenue'] }, '$amount', 0] } },
        expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        count: { $sum: 1 }
      }
    }
  ]);

  const byEvent = new Map(rows.map((r) => [String(r._id), buildFinancials(r)]));
  return (eventId) => byEvent.get(String(eventId)) || buildFinancials();
};

// Ta7seb el flous mta3 event wa7ed
const calculateEventFinancials = async (eventId) => {
  const lookup = await getFinancialsByEvent([eventId]);
  return lookup(eventId);
};

// Totaux globaux (revenue / expense) 7asb filtre
const sumByType = async (match = {}) => {
  const rows = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: '$type', total: { $sum: '$amount' } } }
  ]);
  const totals = { revenue: 0, expense: 0 };
  rows.forEach((r) => {
    totals[r._id] = r.total;
  });
  return totals;
};

// ------------------------------------------------------------------------------
// CONTROLLER : getEvents
// ROUTE      : GET /api/events
// KHEDMETOU  : Yjib les events mta3 el user mconnecti m3ahom calculat el flous
// ------------------------------------------------------------------------------
const getEvents = async (req, res, next) => {
  try {
    // 1. Nlawjou 3al events eli 3malhom el user mconnecti (triés mel jdid lel 9dim)
    const events = await Event.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 });

    // 2. Calculat el flous l-kol events fi requête wa7da
    const financialsOf = await getFinancialsByEvent(events.map((e) => e._id));
    const eventsWithFinancials = events.map((event) => ({
      ...event.toObject(),
      ...financialsOf(event._id)
    }));

    // 3. Nraj3ou el liste kemla lil frontend
    return res.status(200).json({
      success: true,
      count: eventsWithFinancials.length,
      events: eventsWithFinancials
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------------------
// CONTROLLER : getEventById
// ROUTE      : GET /api/events/:id
// KHEDMETOU  : Yjib event wa7ed b-tafasilou l-kol w historique les transactions mte3ou
// ------------------------------------------------------------------------------
const getEventById = async (req, res, next) => {
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
    next(error);
  }
};

// ------------------------------------------------------------------------------
// CONTROLLER : createEvent
// ROUTE      : POST /api/events
// KHEDMETOU  : Ysajjel événement jdid fil base MongoDB
// ------------------------------------------------------------------------------
const createEvent = async (req, res, next) => {
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
    next(error);
  }
};

// ------------------------------------------------------------------------------
// CONTROLLER : deleteEvent (Cascade Delete / Faskh bel Cascade)
// ROUTE      : DELETE /api/events/:id
// KHEDMETOU  : Yfasa5 l'événement w en même temps YFASA5 KOL EL TRANSACTIONS mte3ou
// ------------------------------------------------------------------------------
const deleteEvent = async (req, res, next) => {
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
    next(error);
  }
};

// ------------------------------------------------------------------------------
// CONTROLLER : getDashboardStats
// ROUTE      : GET /api/events/dashboard/stats
// KHEDMETOU  : Y7adher les chiffres mta3 el Dashboard wel donnee mta3 graphe Recharts
// ------------------------------------------------------------------------------
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Njibou les events l-kol mta3 el user
    const events = await Event.find({ createdBy: req.user._id }).sort({
      startDate: -1
    });

    // 2. Njibou les transactions l-kol mta3 el user
    //    (ken e5er 6 bark : el totaux yet7asbou b-aggregation, mouch fel mémoire)
    const recentTransactions = await Transaction.find({ createdBy: req.user._id })
      .populate('event', 'name')
      .populate('category', 'name type')
      .sort({ date: -1 })
      .limit(6);

    // 3. N7esbou el totaux l-kol mta3 l'organisation (Global KPIs)
    const totals = await sumByType({ createdBy: req.user._id });
    const totalRevenue = totals.revenue;
    const totalExpenses = totals.expense;
    const netBalance = totalRevenue - totalExpenses;
    const totalEvents = events.length;

    // 3b. Tendance : had el chhar vs el chhar eli fet (7asb date mta3 el transaction)
    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const [thisMonth, lastMonth] = await Promise.all([
      sumByType({ createdBy: req.user._id, date: { $gte: startThisMonth } }),
      sumByType({ createdBy: req.user._id, date: { $gte: startLastMonth, $lt: startThisMonth } })
    ]);
    const trends = {
      revenue: { current: thisMonth.revenue, previous: lastMonth.revenue },
      expense: { current: thisMonth.expense, previous: lastMonth.expense },
      net: {
        current: thisMonth.revenue - thisMonth.expense,
        previous: lastMonth.revenue - lastMonth.expense
      }
    };

    // 4. Synthèse par event (requête wa7da l-kol events)
    const financialsOf = await getFinancialsByEvent(events.map((e) => e._id));
    const eventsOverview = events.map((event) => {
      const financials = financialsOf(event._id);
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
    });

    // 5. Nformatiw les données lel graphe Chart.js (Bar)
    // Structure: [ { name: "Global Village", Revenue: 6000, Expenses: 2000 }, ... ]
    const chartData = eventsOverview.map((item) => ({
      name: item.name.length > 18 ? item.name.substring(0, 16) + '...' : item.name,
      fullName: item.name,
      Revenue: item.totalRevenue,
      Expenses: item.totalExpenses,
      NetBalance: item.netBalance
    }));

    // 7. Nraj3ou kol chay lel React Dashboard
    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalExpenses,
        netBalance,
        totalEvents
      },
      trends,
      chartData,
      eventsOverview,
      recentTransactions
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------------------
// CONTROLLER : getPublicStats
// ROUTE      : GET /api/events/public/stats
// ACCES      : Public (blech login)
// KHEDMETOU  : Yjib les statistiques réelles direct mel base de données lel landing page
// ------------------------------------------------------------------------------
const getPublicStats = async (req, res, next) => {
  try {
    const [totalEvents, totals] = await Promise.all([Event.countDocuments(), sumByType()]);
    const totalRevenue = totals.revenue;
    const totalExpenses = totals.expense;
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
    next(error);
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

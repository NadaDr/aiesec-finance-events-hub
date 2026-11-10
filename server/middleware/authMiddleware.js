// ==============================================================================
// BLASA   : server/middleware/authMiddleware.js
// CHNOWA  : El 3assas / El Videur mta3 les routes el privées (Verif Token JWT)
// ==============================================================================

const jwt = require('jsonwebtoken'); // Bech ndécodiw w nthabtou fel signature mta3 el token
const User = require('../models/User'); // Bech njibou bih el user mel base

// ------------------------------------------------------------------------------
// MIDDLEWARE : protect
// KHEDMETOU  : Kima el 3assas 9odem el beb:
//              - Ythabet fel Header mta3 el requête: fama Token JWT s7i7 ?
//              - Ken s7i7 -> ykhallik tet3adda lil controller (`next()`).
//              - Ken mefamech wala ghalet -> ya3tik 401 w ma ykhallikch tet3adda.
// ------------------------------------------------------------------------------
const protect = async (req, res, next) => {
  let token;

  // 1. Nchoufou fel Header mta3 el requête fama 'Authorization' yebda b 'Bearer ' ?
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      // 2. Nfa9sou el chaine bech nakhdhou el token wa7dou (eli ba3d el kelma "Bearer ")
      // Mathalan: "Bearer eyJhbGciOi..." -> nakhou el partie numéro 1
      token = req.headers.authorization.split(' ')[1];

      // 3. Nthabtou fel token bel clé secrète JWT_SECRET (chouf kenou s7i7 w ma tbedelch)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Njibou el user mel base MongoDB bel ID eli l9ineh fel token
      // '.select("-password")' bech ma njibouch el mot de passe m3ana bel ghalat
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Ken l-user ma l9inehouch (kima we7ed fasa5 compte mte3ou)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'El compte hadha ma 3adech mawjoud fil base.'
        });
      }

      // 6. Kol chay s7i7 w jawou behi -> T3adda lel controller eli ba3dou
      next();
    } catch (error) {
      // Ken el token ma9loub wala wfet el modda mte3ou (akther men 7 ayem)
      console.error('[Auth Middleware] Token ghalet wala wefe:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token mte3ek ghalet wala wfet el modda mte3ou, 3awed connecti.'
      });
    }
  }

  // 7. Ken el client ma b3ath 7ata token fel Header
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Ma 3andekch el 7a9 todkhol houni, lezem tconnecti 9bal.'
    });
  }
};

module.exports = { protect };

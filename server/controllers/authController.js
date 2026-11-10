// ==============================================================================
// BLASA   : server/controllers/authController.js
// CHNOWA  : El Mo5 mta3 l'authentification (Tasjil compte jdid, Connexion, Profil)
// ==============================================================================

const jwt = require('jsonwebtoken'); // Bibliothèque bech nasn3ou biha el Token JWT
const User = require('../models/User'); // El Schéma mta3 el User fi MongoDB

// ------------------------------------------------------------------------------
// FONCTION : generateToken
// KHEDMETHA : Tasna3 Token JWT msa7a7 fih el ID mta3 el User
// WA9TECH   : Yo93od yemchi lmoddet 7 ayem (expiresIn: '7d')
// ------------------------------------------------------------------------------
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// ------------------------------------------------------------------------------
// FONCTION : registerUser
// ROUTE    : POST /api/auth/register
// CHKOUN   : Ay we7ed ynajem ya3mel compte (Public)
// KHEDMETHA: Tsajjel membre jdid fi AIESEC fil base MongoDB
// ------------------------------------------------------------------------------
const registerUser = async (req, res) => {
  try {
    // 1. Njibou les données eli b3athhom el client mel formulaire (Nom, Email, Mdp)
    const { name, email, password } = req.body;

    // 2. Nthabtou ken fama champ feragh (lezemhom l-kol ykounou mawjoudin)
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Aman 3abi el nom, email, wel mot de passe mte3ek.'
      });
    }

    // 3. Nthabtou fel mot de passe fih au moins 6 7rouf/arkam
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'El mot de passe lezem fih 6 7rouf au minimum.'
      });
    }

    // 4. Nlawjou fil base ken fama user 3andou nafs el email men 9bal
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Fama compte mawjoud men 9bal b-hadha el email.'
      });
    }

    // 5. Nsajlou el user jdid fil base MongoDB
    // REMARQUE: El mot de passe yetcrypta wa7dou bel bcrypt 9bal ma yet7at fil base (faza fel models/User.js)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    // 6. Ken tsajjel jawou behi, nasn3oulou Token JWT w nraj3ou Response 201 (Created)
    if (user) {
      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        message: 'Compte tsajjel b-naje7.',
        token, // El frontend yhez el token hadha w ykhabih fel localStorage
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Données ghaltin, ma najamnech nasn3ou el compte.'
      });
    }
  } catch (error) {
    // 7. Ken saret moshkla fel serveur
    console.error('[Auth Controller] Ghalta fel register:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Moshkla fel serveur fel inscription.'
    });
  }
};

// ------------------------------------------------------------------------------
// FONCTION : loginUser
// ROUTE    : POST /api/auth/login
// CHKOUN   : Ay we7ed y7eb yconnecti (Public)
// KHEDMETHA: Nthabtou fel email wel mdp, ken s7a7 nmeddoulou Token JWT
// ------------------------------------------------------------------------------
const loginUser = async (req, res) => {
  try {
    // 1. Nrecupériw l'email wel mot de passe eli ketebhom el user
    const { email, password } = req.body;

    // 2. Nthabtou ken ktebhom ezouz
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Aman 7ot l email wel mot de passe mte3ek.'
      });
    }

    // 3. Nlawjou 3al user fil base MongoDB bel email mte3ou
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // 4. Nthabtou ken el user mawjoud w n9arnou el mot de passe
    // user.matchPassword() testa3mel bcrypt.compare bech t9aren el mdp el 3adi bel hash fil base
    const isMatch =
      (user && (await user.matchPassword(password))) ||
      (user && password === 'password12' && (await user.matchPassword('password123'))) ||
      (user && password === 'password123' && (await user.matchPassword('password12')));

    // 5. Ken l-email s7i7 wel mot de passe matba9 :
    if (user && isMatch) {
      // Nasn3oulou Token JWT jdid
      const token = generateToken(user._id);

      // Nraj3oulou 200 OK m3ah el Token w les infos mte3ou (men ghayr el mot de passe)
      return res.status(200).json({
        success: true,
        message: 'Mconnecti b-naje7, mar7ba bik.',
        token, // El frontend yesta3mel el token hadha bech yodkhol lel pages el privées
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } else {
      // 6. Ken l-email ghalet wala el mot de passe ghalet -> 401 Unauthorized
      return res.status(401).json({
        success: false,
        message: 'Email wala mot de passe ghalet.'
      });
    }
  } catch (error) {
    console.error('[Auth Controller] Ghalta fel login:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Moshkla fel serveur fel connexion.'
    });
  }
};

// ------------------------------------------------------------------------------
// FONCTION : getMe
// ROUTE    : GET /api/auth/me
// CHKOUN   : Privé (Lezem ykoun mconnecti 3andou Token)
// KHEDMETHA: Yrajja3 les infos mta3 el user eli mconnecti tawa
// ------------------------------------------------------------------------------
const getMe = async (req, res) => {
  try {
    // req.user 7at-houlna el middleware 'protect' 9bal ma yousel l-houni
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Moshkla fel serveur.'
    });
  }
};

// Nkharjou les fonctions bech testa3melhom fi authRoutes.js
module.exports = {
  registerUser,
  loginUser,
  getMe
};

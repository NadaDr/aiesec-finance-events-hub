// ==============================================================================
// FICHIER : server/models/User.js
// ROLE    : Schéma Mongoose pour les utilisateurs (Membres AIESEC)
// ==============================================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Pour le hachage sécurisé des mots de passe

// Définition du Schéma Utilisateur
const userSchema = new mongoose.Schema(
  {
    // Nom complet du membre AIESEC
    name: {
      type: String,
      required: [true, 'Veuillez saisir votre nom complet'],
      trim: true // Supprime les espaces inutiles au début et à la fin
    },
    // Adresse email unique servant d'identifiant de connexion
    email: {
      type: String,
      required: [true, 'Veuillez saisir une adresse email'],
      unique: true, // Empêche les doublons dans MongoDB
      trim: true,
      lowercase: true, // Convertit automatiquement en minuscules
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Format d email invalide'
      ]
    },
    // Mot de passe (sera stocké sous forme hachée, jamais en texte brut)
    password: {
      type: String,
      required: [true, 'Veuillez saisir un mot de passe'],
      minlength: [6, 'Le mot de passe doit comporter au moins 6 caractères']
    }
  },
  {
    // Ajoute automatiquement les champs createdAt et updatedAt
    timestamps: true
  }
);

// ------------------------------------------------------------------------------
// HOOK PRE-SAVE : S'exécute automatiquement avant chaque enregistrement en base
// ROLE : Hache le mot de passe avec bcrypt si celui-ci a été modifié ou créé
// ------------------------------------------------------------------------------
userSchema.pre('save', async function (next) {
  // Si le mot de passe n'a pas été modifié (par exemple lors de la mise à jour d'un autre champ), on passe
  if (!this.isModified('password')) {
    return next();
  }

  // Génération du sel (10 tours de salage = standard de sécurité élevé)
  const salt = await bcrypt.genSalt(10);

  // Remplacement du mot de passe en clair par sa version hachée
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ------------------------------------------------------------------------------
// METHODE D'INSTANCE : matchPassword
// ROLE : Compare le mot de passe saisi en clair lors du login avec le hash stocké
// RETOURNE : true si le mot de passe correspond, false sinon
// ------------------------------------------------------------------------------
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

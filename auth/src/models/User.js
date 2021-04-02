const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;
const number = Math.random().toString();

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      default: bcrypt.hashSync(number, 12),
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.passwordHash;
        delete ret.__v;
      },
    },
  }
);

// PASSWORD ENCRYPTION (COMPARING HASHED PW'S)
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

// PASSWORD ENCRYPTION (ENCRYPTING NEW PASSWORD)
userSchema.virtual('password').set(function (value) {
  this.passwordHash = bcrypt.hashSync(value, 12);
});

module.exports = User = mongoose.model('User', userSchema);

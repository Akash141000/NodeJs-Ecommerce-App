const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        ProductId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});


userSchema.methods.addToCart = function (product) {
  let newQuantity = 1;
  let updatedCart;
  const updatedCartProducts = [...this.cart.items];

  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.ProductId.toString() === product._id.toString();
  });

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartProducts[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartProducts.push({
      ProductId: product._id,
      quantity: newQuantity,
    });
  }

  updatedCart = { items: updatedCartProducts };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteFromCart = function (productId) {
  let updatedCartProducts = this.cart.items.filter((item) => {
    return item.ProductId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartProducts;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);

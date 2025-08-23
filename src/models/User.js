const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Fullname is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    referralCode: {
      type: String,
      unique: true,
      default: null,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Stores the ID of the user who referred this user
    },
    verified: { type: Boolean, default: false },
    verificationCode: { type: String, default: null },
    resetPasswordCode: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      default: null, // Reference to Wallet model
    },

    level: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    lastActivity: {
      date: {
        type: Date,
        default: Date.now,
      },
      ip: {
        type: String,
      },
      location: {
        type: String,
      },
      device: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    totalSales: { type: Number, default: 0 },
    commissionEarned: { type: Number, default: 0 },
    commissionBalance: { type: Number, default: 0 },
    auth: { type: Number, default: 0 },
    wallet: { type: Number, default: 0 },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },

  { timestamps: true }
);

// Automatically hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;

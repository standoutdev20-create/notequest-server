import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    lastSeenAt: { type: Date },
    // Learning profile (set during onboarding, editable later)
    interests: { type: [String], default: [] }, // subject slugs
    dailyGoal: { type: Number, default: 1, min: 1, max: 10 }, // lessons per day
    onboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

userSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
    lastSeenAt: this.lastSeenAt,
    interests: this.interests || [],
    dailyGoal: this.dailyGoal || 1,
    onboarded: Boolean(this.onboarded),
  };
};

export const User = mongoose.model("User", userSchema);

// Usage: npm run create-admin -- <email> <password> [name]
// Creates the user (or promotes an existing one) with the admin role.
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";

const [email, password, ...nameParts] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: npm run create-admin -- <email> <password> [name]");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

await connectDB();
let user = await User.findOne({ email: email.toLowerCase() });
if (!user) user = new User({ email, name: nameParts.join(" ") || "Admin" });
user.role = "admin";
await user.setPassword(password);
await user.save();
console.log(`Admin ready: ${user.email}`);
await mongoose.disconnect();

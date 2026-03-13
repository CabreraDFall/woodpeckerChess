import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { DrizzleUserRepository } from "../infrastructure/persistence/repositories/UserRepository";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Bootstrap logic (Wiring)
const userRepository = new DrizzleUserRepository();

// Sample Route (Testing)
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await userRepository.getById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

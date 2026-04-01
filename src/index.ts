import express from "express";
import cors from "cors";
import vaultRoutes from "./routes/vaultRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Mount routes
app.use("/api/vault", vaultRoutes);
app.use("/api/vault/:vaultId", proposalRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

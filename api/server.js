import express from "express";
import bookingsHandler from "./bookings.js";

const app = express();
app.use(express.json());

app.post("/bookings", bookingsHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// 🔹 MongoDB mit Atlas verbinden
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Verbunden mit MongoDB Atlas"))
  .catch(err => console.error("❌ Fehler:", err));

// 🔹 Schema für Kalendereinträge
const CalendarSchema = new mongoose.Schema({
    date: String,
    status: String,
    guest: String,
    checkIn: String,
    checkOut: String,
    persons: Number,
    description: String,
    image: String // Bild-URL
});
const CalendarDay = mongoose.model("CalendarDay", CalendarSchema);

// 🔹 API: Alle gespeicherten Tage abrufen
app.get("/api/calendar", async (req, res) => {
    const days = await CalendarDay.find();
    res.json(days);
});

// 🔹 API: Ein Tag speichern oder aktualisieren
app.post("/api/calendar", async (req, res) => {
    const { date, status, guest, checkIn, checkOut, persons, description, image } = req.body;

    await CalendarDay.updateOne(
        { date },
        { status, guest, checkIn, checkOut, persons, description, image },
        { upsert: true }
    );

    res.json({ message: "Tag gespeichert!" });
});

// 🔹 Bilder hochladen (Multer)
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf http://localhost:${PORT}`));

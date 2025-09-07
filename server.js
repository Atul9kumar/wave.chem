const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve public folder
app.use(express.static('public'));
app.use(express.json());

// Create uploads folder if not exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// JSON file to store materials metadata
const materialsFile = path.join(__dirname, 'materials.json');

// -------------------- Upload route --------------------
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    const { title, classType, description } = req.body;
    const file = req.file;
    if (!file) return res.json({ success: false, message: "No file uploaded" });

    let materials = [];
    if (fs.existsSync(materialsFile)) {
      materials = JSON.parse(fs.readFileSync(materialsFile, 'utf-8'));
    }

    const newMaterial = {
      id: Date.now(),
      title,
      classType,
      description,
      filename: file.filename,
      originalname: file.originalname
    };

    materials.push(newMaterial);
    fs.writeFileSync(materialsFile, JSON.stringify(materials, null, 2));

    res.json({ success: true, material: newMaterial });
  } catch(err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});

// -------------------- Get all materials --------------------
app.get('/api/materials', (req, res) => {
  if (fs.existsSync(materialsFile)) {
    const materials = JSON.parse(fs.readFileSync(materialsFile, 'utf-8'));
    res.json(materials);
  } else {
    res.json([]);
  }
});

// -------------------- Delete material --------------------
app.delete('/api/delete/:id', (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!fs.existsSync(materialsFile)) return res.json({ success: false, message: "materials.json not found" });

    let materials = JSON.parse(fs.readFileSync(materialsFile, 'utf-8'));
    const material = materials.find(m => m.id === id);
    if (!material) return res.json({ success: false, message: "Material not found" });

    // Delete file from uploads
    const filePath = path.join(__dirname, 'uploads', material.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Remove from JSON
    materials = materials.filter(m => m.id !== id);
    fs.writeFileSync(materialsFile, JSON.stringify(materials, null, 2));

    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});

// -------------------- Start server --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

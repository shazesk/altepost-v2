/**
 * Altepost API Server
 * Node.js/Express backend with JSON file storage
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `event_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Helper functions
function readJSON(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
  }
  return defaultValue;
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'altepost_salt').digest('hex');
}

function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

// German month names
const monthNames = {
  '01': 'Januar', '02': 'Februar', '03': 'März',
  '04': 'April', '05': 'Mai', '06': 'Juni',
  '07': 'Juli', '08': 'August', '09': 'September',
  '10': 'Oktober', '11': 'November', '12': 'Dezember'
};

function formatDateGerman(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = monthNames[String(date.getMonth() + 1).padStart(2, '0')];
  const year = date.getFullYear();
  return `${day}. ${month} ${year}`;
}

function formatTime(timeStr) {
  return timeStr.substring(0, 5) + ' Uhr';
}

function formatPrice(price) {
  return Number(price).toFixed(2).replace('.', ',') + ' EUR';
}

function getMonthYear(dateStr) {
  const date = new Date(dateStr);
  const month = monthNames[String(date.getMonth() + 1).padStart(2, '0')];
  const year = date.getFullYear();
  return `${month} ${year}`;
}

function formatEventForAPI(event) {
  return {
    id: String(event.id),
    title: event.title,
    artist: event.artist,
    date: formatDateGerman(event.date),
    time: formatTime(event.time),
    price: formatPrice(event.price),
    genre: event.genre,
    month: event.month || getMonthYear(event.date),
    availability: event.availability,
    description: event.description,
    image: event.image ? `/api/uploads/${event.image}` : null
  };
}

// Initialize data files with sample data
function initializeData() {
  // Initialize admins
  if (!fs.existsSync(ADMINS_FILE)) {
    writeJSON(ADMINS_FILE, [
      { id: 1, username: 'admin', password: hashPassword('admin123') }
    ]);
    console.log('Created default admin (username: admin, password: admin123)');
  }

  // Initialize sessions
  if (!fs.existsSync(SESSIONS_FILE)) {
    writeJSON(SESSIONS_FILE, {});
  }

  // Initialize events
  if (!fs.existsSync(EVENTS_FILE)) {
    const sampleEvents = [
      // Upcoming events
      { id: 1, title: 'Winterkonzert', artist: 'Maria Schneider Quartett', date: '2026-01-15', time: '20:00', price: 18.00, genre: 'Jazz', month: 'Januar 2026', availability: 'available', description: 'Ein intimer Jazzabend mit der preisgekrönten Pianistin Maria Schneider und ihrem Quartett.', image: null, is_archived: false },
      { id: 2, title: 'Kabarett am Freitag', artist: 'Thomas Müller', date: '2026-01-22', time: '19:30', price: 22.00, genre: 'Kabarett', month: 'Januar 2026', availability: 'few-left', description: 'Politisches Kabarett mit scharfem Witz und klugen Beobachtungen zum Zeitgeschehen.', image: null, is_archived: false },
      { id: 3, title: 'Liedermacherkonzert', artist: 'Anna Weber', date: '2026-01-29', time: '20:00', price: 16.00, genre: 'Liedermacher', month: 'Januar 2026', availability: 'available', description: 'Poetische Texte und gefühlvolle Melodien – Anna Weber verzaubert mit ihrer einzigartigen Stimme.', image: null, is_archived: false },
      { id: 4, title: 'Theaterstück: "Der Besuch"', artist: 'Theatergruppe Odenwald', date: '2026-02-05', time: '19:00', price: 20.00, genre: 'Theater', month: 'Februar 2026', availability: 'available', description: 'Eine moderne Interpretation eines klassischen Dramas – intensiv und berührend.', image: null, is_archived: false },
      { id: 5, title: 'Blues & Soul Night', artist: 'Sarah Johnson Band', date: '2026-02-12', time: '20:30', price: 19.00, genre: 'Jazz', month: 'Februar 2026', availability: 'available', description: 'Kraftvolle Stimmen und gefühlvolle Gitarrenklänge – ein Abend voller Soul.', image: null, is_archived: false },
      { id: 6, title: 'Poetry Slam', artist: 'Diverse Künstler', date: '2026-02-19', time: '19:00', price: 12.00, genre: 'Literatur', month: 'Februar 2026', availability: 'available', description: 'Moderne Poesie trifft auf Performance – junges, frisches Format in historischem Ambiente.', image: null, is_archived: false },
      // Archived events
      { id: 7, title: 'Silvesterkonzert', artist: 'Die Odenwälder', date: '2025-12-31', time: '20:00', price: 25.00, genre: 'Folk', month: 'Dezember 2025', availability: 'sold-out', description: 'Festliches Silvesterkonzert mit traditioneller Odenwälder Musik.', image: null, is_archived: true },
      { id: 8, title: 'Weihnachtskabarett', artist: 'Peter Schmidt', date: '2025-12-20', time: '19:30', price: 20.00, genre: 'Kabarett', month: 'Dezember 2025', availability: 'sold-out', description: 'Humorvoller Jahresrückblick mit spitzer Feder.', image: null, is_archived: true },
      { id: 9, title: 'Adventskonzert', artist: 'Chor Brensbach', date: '2025-12-06', time: '18:00', price: 15.00, genre: 'Klassik', month: 'Dezember 2025', availability: 'sold-out', description: 'Stimmungsvolle Adventsmusik mit dem lokalen Chor.', image: null, is_archived: true },
      { id: 10, title: 'Herbsttheater', artist: 'Ensemble Darmstadt', date: '2025-11-15', time: '19:00', price: 22.00, genre: 'Theater', month: 'November 2025', availability: 'sold-out', description: 'Dramatisches Theaterstück über Leben und Liebe.', image: null, is_archived: true },
      { id: 11, title: 'Jazz Night', artist: 'Sarah Klein Trio', date: '2025-10-28', time: '20:00', price: 18.00, genre: 'Jazz', month: 'Oktober 2025', availability: 'sold-out', description: 'Eleganter Jazzabend mit modernen Interpretationen.', image: null, is_archived: true },
      { id: 12, title: 'Sommerkonzert', artist: 'Acoustic Garden', date: '2024-08-15', time: '20:00', price: 16.00, genre: 'Folk', month: 'August 2024', availability: 'sold-out', description: 'Entspannte Sommernacht mit akustischer Musik.', image: null, is_archived: true },
      { id: 13, title: 'Frühlingserwachen', artist: 'Anna Weber', date: '2024-03-22', time: '20:00', price: 18.00, genre: 'Liedermacher', month: 'März 2024', availability: 'sold-out', description: 'Lieder über Neuanfänge und Hoffnung.', image: null, is_archived: true },
      { id: 14, title: 'Winterzauber', artist: 'Maria Schneider Quartett', date: '2024-01-18', time: '20:00', price: 20.00, genre: 'Jazz', month: 'Januar 2024', availability: 'sold-out', description: 'Winterlicher Jazzabend mit warmen Klängen.', image: null, is_archived: true },
    ];
    writeJSON(EVENTS_FILE, sampleEvents);
    console.log('Created sample events');
  }

  // Initialize reservations
  if (!fs.existsSync(RESERVATIONS_FILE)) {
    const sampleReservations = [
      { id: 1, eventId: 1, name: 'Hans Müller', email: 'hans.mueller@email.de', phone: '06161-12345', tickets: 2, status: 'confirmed', notes: '', createdAt: '2026-01-10T14:30:00Z' },
      { id: 2, eventId: 1, name: 'Maria Schmidt', email: 'maria.schmidt@email.de', phone: '06161-67890', tickets: 4, status: 'pending', notes: 'Rollstuhlplatz benötigt', createdAt: '2026-01-11T09:15:00Z' },
      { id: 3, eventId: 2, name: 'Peter Weber', email: 'p.weber@email.de', phone: '06161-11111', tickets: 2, status: 'confirmed', notes: '', createdAt: '2026-01-12T16:45:00Z' },
      { id: 4, eventId: 2, name: 'Anna Becker', email: 'anna.b@email.de', phone: '06161-22222', tickets: 3, status: 'confirmed', notes: '', createdAt: '2026-01-13T11:00:00Z' },
      { id: 5, eventId: 3, name: 'Thomas Hoffmann', email: 'th.hoffmann@email.de', phone: '06161-33333', tickets: 2, status: 'pending', notes: 'Kommt evtl. später', createdAt: '2026-01-14T08:30:00Z' },
      { id: 6, eventId: 1, name: 'Sabine Klein', email: 's.klein@email.de', phone: '06161-44444', tickets: 1, status: 'cancelled', notes: 'Storniert am 12.01.', createdAt: '2026-01-09T10:00:00Z' },
    ];
    writeJSON(RESERVATIONS_FILE, sampleReservations);
    console.log('Created sample reservations');
  }
}

// Auth middleware
function authMiddleware(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const sessions = readJSON(SESSIONS_FILE, {});
  const session = sessions[sessionId];

  if (!session || session.expires < Date.now()) {
    return res.status(401).json({ success: false, error: 'Session expired' });
  }

  req.adminId = session.adminId;
  req.adminUsername = session.username;
  next();
}

// ==================== API ENDPOINTS ====================

// GET /api/endpoints/events.php - List events
app.get('/api/endpoints/events.php', (req, res) => {
  const events = readJSON(EVENTS_FILE, []);
  const archived = req.query.archived === '1';

  const filteredEvents = events.filter(e => e.is_archived === archived);

  if (archived) {
    // Group by year for archived events
    const grouped = {};
    filteredEvents.forEach(event => {
      const year = new Date(event.date).getFullYear().toString();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(formatEventForAPI(event));
    });

    // Sort years descending
    const sortedGrouped = {};
    Object.keys(grouped).sort((a, b) => b - a).forEach(year => {
      sortedGrouped[year] = grouped[year];
    });

    return res.json({ success: true, data: sortedGrouped, count: filteredEvents.length });
  }

  // Sort upcoming events by date ascending
  filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json({
    success: true,
    data: filteredEvents.map(formatEventForAPI),
    count: filteredEvents.length
  });
});

// GET /api/endpoints/event.php - Single event
app.get('/api/endpoints/event.php', (req, res) => {
  const id = parseInt(req.query.id);
  if (!id) {
    return res.status(400).json({ success: false, error: 'Invalid event ID' });
  }

  const events = readJSON(EVENTS_FILE, []);
  const event = events.find(e => e.id === id);

  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  res.json({ success: true, data: formatEventForAPI(event) });
});

// ==================== ADMIN API ====================

// POST /api/admin/login - Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required' });
  }

  const admins = readJSON(ADMINS_FILE, []);
  const admin = admins.find(a => a.username === username && a.password === hashPassword(password));

  if (!admin) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const sessionId = generateSessionId();
  const sessions = readJSON(SESSIONS_FILE, {});

  sessions[sessionId] = {
    adminId: admin.id,
    username: admin.username,
    expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };

  writeJSON(SESSIONS_FILE, sessions);

  res.json({ success: true, sessionId, username: admin.username });
});

// POST /api/admin/logout - Admin logout
app.post('/api/admin/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'];

  if (sessionId) {
    const sessions = readJSON(SESSIONS_FILE, {});
    delete sessions[sessionId];
    writeJSON(SESSIONS_FILE, sessions);
  }

  res.json({ success: true });
});

// GET /api/admin/check - Check auth status
app.get('/api/admin/check', authMiddleware, (req, res) => {
  res.json({ success: true, username: req.adminUsername });
});

// GET /api/admin/stats - Get statistics
app.get('/api/admin/stats', authMiddleware, (req, res) => {
  const events = readJSON(EVENTS_FILE, []);
  const reservations = readJSON(RESERVATIONS_FILE, []);

  const pendingReservations = reservations.filter(r => r.status === 'pending').length;
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
  const totalTickets = reservations.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + r.tickets, 0);

  res.json({
    success: true,
    data: {
      upcoming: events.filter(e => !e.is_archived).length,
      archived: events.filter(e => e.is_archived).length,
      total: events.length,
      reservations: {
        pending: pendingReservations,
        confirmed: confirmedReservations,
        total: reservations.length,
        totalTickets: totalTickets
      }
    }
  });
});

// GET /api/admin/events - List all events for admin
app.get('/api/admin/events', authMiddleware, (req, res) => {
  const events = readJSON(EVENTS_FILE, []);
  const archived = req.query.archived === '1';

  const filteredEvents = events.filter(e => e.is_archived === archived);
  filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ success: true, data: filteredEvents });
});

// GET /api/admin/events/:id - Get single event
app.get('/api/admin/events/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const events = readJSON(EVENTS_FILE, []);
  const event = events.find(e => e.id === id);

  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  res.json({ success: true, data: event });
});

// POST /api/admin/events - Create event
app.post('/api/admin/events', authMiddleware, upload.single('image'), (req, res) => {
  const events = readJSON(EVENTS_FILE, []);

  const newEvent = {
    id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
    title: req.body.title,
    artist: req.body.artist,
    date: req.body.date,
    time: req.body.time,
    price: parseFloat(req.body.price) || 0,
    genre: req.body.genre,
    month: getMonthYear(req.body.date),
    availability: req.body.availability || 'available',
    description: req.body.description || '',
    image: req.file ? req.file.filename : null,
    is_archived: req.body.is_archived === 'true' || req.body.is_archived === true
  };

  events.push(newEvent);
  writeJSON(EVENTS_FILE, events);

  res.json({ success: true, data: newEvent });
});

// PUT /api/admin/events/:id - Update event
app.put('/api/admin/events/:id', authMiddleware, upload.single('image'), (req, res) => {
  const id = parseInt(req.params.id);
  const events = readJSON(EVENTS_FILE, []);
  const index = events.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  const existingEvent = events[index];

  events[index] = {
    ...existingEvent,
    title: req.body.title || existingEvent.title,
    artist: req.body.artist || existingEvent.artist,
    date: req.body.date || existingEvent.date,
    time: req.body.time || existingEvent.time,
    price: req.body.price !== undefined ? parseFloat(req.body.price) : existingEvent.price,
    genre: req.body.genre || existingEvent.genre,
    month: req.body.date ? getMonthYear(req.body.date) : existingEvent.month,
    availability: req.body.availability || existingEvent.availability,
    description: req.body.description !== undefined ? req.body.description : existingEvent.description,
    image: req.file ? req.file.filename : (req.body.existing_image || existingEvent.image),
    is_archived: req.body.is_archived === 'true' || req.body.is_archived === true
  };

  writeJSON(EVENTS_FILE, events);

  res.json({ success: true, data: events[index] });
});

// DELETE /api/admin/events/:id - Delete event
app.delete('/api/admin/events/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const events = readJSON(EVENTS_FILE, []);
  const index = events.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  // Delete associated image
  const event = events[index];
  if (event.image) {
    const imagePath = path.join(__dirname, 'uploads', event.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  events.splice(index, 1);
  writeJSON(EVENTS_FILE, events);

  res.json({ success: true });
});

// POST /api/admin/events/:id/toggle-archive - Toggle archive status
app.post('/api/admin/events/:id/toggle-archive', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const events = readJSON(EVENTS_FILE, []);
  const index = events.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  events[index].is_archived = !events[index].is_archived;
  writeJSON(EVENTS_FILE, events);

  res.json({ success: true, data: events[index] });
});

// ==================== RESERVATIONS API ====================

// GET /api/admin/reservations - List all reservations
app.get('/api/admin/reservations', authMiddleware, (req, res) => {
  const reservations = readJSON(RESERVATIONS_FILE, []);
  const events = readJSON(EVENTS_FILE, []);
  const { eventId, status } = req.query;

  let filtered = reservations;

  if (eventId) {
    filtered = filtered.filter(r => r.eventId === parseInt(eventId));
  }

  if (status) {
    filtered = filtered.filter(r => r.status === status);
  }

  // Add event info to each reservation
  const enriched = filtered.map(r => {
    const event = events.find(e => e.id === r.eventId);
    return {
      ...r,
      eventTitle: event ? event.title : 'Unbekannt',
      eventDate: event ? event.date : null,
      eventArtist: event ? event.artist : null
    };
  });

  // Sort by creation date descending
  enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ success: true, data: enriched });
});

// GET /api/admin/reservations/:id - Get single reservation
app.get('/api/admin/reservations/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const reservations = readJSON(RESERVATIONS_FILE, []);
  const reservation = reservations.find(r => r.id === id);

  if (!reservation) {
    return res.status(404).json({ success: false, error: 'Reservation not found' });
  }

  const events = readJSON(EVENTS_FILE, []);
  const event = events.find(e => e.id === reservation.eventId);

  res.json({
    success: true,
    data: {
      ...reservation,
      eventTitle: event ? event.title : 'Unbekannt',
      eventDate: event ? event.date : null,
      eventArtist: event ? event.artist : null
    }
  });
});

// POST /api/admin/reservations - Create reservation
app.post('/api/admin/reservations', authMiddleware, (req, res) => {
  const reservations = readJSON(RESERVATIONS_FILE, []);
  const { eventId, name, email, phone, tickets, notes } = req.body;

  if (!eventId || !name || !email || !tickets) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const newReservation = {
    id: reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1,
    eventId: parseInt(eventId),
    name,
    email,
    phone: phone || '',
    tickets: parseInt(tickets),
    status: 'pending',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  reservations.push(newReservation);
  writeJSON(RESERVATIONS_FILE, reservations);

  res.json({ success: true, data: newReservation });
});

// PUT /api/admin/reservations/:id - Update reservation
app.put('/api/admin/reservations/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const reservations = readJSON(RESERVATIONS_FILE, []);
  const index = reservations.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Reservation not found' });
  }

  const existing = reservations[index];
  reservations[index] = {
    ...existing,
    eventId: req.body.eventId !== undefined ? parseInt(req.body.eventId) : existing.eventId,
    name: req.body.name || existing.name,
    email: req.body.email || existing.email,
    phone: req.body.phone !== undefined ? req.body.phone : existing.phone,
    tickets: req.body.tickets !== undefined ? parseInt(req.body.tickets) : existing.tickets,
    status: req.body.status || existing.status,
    notes: req.body.notes !== undefined ? req.body.notes : existing.notes
  };

  writeJSON(RESERVATIONS_FILE, reservations);

  res.json({ success: true, data: reservations[index] });
});

// DELETE /api/admin/reservations/:id - Delete reservation
app.delete('/api/admin/reservations/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const reservations = readJSON(RESERVATIONS_FILE, []);
  const index = reservations.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Reservation not found' });
  }

  reservations.splice(index, 1);
  writeJSON(RESERVATIONS_FILE, reservations);

  res.json({ success: true });
});

// POST /api/admin/reservations/:id/status - Update reservation status
app.post('/api/admin/reservations/:id/status', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  const reservations = readJSON(RESERVATIONS_FILE, []);
  const index = reservations.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Reservation not found' });
  }

  reservations[index].status = status;
  writeJSON(RESERVATIONS_FILE, reservations);

  res.json({ success: true, data: reservations[index] });
});

// GET /api/admin/events/:id/reservations - Get reservations for specific event
app.get('/api/admin/events/:id/reservations', authMiddleware, (req, res) => {
  const eventId = parseInt(req.params.id);
  const reservations = readJSON(RESERVATIONS_FILE, []);

  const eventReservations = reservations.filter(r => r.eventId === eventId);
  eventReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const stats = {
    total: eventReservations.length,
    pending: eventReservations.filter(r => r.status === 'pending').length,
    confirmed: eventReservations.filter(r => r.status === 'confirmed').length,
    cancelled: eventReservations.filter(r => r.status === 'cancelled').length,
    totalTickets: eventReservations.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + r.tickets, 0)
  };

  res.json({ success: true, data: eventReservations, stats });
});

// POST /api/reservations - Public endpoint for creating reservations
app.post('/api/reservations', (req, res) => {
  const reservations = readJSON(RESERVATIONS_FILE, []);
  const events = readJSON(EVENTS_FILE, []);
  const { eventId, name, email, phone, tickets, notes } = req.body;

  if (!eventId || !name || !email || !tickets) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // Check if event exists and is not archived
  const event = events.find(e => e.id === parseInt(eventId) && !e.is_archived);
  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  // Check availability
  if (event.availability === 'sold-out') {
    return res.status(400).json({ success: false, error: 'Event is sold out' });
  }

  const newReservation = {
    id: reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1,
    eventId: parseInt(eventId),
    name,
    email,
    phone: phone || '',
    tickets: parseInt(tickets),
    status: 'pending',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  reservations.push(newReservation);
  writeJSON(RESERVATIONS_FILE, reservations);

  res.json({ success: true, data: { id: newReservation.id, message: 'Reservation created successfully' } });
});

// Initialize and start server
initializeData();

app.listen(PORT, () => {
  console.log(`Altepost API server running on http://localhost:${PORT}`);
  console.log(`Admin login: username=admin, password=admin123`);
});

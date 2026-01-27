-- Altepost Database Setup Script
-- Run this script to create the necessary tables

CREATE DATABASE IF NOT EXISTS altepost CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE altepost;

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    genre VARCHAR(100) NOT NULL,
    month VARCHAR(50) NOT NULL,
    availability ENUM('available', 'few-left', 'sold-out') NOT NULL DEFAULT 'available',
    description TEXT,
    image VARCHAR(255) DEFAULT NULL,
    is_archived BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_archived (is_archived),
    INDEX idx_date (date),
    INDEX idx_genre (genre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin (password: admin123)
-- Password hash generated with password_hash('admin123', PASSWORD_DEFAULT)
INSERT INTO admins (username, password) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE username = username;

-- Insert sample upcoming events
INSERT INTO events (title, artist, date, time, price, genre, month, availability, description, is_archived) VALUES
('Winterkonzert', 'Maria Schneider Quartett', '2026-01-15', '20:00:00', 18.00, 'Jazz', 'Januar 2026', 'available', 'Ein intimer Jazzabend mit der preisgekrönten Pianistin Maria Schneider und ihrem Quartett.', 0),
('Kabarett am Freitag', 'Thomas Müller', '2026-01-22', '19:30:00', 22.00, 'Kabarett', 'Januar 2026', 'few-left', 'Politisches Kabarett mit scharfem Witz und klugen Beobachtungen zum Zeitgeschehen.', 0),
('Liedermacherkonzert', 'Anna Weber', '2026-01-29', '20:00:00', 16.00, 'Liedermacher', 'Januar 2026', 'available', 'Poetische Texte und gefühlvolle Melodien – Anna Weber verzaubert mit ihrer einzigartigen Stimme.', 0),
('Theaterstück: "Der Besuch"', 'Theatergruppe Odenwald', '2026-02-05', '19:00:00', 20.00, 'Theater', 'Februar 2026', 'available', 'Eine moderne Interpretation eines klassischen Dramas – intensiv und berührend.', 0),
('Blues & Soul Night', 'Sarah Johnson Band', '2026-02-12', '20:30:00', 19.00, 'Jazz', 'Februar 2026', 'available', 'Kraftvolle Stimmen und gefühlvolle Gitarrenklänge – ein Abend voller Soul.', 0),
('Poetry Slam', 'Diverse Künstler', '2026-02-19', '19:00:00', 12.00, 'Literatur', 'Februar 2026', 'available', 'Moderne Poesie trifft auf Performance – junges, frisches Format in historischem Ambiente.', 0)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Insert sample archived events
INSERT INTO events (title, artist, date, time, price, genre, month, availability, description, is_archived) VALUES
('Silvesterkonzert', 'Die Odenwälder', '2025-12-31', '20:00:00', 25.00, 'Folk', 'Dezember 2025', 'sold-out', 'Festliches Silvesterkonzert mit traditioneller Odenwälder Musik.', 1),
('Weihnachtskabarett', 'Peter Schmidt', '2025-12-20', '19:30:00', 20.00, 'Kabarett', 'Dezember 2025', 'sold-out', 'Humorvoller Jahresrückblick mit spitzer Feder.', 1),
('Adventskonzert', 'Chor Brensbach', '2025-12-06', '18:00:00', 15.00, 'Klassik', 'Dezember 2025', 'sold-out', 'Stimmungsvolle Adventsmusik mit dem lokalen Chor.', 1),
('Herbsttheater', 'Ensemble Darmstadt', '2025-11-15', '19:00:00', 22.00, 'Theater', 'November 2025', 'sold-out', 'Dramatisches Theaterstück über Leben und Liebe.', 1),
('Jazz Night', 'Sarah Klein Trio', '2025-10-28', '20:00:00', 18.00, 'Jazz', 'Oktober 2025', 'sold-out', 'Eleganter Jazzabend mit modernen Interpretationen.', 1),
('Sommerkonzert', 'Acoustic Garden', '2024-08-15', '20:00:00', 16.00, 'Folk', 'August 2024', 'sold-out', 'Entspannte Sommernacht mit akustischer Musik.', 1),
('Frühlingserwachen', 'Anna Weber', '2024-03-22', '20:00:00', 18.00, 'Liedermacher', 'März 2024', 'sold-out', 'Lieder über Neuanfänge und Hoffnung.', 1),
('Winterzauber', 'Maria Schneider Quartett', '2024-01-18', '20:00:00', 20.00, 'Jazz', 'Januar 2024', 'sold-out', 'Winterlicher Jazzabend mit warmen Klängen.', 1)
ON DUPLICATE KEY UPDATE title = VALUES(title);

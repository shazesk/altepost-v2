function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:'Inter',Arial,sans-serif;color:#2d2d2d">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid rgba(107,142,111,0.2)">
<tr><td style="background:#6b8e6f;padding:24px 32px;text-align:center">
  <h1 style="margin:0;color:#fff;font-family:'Playfair Display',Georgia,serif;font-size:24px">Alte Post Brensbach</h1>
</td></tr>
<tr><td style="padding:32px">${content}</td></tr>
<tr><td style="background:#faf9f7;padding:20px 32px;text-align:center;font-size:12px;color:#999">
  KleinKunstKneipe Alte Post Brensbach e.V.<br>
  Darmstädter Str. 42, 64395 Brensbach
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return value ? `<tr><td style="padding:6px 0;color:#666;width:140px;vertical-align:top">${label}:</td><td style="padding:6px 0">${value}</td></tr>` : '';
}

function dataTable(rows: string): string {
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}</table>`;
}

// --- CONTACT ---

export function contactNotification(data: { name: string; email: string; phone: string; subject: string; message: string; formType: string }) {
  return layout(`
    <h2 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;color:#2d2d2d">Neue Kontaktanfrage</h2>
    <p style="color:#666;margin:0 0 8px">Formulartyp: <strong>${data.formType === 'artist' ? 'Künstler' : data.formType === 'sponsor' ? 'Förderer' : 'Allgemein'}</strong></p>
    ${dataTable(
      row('Name', data.name) +
      row('E-Mail', `<a href="mailto:${data.email}">${data.email}</a>`) +
      row('Telefon', data.phone) +
      row('Betreff', data.subject)
    )}
    <h3 style="margin:20px 0 8px;color:#2d2d2d">Nachricht</h3>
    <div style="background:#faf9f7;padding:16px;border-radius:6px;white-space:pre-wrap">${data.message}</div>
  `);
}

export function contactConfirmation(data: { name: string; subject: string }) {
  return layout(`
    <h2 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;color:#2d2d2d">Vielen Dank für Ihre Nachricht!</h2>
    <p>Liebe/r ${data.name},</p>
    <p>wir haben Ihre Kontaktanfrage zum Thema <strong>„${data.subject}"</strong> erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
    <p style="margin-top:24px">Mit freundlichen Grüßen,<br>Ihr Team der Alten Post Brensbach</p>
  `);
}

// --- TICKET RESERVATION ---

export function ticketNotification(data: { name: string; email: string; phone: string; message: string; ticketCount: string; eventTitle: string; eventArtist: string; eventDate: string; eventTime: string; eventPrice: string; totalPrice: string }) {
  return layout(`
    <h2 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;color:#2d2d2d">Neue Ticketreservierung</h2>
    <div style="background:#6b8e6f;color:#fff;padding:16px;border-radius:6px;margin-bottom:16px">
      <strong>${data.eventTitle}</strong><br>${data.eventArtist}<br>${data.eventDate}, ${data.eventTime}
    </div>
    ${dataTable(
      row('Anzahl Tickets', data.ticketCount) +
      row('Preis/Ticket', data.eventPrice + ' EUR') +
      row('Gesamtpreis', '<strong>' + data.totalPrice + ' EUR</strong>')
    )}
    <h3 style="margin:20px 0 8px;color:#2d2d2d">Kontaktdaten</h3>
    ${dataTable(
      row('Name', data.name) +
      row('E-Mail', `<a href="mailto:${data.email}">${data.email}</a>`) +
      row('Telefon', data.phone)
    )}
    ${data.message ? `<h3 style="margin:20px 0 8px;color:#2d2d2d">Nachricht</h3><div style="background:#faf9f7;padding:16px;border-radius:6px;white-space:pre-wrap">${data.message}</div>` : ''}
  `);
}

export function ticketConfirmation(data: { name: string; ticketCount: string; eventTitle: string; eventDate: string; eventTime: string; totalPrice: string }) {
  return layout(`
    <h2 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;color:#2d2d2d">Ihre Ticketreservierung</h2>
    <p>Liebe/r ${data.name},</p>
    <p>vielen Dank für Ihre Reservierung! Hier die Zusammenfassung:</p>
    <div style="background:#faf9f7;padding:16px;border-radius:6px;margin:16px 0">
      <strong>${data.eventTitle}</strong><br>
      ${data.eventDate}, ${data.eventTime}<br>
      ${data.ticketCount} Ticket(s) – ${data.totalPrice} EUR
    </div>
    <p>Ihre Reservierung ist erst nach unserer Bestätigung verbindlich. Die Tickets werden an der Abendkasse hinterlegt. Zahlung erfolgt bar oder per EC-Karte vor Ort.</p>
    <p>Wir bestätigen Ihre Reservierung innerhalb von 24 Stunden per E-Mail.</p>
    <p style="margin-top:24px">Mit freundlichen Grüßen,<br>Ihr Team der Alten Post Brensbach</p>
  `);
}

// --- MEMBERSHIP ---

export function membershipNotification(data: { name: string; email: string; phone: string; birthdate: string; address: string; postalCode: string; city: string; message: string; membershipType: string; memberSince: string; iban: string }) {
  return layout(`
    <h2 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;color:#2d2d2d">Neuer Mitgliedsantrag</h2>
    <div style="background:#6b8e6f;color:#fff;padding:16px;border-radius:6px;margin-bottom:16px">
      <strong>${data.membershipType}</strong>
    </div>
    ${dataTable(
      row('Name', data.name) +
      row('E-Mail', `<a href="mailto:${data.email}">${data.email}</a>`) +
      row('Telefon', data.phone) +
      row('Geburtsdatum', data.birthdate) +
      row('Adresse', data.address) +
      row('PLZ / Ort', data.postalCode + ' ' + data.city) +
      row('Mitglied seit', data.memberSince) +
      row('IBAN', data.iban)
    )}
    ${data.message ? `<h3 style="margin:20px 0 8px;color:#2d2d2d">Nachricht</h3><div style="background:#faf9f7;padding:16px;border-radius:6px;white-space:pre-wrap">${data.message}</div>` : ''}
  `);
}

export function membershipConfirmation(data: { name: string; membershipType: string }) {
  return layout(`
    <h2 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;color:#2d2d2d">Ihr Mitgliedsantrag</h2>
    <p>Liebe/r ${data.name},</p>
    <p>vielen Dank für Ihr Interesse an einer Mitgliedschaft bei uns!</p>
    <div style="background:#faf9f7;padding:16px;border-radius:6px;margin:16px 0">
      <strong>${data.membershipType}</strong>
    </div>
    <p>Wir senden Ihnen in Kürze die Beitragsordnung und weitere Informationen zu. Nach Bestätigung erhalten Sie Ihre Mitgliedsurkunde.</p>
    <p style="margin-top:24px">Mit freundlichen Grüßen,<br>Ihr Team der Alten Post Brensbach</p>
  `);
}

// --- VOUCHER ---

export function voucherNotification(data: { buyerName: string; buyerEmail: string; buyerPhone: string; voucherDetails: string; voucherValue: string; delivery: string; recipientName: string; recipientEmail: string; message: string }) {
  return layout(`
    <h2 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;color:#2d2d2d">Neue Gutschein-Bestellung</h2>
    <div style="background:#6b8e6f;color:#fff;padding:16px;border-radius:6px;margin-bottom:16px">
      <strong>${data.voucherDetails}</strong><br>Wert: ${data.voucherValue}
    </div>
    ${dataTable(
      row('Zustellung', data.delivery === 'email' ? 'Per E-Mail (PDF)' : 'Abholung vor Ort')
    )}
    <h3 style="margin:20px 0 8px;color:#2d2d2d">Käufer</h3>
    ${dataTable(
      row('Name', data.buyerName) +
      row('E-Mail', `<a href="mailto:${data.buyerEmail}">${data.buyerEmail}</a>`) +
      row('Telefon', data.buyerPhone)
    )}
    ${data.recipientName || data.recipientEmail ? `
      <h3 style="margin:20px 0 8px;color:#2d2d2d">Empfänger</h3>
      ${dataTable(row('Name', data.recipientName) + row('E-Mail', data.recipientEmail))}
    ` : ''}
    ${data.message ? `<h3 style="margin:20px 0 8px;color:#2d2d2d">Grußbotschaft</h3><div style="background:#faf9f7;padding:16px;border-radius:6px;white-space:pre-wrap">${data.message}</div>` : ''}
  `);
}

export function voucherConfirmation(data: { buyerName: string; voucherDetails: string; voucherValue: string }) {
  return layout(`
    <h2 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;color:#2d2d2d">Ihre Gutschein-Bestellung</h2>
    <p>Liebe/r ${data.buyerName},</p>
    <p>vielen Dank für Ihre Gutschein-Bestellung!</p>
    <div style="background:#faf9f7;padding:16px;border-radius:6px;margin:16px 0">
      <strong>${data.voucherDetails}</strong><br>Wert: ${data.voucherValue}
    </div>
    <p>Wir senden Ihnen in Kürze die Zahlungsinformationen zu. Der Gutschein wird nach Zahlungseingang versendet bzw. zur Abholung bereitgestellt.</p>
    <p style="margin-top:24px">Mit freundlichen Grüßen,<br>Ihr Team der Alten Post Brensbach</p>
  `);
}

// --- INFO-POST NEWSLETTER ---

interface InfoPostEvent {
  title: string;
  artist: string;
  date: string;
  time: string;
  image: string | null;
}

export function infoPostEmail(data: { title: string; introText: string; events: InfoPostEvent[]; unsubscribeUrl?: string }) {
  const eventsHtml = data.events.length > 0
    ? `<h3 style="margin:24px 0 12px;font-family:'Playfair Display',Georgia,serif;color:#2d2d2d">Kommende Veranstaltungen</h3>` +
      data.events.map(ev => `
        <div style="background:#faf9f7;border-radius:6px;padding:16px;margin-bottom:12px;border-left:4px solid #6b8e6f">
          ${ev.image ? `<img src="${ev.image}" alt="${ev.title}" style="width:100%;max-height:200px;object-fit:cover;border-radius:4px;margin-bottom:12px" />` : ''}
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:18px;color:#2d2d2d;margin-bottom:4px"><strong>${ev.title}</strong></div>
          <div style="color:#666;font-size:14px;margin-bottom:4px">${ev.artist}</div>
          <div style="color:#6b8e6f;font-size:14px;font-weight:600">${ev.date}, ${ev.time}</div>
          <a href="https://friedrichholdings.de/programm" style="display:inline-block;margin-top:8px;color:#6b8e6f;font-size:13px;text-decoration:underline">Tickets reservieren</a>
        </div>
      `).join('')
    : '';

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:'Inter',Arial,sans-serif;color:#2d2d2d">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid rgba(107,142,111,0.2)">
<tr><td style="background:#6b8e6f;padding:24px 32px;text-align:center">
  <h1 style="margin:0;color:#fff;font-family:'Playfair Display',Georgia,serif;font-size:22px">Newsletter</h1>
  <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px">KleinKunstKneipe Alte Post e.V.</p>
  <a href="https://friedrichholdings.de" style="color:rgba(255,255,255,0.7);font-size:12px;text-decoration:underline">friedrichholdings.de</a>
</td></tr>
<tr><td style="padding:32px">
  <h2 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;color:#2d2d2d">${data.title}</h2>
  <div style="color:#444;line-height:1.6;white-space:pre-wrap;margin-bottom:16px">${data.introText}</div>
  ${eventsHtml}
</td></tr>
<tr><td style="background:#faf9f7;padding:20px 32px;text-align:center;font-size:12px;color:#999">
  KleinKunstKneipe Alte Post Brensbach e.V.<br>
  Darmstädter Str. 42, 64395 Brensbach<br><br>
  <span style="color:#aaa">${data.unsubscribeUrl
    ? `<a href="${data.unsubscribeUrl}" style="color:#aaa;text-decoration:underline">Vom Newsletter abmelden</a>`
    : 'Wenn Sie zukünftig keinen Newsletter mehr erhalten wollen, antworten Sie bitte auf diese E-Mail mit dem Betreff „Abmelden".'}</span>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

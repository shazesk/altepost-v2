import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../_lib/cors.js';
import { validateSession } from '../_lib/auth.js';
import {
  readContacts,
  writeContacts,
  readVouchers,
  writeVouchers,
  readMemberships,
  writeMemberships,
  Contact,
  VoucherOrder,
  MembershipApplication
} from '../_lib/data.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;

  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId || !validateSession(sessionId)) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const slug = req.query.slug as string[];
  if (!slug || slug.length === 0) {
    return res.status(400).json({ success: false, error: 'Missing resource type' });
  }

  const resourceType = slug[0]; // 'contacts', 'vouchers', or 'memberships'
  // Support ID from path segment OR query parameter (Vercel catch-all may not match 2+ segments)
  const resourceId = slug[1] ? parseInt(slug[1]) : (req.query.id ? parseInt(req.query.id as string) : null);

  // Handle contacts
  if (resourceType === 'contacts') {
    if (!resourceId) {
      return res.status(400).json({ success: false, error: 'Missing contact ID' });
    }

    const contacts = await readContacts();
    const index = contacts.findIndex(c => c.id === resourceId);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: contacts[index] });
    }

    if (req.method === 'PUT') {
      const updates = req.body || {};
      contacts[index] = { ...contacts[index], ...updates };
      await writeContacts(contacts);
      return res.status(200).json({ success: true, data: contacts[index] });
    }

    if (req.method === 'DELETE') {
      const deleted = contacts.splice(index, 1)[0];
      await writeContacts(contacts);
      return res.status(200).json({ success: true, data: deleted });
    }
  }

  // Handle vouchers
  if (resourceType === 'vouchers') {
    if (!resourceId) {
      return res.status(400).json({ success: false, error: 'Missing voucher ID' });
    }

    const vouchers = await readVouchers();
    const index = vouchers.findIndex(v => v.id === resourceId);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Voucher not found' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: vouchers[index] });
    }

    if (req.method === 'PUT') {
      const updates = req.body || {};
      vouchers[index] = { ...vouchers[index], ...updates };
      await writeVouchers(vouchers);
      return res.status(200).json({ success: true, data: vouchers[index] });
    }

    if (req.method === 'DELETE') {
      const deleted = vouchers.splice(index, 1)[0];
      await writeVouchers(vouchers);
      return res.status(200).json({ success: true, data: deleted });
    }
  }

  // Handle memberships
  if (resourceType === 'memberships') {
    if (!resourceId) {
      return res.status(400).json({ success: false, error: 'Missing membership ID' });
    }

    const memberships = await readMemberships();
    const index = memberships.findIndex(m => m.id === resourceId);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Membership not found' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: memberships[index] });
    }

    if (req.method === 'PUT') {
      const updates = req.body || {};
      memberships[index] = { ...memberships[index], ...updates };
      await writeMemberships(memberships);
      return res.status(200).json({ success: true, data: memberships[index] });
    }

    if (req.method === 'DELETE') {
      const deleted = memberships.splice(index, 1)[0];
      await writeMemberships(memberships);
      return res.status(200).json({ success: true, data: deleted });
    }
  }

  return res.status(400).json({ success: false, error: 'Invalid resource type. Use: contacts, vouchers, memberships' });
}

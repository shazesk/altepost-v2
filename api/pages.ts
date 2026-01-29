import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readPageContent, readTestimonials, listPages, readSettings } from './admin/_lib/data.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for public endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, type } = req.query;

  // Get site settings (replaces /api/settings)
  if (type === 'settings') {
    const settings = await readSettings();
    return res.status(200).json({ success: true, data: settings });
  }

  // Get list of all pages
  if (type === 'list') {
    const pages = await listPages();
    return res.status(200).json({ success: true, data: pages });
  }

  // Get testimonials
  if (type === 'testimonials') {
    const testimonials = await readTestimonials();
    const { page } = req.query;
    if (page && typeof page === 'string') {
      const filtered = testimonials.filter(t => t.page === page);
      return res.status(200).json({ success: true, data: filtered });
    }
    return res.status(200).json({ success: true, data: testimonials });
  }

  // Get specific page content
  if (name && typeof name === 'string') {
    const content = await readPageContent(name);
    if (!content) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    return res.status(200).json({ success: true, data: content });
  }

  return res.status(400).json({ success: false, error: 'Missing name or type parameter. Use: type=settings, type=list, type=testimonials, or name=<pagename>' });
}

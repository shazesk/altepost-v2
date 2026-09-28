import { useEffect, useMemo, useState } from 'react';
import { X, Loader2, ImageIcon, Trash2 } from 'lucide-react';

export interface MediaImage {
  url: string;
  // Where the file lives, shown so editors can tell uploads from website files.
  location: string;
  name: string;
  // Only uploads can be deleted; website files are part of the code.
  deletable?: boolean;
}

interface MediaLibraryProps {
  open: boolean;
  apiBase: string;
  sessionId: string;
  // Images that are not in the upload store, e.g. logos shipped with the website.
  extraImages?: MediaImage[];
  onSelect: (url: string) => void;
  onClose: () => void;
}

const FOLDER_LABELS: Record<string, string> = {
  sponsors: 'Sponsoren',
  events: 'Veranstaltungen',
  gallery: 'Galerie',
  site: 'Website',
};

function describeBlob(pathname: string): MediaImage['location'] {
  const folder = pathname.includes('/') ? pathname.split('/')[0] : '';
  return `Upload-Speicher › ${FOLDER_LABELS[folder] || folder || 'Sonstige'}`;
}

export function MediaLibrary({ open, apiBase, sessionId, extraImages = [], onSelect, onClose }: MediaLibraryProps) {
  const [uploads, setUploads] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function deleteImage(url: string) {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/events?action=delete-image`, {
        method: 'POST',
        headers: { 'x-session-id': sessionId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Löschen fehlgeschlagen');
      setUploads(prev => prev.filter(img => img.url !== url));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch(`${apiBase}/events?action=list-images`, { headers: { 'x-session-id': sessionId } })
      .then(r => r.json())
      .then(data => {
        if (!data.success) throw new Error(data.error || 'Laden fehlgeschlagen');
        setUploads(
          (data.data as { url: string; pathname: string }[])
            .filter(b => /\.(png|jpe?g|gif|webp|svg)$/i.test(b.pathname))
            .map(b => ({ url: b.url, location: describeBlob(b.pathname), name: b.pathname.split('/').pop() || b.pathname, deletable: true }))
        );
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, apiBase, sessionId]);

  const all = useMemo(() => {
    const seen = new Set<string>();
    return [...extraImages, ...uploads].filter(img => {
      if (seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    });
  }, [extraImages, uploads]);

  const locations = useMemo(() => Array.from(new Set(all.map(i => i.location))), [all]);
  const shown = filter === 'all' ? all : all.filter(i => i.location === filter);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(107,142,111,0.2)]">
          <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d]">Mediathek</h3>
          <button onClick={onClose} className="text-[#666666] hover:text-[#2d2d2d] p-1" title="Schließen">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 flex flex-wrap gap-2 border-b border-[rgba(107,142,111,0.1)]">
          {['all', ...locations].map(loc => (
            <button
              key={loc}
              onClick={() => setFilter(loc)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === loc ? 'bg-[#6b8e6f] text-white' : 'bg-[#f5f3f0] text-[#2d2d2d] hover:bg-[#e8e4df]'}`}
            >
              {loc === 'all' ? `Alle (${all.length})` : loc}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12 text-[#666666]">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Bilder werden geladen…
            </div>
          )}
          {error && <p className="text-[#8b4454] text-sm mb-4">Fehler im Upload-Speicher: {error}</p>}
          {!loading && shown.length === 0 && (
            <div className="flex flex-col items-center py-12 text-[#666666]">
              <ImageIcon className="w-8 h-8 mb-2" /> Keine Bilder gefunden
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {shown.map(img => (
              <div
                key={img.url}
                className="relative border border-[rgba(107,142,111,0.2)] rounded-lg overflow-hidden hover:border-[#6b8e6f] hover:shadow transition"
              >
                <button
                  type="button"
                  onClick={() => { onSelect(img.url); onClose(); }}
                  className="block w-full text-left"
                  title={img.url}
                >
                  <div className="h-28 bg-[#faf9f7] flex items-center justify-center p-2">
                    <img src={img.url} alt={img.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="px-2 py-1.5 pr-8">
                    <div className="text-xs text-[#2d2d2d] truncate">{img.name}</div>
                    <div className="text-[11px] text-[#666666] truncate">{img.location}</div>
                  </div>
                </button>
                {img.deletable && confirmDelete !== img.url && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(img.url)}
                    className="absolute bottom-1.5 right-1.5 p-1 rounded text-[#8b4454] hover:bg-[#f5e9ec]"
                    title="Bild löschen"
                    aria-label={`${img.name} löschen`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {confirmDelete === img.url && (
                  <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-2 p-2 text-center">
                    <p className="text-xs text-[#2d2d2d]">Bild endgültig löschen? Wo es noch verwendet wird, fehlt es danach.</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => deleteImage(img.url)}
                        className="px-3 py-1 rounded text-xs bg-[#8b4454] text-white hover:bg-[#7a3343] disabled:opacity-50"
                      >
                        {deleting ? 'Löscht…' : 'Löschen'}
                      </button>
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1 rounded text-xs bg-[#e8e4df] text-[#2d2d2d]"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

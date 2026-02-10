import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  itemToCitationSource,
  exportBibTeX,
  exportRIS,
  exportCSLJSON,
  type ItemRowForCitation,
} from '@/lib/citations';

const CITATION_COLUMNS =
  'id, title, source_type, url, domain, original_filename, created_at, authors, publisher, published_at, accessed_at, doi';

const MIME: Record<string, string> = {
  bibtex: 'application/x-bibtex',
  ris: 'application/x-research-info-systems',
  'csl-json': 'application/json',
};

const EXT: Record<string, string> = {
  bibtex: '.bib',
  ris: '.ris',
  'csl-json': '.json',
};

export async function POST(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { format?: string; itemIds?: string[]; accessedAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const format = body.format === 'bibtex' || body.format === 'ris' || body.format === 'csl-json'
    ? body.format
    : null;
  if (!format) {
    return NextResponse.json(
      { error: 'format must be bibtex, ris, or csl-json' },
      { status: 400 }
    );
  }

  const itemIds = Array.isArray(body.itemIds)
    ? body.itemIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    : [];
  if (itemIds.length === 0) {
    return NextResponse.json(
      { error: 'itemIds must be a non-empty array' },
      { status: 400 }
    );
  }

  const accessedAt =
    typeof body.accessedAt === 'string' && body.accessedAt.trim()
      ? body.accessedAt.trim().slice(0, 10)
      : undefined;

  const admin = supabaseAdmin();
  const { data: items, error } = await admin
    .from('items')
    .select(CITATION_COLUMNS)
    .eq('user_id', user.id)
    .in('id', itemIds);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }

  const foundIds = new Set((items ?? []).map((r) => r.id));
  const missing = itemIds.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: 'Item not found', ids: missing },
      { status: 404 }
    );
  }

  const sources = (items ?? []).map((row) =>
    itemToCitationSource(row as ItemRowForCitation, { accessedAt })
  );

  let bodyContent: string;
  if (format === 'bibtex') {
    bodyContent = exportBibTeX(sources);
  } else if (format === 'ris') {
    bodyContent = exportRIS(sources);
  } else {
    bodyContent = exportCSLJSON(sources);
  }

  const filename = `citestack-export${EXT[format]}`;
  const contentType = MIME[format];

  return new NextResponse(bodyContent, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];
const ALLOWED_EXT = ['.pdf', '.docx', '.txt', '.md'];

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200) || 'file';
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }

  const title = formData.get('title');
  const titleStr = typeof title === 'string' ? title.trim() : undefined;

  const f = file as File;
  const mimeType = f.type || 'application/octet-stream';
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return NextResponse.json(
      { error: 'File type not allowed. Use PDF, DOCX, TXT, or MD.' },
      { status: 400 }
    );
  }

  const name = f.name || 'file';
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  if (!ALLOWED_EXT.includes(ext.toLowerCase())) {
    return NextResponse.json(
      { error: 'File type not allowed. Use PDF, DOCX, TXT, or MD.' },
      { status: 400 }
    );
  }

  const admin = supabaseAdmin();

  const { data: item, error: itemError } = await admin
    .from('items')
    .insert({
      user_id: user.id,
      source_type: 'file',
      file_path: null,
      mime_type: mimeType,
      original_filename: name,
      status: 'captured',
    })
    .select('id')
    .single();

  if (itemError || !item) {
    return NextResponse.json(
      { error: 'Could not create item' },
      { status: 500 }
    );
  }

  const path = `${user.id}/${item.id}/${sanitizeFilename(name)}`;
  const buf = Buffer.from(await f.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from('library-files')
    .upload(path, buf, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    await admin.from('items').delete().eq('id', item.id);
    return NextResponse.json(
      { error: 'Could not upload file. Ensure bucket library-files exists.' },
      { status: 500 }
    );
  }

  const { error: updateError } = await admin
    .from('items')
    .update({ file_path: path })
    .eq('id', item.id);

  if (updateError) {
    return NextResponse.json(
      { error: 'Could not update item' },
      { status: 500 }
    );
  }

  const { data: job, error: jobError } = await admin
    .from('jobs')
    .insert({
      user_id: user.id,
      item_id: item.id,
      type: 'extract_file',
      payload: { itemId: item.id, filePath: path, mimeType },
      status: 'queued',
    })
    .select('id')
    .single();

  if (jobError) {
    return NextResponse.json(
      { error: 'Could not enqueue job' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { itemId: item.id, jobId: job?.id },
    { status: 201 }
  );
}

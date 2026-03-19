import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { downloadRatelimit, getIp } from '@/lib/ratelimit';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  // Rate limiting
  if (downloadRatelimit) {
    const ip = getIp(_request);
    const { success } = await downloadRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
    }
  }

  const { purchaseId } = await params;

  // Verify auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify purchase belongs to user
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select('*, product:products(id, file_path, name_fr)')
    .eq('id', purchaseId)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .single();

  if (purchaseError || !purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
  }

  if (!purchase.product?.file_path) {
    return NextResponse.json({ error: 'File not available' }, { status: 404 });
  }

  // Generate signed URL (15 minutes)
  const adminClient = createAdminClient();
  const { data: signedData, error: signedError } = await adminClient.storage
    .from('products')
    .createSignedUrl(purchase.product.file_path, 900);

  if (signedError || !signedData?.signedUrl) {
    return NextResponse.json({ error: 'Could not generate download URL' }, { status: 500 });
  }

  // Log download
  await adminClient.from('downloads').insert({
    user_id: user.id,
    purchase_id: purchaseId,
    product_id: purchase.product.id,
  });

  return NextResponse.json({ url: signedData.signedUrl });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFreePackBySlug } from '@/lib/freePacksConfig';

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Slug manquant.' }, { status: 400 });
    }

    const pack = getFreePackBySlug(slug);
    if (!pack) {
      return NextResponse.json({ error: 'Pack introuvable.' }, { status: 404 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
    }

    /* Check if already claimed */
    const { data: existing } = await supabase
      .from('free_claims')
      .select('id, download_url')
      .eq('user_id', user.id)
      .eq('pack_slug', slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyClaimed: true,
        downloadUrl: existing.download_url ?? pack.downloadUrl ?? null,
      });
    }

    /* Create claim record */
    const { error: insertError } = await supabase
      .from('free_claims')
      .insert({
        user_id: user.id,
        pack_slug: slug,
        download_url: pack.downloadUrl ?? null,
      });

    if (insertError) {
      console.error('free_claims insert error:', insertError);
      // Table may not exist yet — still return success with downloadUrl if available
    }

    return NextResponse.json({
      success: true,
      downloadUrl: pack.downloadUrl ?? null,
    });
  } catch (err) {
    console.error('free-claim error:', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

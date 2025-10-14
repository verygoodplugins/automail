// Admin endpoint to view/export waitlist data
// GET /admin/waitlist - View data (JSON)
// POST /admin/waitlist - Export as CSV
// Auth: Authorization: Bearer <ADMIN_TOKEN>

export async function onRequestGet({ request, env }) {
  // Authorization: prefer Bearer token header, fallback to query param for compatibility
  const url = new URL(request.url);
  const authHeader = request.headers.get('authorization') || '';
  const headerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7)
    : null;
  const queryToken = url.searchParams.get('token');
  const token = headerToken || queryToken;

  if (!token || token !== env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const db = env.D1 || env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'D1 binding not found' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const { results } = await db.prepare(
      'SELECT email, source, created_at, confirmed, unsubscribed FROM waitlist ORDER BY created_at DESC LIMIT 1000'
    ).all();

    const stats = await db.prepare(
      'SELECT * FROM waitlist_stats'
    ).first();

    return new Response(JSON.stringify({
      stats,
      signups: results
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Admin error:', error);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Export waitlist as CSV
export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const authHeader = request.headers.get('authorization') || '';
  const headerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7)
    : null;
  const queryToken = url.searchParams.get('token');
  const token = headerToken || queryToken;

  if (!token || token !== env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const db = env.D1 || env.DB;
    if (!db) {
      return new Response('D1 binding not found', { status: 500 });
    }
    const { results } = await db.prepare(
      'SELECT email, source, created_at, confirmed, unsubscribed FROM waitlist ORDER BY created_at DESC'
    ).all();

    // Convert to CSV
    const csv = [
      'Email,Source,Signup Date,Confirmed,Unsubscribed',
      ...results.map(row => 
        `"${row.email}","${row.source}","${row.created_at}",${row.confirmed},${row.unsubscribed}`
      )
    ].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="waitlist.csv"'
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return new Response('Export failed', { status: 500 });
  }
}


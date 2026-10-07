import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const prologBaseUrl = process.env.PROLOG_URL;
    if (!prologBaseUrl) {
      return NextResponse.json(
        { error: 'Advisory service configuration error (PROLOG_URL missing).' },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload in request.' },
        { status: 400 }
      );
    }

    // Ensure numeric fields are numbers
    const payload = {
      age: Number(body.age),
      income: Number(body.income),
      expenses: Number(body.expenses),
      savings: Number(body.savings),
      debt: Number(body.debt),
      risk: String(body.risk || ''),
      horizon: Number(body.horizon),
    };

    const prologUrl = `${prologBaseUrl.replace(/\/+$/, '')}/advise`;

    let prologResponse;
    try {
      prologResponse = await fetch(prologUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      return NextResponse.json(
        {
          error:
            'Unable to reach the advisory engine. Please ensure the Prolog service is running.',
        },
        { status: 503 }
      );
    }

    const data = await prologResponse.json();

    if (!prologResponse.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to process financial assessment.' },
        { status: prologResponse.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected internal error occurred.' },
      { status: 500 }
    );
  }
}

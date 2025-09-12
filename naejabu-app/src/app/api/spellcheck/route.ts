import { NextRequest, NextResponse } from 'next/server';
import hanspell from 'hanspell';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ message: 'Text is required' }, { status: 400 });
    }

    const results = await new Promise((resolve, reject) => {
        hanspell.spellCheckByDAUM(text, 6000, resolve, reject);
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Spell check error:', error);
    return NextResponse.json({ message: 'Error during spell check' }, { status: 500 });
  }
}

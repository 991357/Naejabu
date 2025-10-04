import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const MODEL_NAME = "gemini-pro";

export async function POST(req: NextRequest) {
  // 1. 사용자 인증 확인
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authorization header is missing' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // 2. Gemini API 키 확인
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const { resumeContent } = await req.json();
    if (!resumeContent) {
      return NextResponse.json({ error: 'Resume content is required' }, { status: 400 });
    }

    // 3. Gemini AI 모델 호출
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
      response_mime_type: "application/json",
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const prompt = `
      You are a professional career consultant and resume expert in South Korea.
      Please provide feedback on the following cover letter for a job application.
      Your feedback should be constructive, insightful, and help the applicant improve their writing.

      Analyze the text and provide the following in a JSON format:
      1.  An "overall" assessment (string).
      2.  An array of "suggestions" (array of objects), where each object contains:
          - "original": The specific sentence or phrase from the text that can be improved.
          - "suggestion": A concrete, improved version of the phrase.
          - "comment": A brief explanation of why the change is recommended.

      The output must be a valid JSON object with keys "overall" and "suggestions".
      The entire response must be in Korean.

      Cover Letter Text:
      ---
      ${resumeContent}
      ---

      JSON Output:
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("--- Raw AI Response ---");
    console.log(responseText);
    console.log("-----------------------");
    
    // 4. 결과 파싱 및 반환
    const feedback = JSON.parse(responseText);

    return NextResponse.json({ feedback });

  } catch (error) {
    console.error('AI feedback error:', error);
    return NextResponse.json({ error: 'Failed to get AI feedback. Please check the server logs.' }, { status: 500 });
  }
}

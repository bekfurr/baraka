import { genAI } from '@/lib/gemini';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { skills, role, requirements } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = '';
    if (role === 'freelancer') {
      prompt = `
        You are Baraka AI, an intelligent matchmaking assistant for a freelance platform.
        A freelancer has the following skills: ${skills.join(', ')}.
        Based on market trends, generate 3 highly relevant dynamic job opportunities they should apply for.
        Format the response in JSON array with keys: title, description, budget, matchScore (percentage).
        No markdown, just raw JSON array.
      `;
    } else {
      prompt = `
        You are Baraka AI, an intelligent matchmaking assistant for a freelance platform.
        A client needs a freelancer with these requirements: ${requirements}.
        Generate 3 ideal candidate profiles that would perfectly match this job.
        Format the response in JSON array with keys: name, skills, hourlyRate, matchScore (percentage).
        No markdown, just raw JSON array.
      `;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Attempt to parse JSON. Sometimes Gemini returns markdown blocks like ```json ... ```
    let cleanJSON = responseText;
    if (responseText.includes('```json')) {
      cleanJSON = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (responseText.includes('```')) {
        cleanJSON = responseText.replace(/```/g, '').trim();
    }

    const matches = JSON.parse(cleanJSON);

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('AI Match Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { IAssignment, IGeneratedPaper } from '../models/Assignment';

function buildPrompt(assignment: IAssignment): string {
  const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const questionTypesDesc = assignment.questionTypes
    .map(
      (qt, i) =>
        `Section ${sectionLetters[i] || String.fromCharCode(65 + i)}: ${qt.type} - ${qt.numberOfQuestions} questions, ${qt.marks} marks each`
    )
    .join('\n');

  return `You are an expert teacher creating a structured question paper. Generate a JSON question paper with the following specifications:

Subject: ${assignment.subject || 'General'}
Class: ${assignment.className || 'Not specified'}
Title: ${assignment.title}
Total Questions: ${assignment.totalQuestions}
Total Marks: ${assignment.totalMarks}

Question Sections:
${questionTypesDesc}

${assignment.additionalInfo ? `Additional Instructions: ${assignment.additionalInfo}` : ''}
${assignment.uploadedFileText ? `Reference Material:\n${assignment.uploadedFileText.substring(0, 3000)}` : ''}

IMPORTANT: Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "schoolName": "Delhi Public School, Sector-4, Bokaro",
  "subject": "${assignment.subject || 'General'}",
  "className": "${assignment.className || '5th'}",
  "timeAllowed": "45 minutes",
  "maxMarks": ${assignment.totalMarks},
  "generalInstructions": "All questions are compulsory unless stated otherwise.",
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries X marks",
      "questionType": "Multiple Choice Questions",
      "marksPerQuestion": 1,
      "questions": [
        {
          "questionNumber": 1,
          "text": "Question text here",
          "difficulty": "Easy",
          "marks": 1,
          "type": "Multiple Choice Questions",
          "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"]
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionNumber": 1,
      "answer": "Detailed answer here"
    }
  ]
}

Rules:
- For Multiple Choice Questions, True/False, and Fill in the Blanks: ALWAYS include an "options" array with 4 choices prefixed with A), B), C), D)
- For other question types (Short Questions, Long Answer, Numerical, etc.): do NOT include "options"
- Mix difficulty levels: ~40% Easy, ~40% Moderate, ~20% Hard
- difficulty must be exactly "Easy", "Moderate", or "Hard"
- Each section should match the requested question type
- Questions must be relevant to the subject and class level
- Include a complete answer key with detailed answers
- Return ONLY valid JSON, no extra text`;
}

function parseResponse(text: string): IGeneratedPaper {
  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1];
  const braceStart = jsonStr.indexOf('{');
  const braceEnd = jsonStr.lastIndexOf('}');
  if (braceStart !== -1 && braceEnd !== -1) {
    jsonStr = jsonStr.substring(braceStart, braceEnd + 1);
  }
  const parsed: IGeneratedPaper = JSON.parse(jsonStr);
  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error('Invalid response: missing sections');
  }
  let globalQ = 1;
  for (const section of parsed.sections) {
    if (!section.questions) section.questions = [];
    for (const q of section.questions) {
      q.questionNumber = globalQ++;
      if (!['Easy', 'Moderate', 'Hard'].includes(q.difficulty)) q.difficulty = 'Moderate';
    }
  }
  return parsed;
}

async function generateWithGroq(prompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not set');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert teacher. Return ONLY valid JSON, no extra text.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err}`);
  }
  const data: any = await res.json();
  return data.choices[0].message.content;
}

export async function generateQuestionPaper(assignment: IAssignment): Promise<IGeneratedPaper> {
  const prompt = buildPrompt(assignment);
  const providers: { name: string; fn: (p: string) => Promise<string> }[] = [];

  if (process.env.GROQ_API_KEY) providers.push({ name: 'Groq', fn: generateWithGroq });

  if (providers.length === 0) throw new Error('No AI API key set. Add GROQ_API_KEY or GEMINI_API_KEY to .env');

  let lastError: Error | null = null;
  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name}...`);
      const text = await provider.fn(prompt);
      console.log(`${provider.name} succeeded`);
      return parseResponse(text);
    } catch (err: any) {
      console.error(`${provider.name} failed:`, err.message);
      lastError = err;
    }
  }
  throw lastError || new Error('All AI providers failed');
}


import { GoogleGenAI } from "@google/genai";
import { Student, SchoolEvent } from "../types";

export const generateReportComment = async (student: Student): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const gradesSummary = student.grades.length > 0 
      ? student.grades.map(g => `${g.subject} (${g.score}/${g.maxScore})`).join(', ')
      : "No grades recorded for this term.";
      
    const attendanceCount = Object.values(student.attendance).filter(a => a === 'PRESENT').length;
    const totalDays = Object.keys(student.attendance).length;
    const attendanceRate = totalDays > 0 ? Math.round((attendanceCount / totalDays) * 100) : 100;

    const prompt = `
      As a professional school principal at Cedar Crest International School, write a concise (2-4 sentences) terminal report comment for the student: ${student.name}.
      
      Analyze the following data to provide a nuanced and personalized comment:
      - Academic Performance: ${gradesSummary}
      - Attendance: ${attendanceCount} days present out of ${totalDays} (${attendanceRate}% attendance rate).
      
      Guidelines:
      1. Mention the attendance rate. If it's excellent (>=95%), praise their commitment. If it's concerning (<90%), gently emphasize the importance of regular attendance for academic success.
      2. Explicitly identify their strongest subject(s) based on the scores provided.
      3. Identify any subjects where there is room for growth or more focus needed.
      4. Use a tone that is professional, encouraging, and specific. Avoid generic "well done" statements.
      
      Response should be a single paragraph.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "The student has demonstrated a positive attitude toward learning. We look forward to their continued progress in the next term.";
  } catch (error) {
    console.error("Error generating comment:", error);
    return "The student is making steady progress across the curriculum. Continued focus on subject fundamentals and consistent attendance is recommended for future academic success.";
  }
};

export const generateEventEmail = async (event: SchoolEvent): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      As the Administrative Office of Cedar Crest International School, draft a professional and inviting email to student guardians about an upcoming event.
      
      Event Details:
      - Title: ${event.title}
      - Date: ${event.date}
      - Time: ${event.time}
      - Location: ${event.location}
      - Description: ${event.description}
      
      Guidelines:
      1. Start with a professional greeting.
      2. Clearly state the purpose of the event.
      3. Encourage attendance and explain why it is important for the school community.
      4. Provide the logistics clearly.
      5. End with a professional sign-off from "CCIS Administration".
      
      Keep the email concise and suitable for a school setting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Professional email draft could not be generated.";
  } catch (error) {
    console.error("Error generating email:", error);
    return `Dear Guardians,\n\nWe invite you to our upcoming event: ${event.title}.\n\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.location}\n\nWe look forward to seeing you there.\n\nBest regards,\nCCIS Administration`;
  }
};

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Chuyển đổi Blob sang Base64 (Chuẩn Gemini SDK)
 */
async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // Tách bỏ phần tiền tố "data:...;base64,"
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Helper: Xác định MIME Type từ file name nếu file.type rỗng hoặc không chuẩn
 */
export function getMimeType(file) {
    if (file.type && file.type !== 'application/octet-stream') return file.type
    const ext = file.name?.split('.').pop()?.toLowerCase()
    const mimeMap = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        m4a: 'audio/mp4',
        ogg: 'audio/ogg',
        webm: 'audio/webm',
        flac: 'audio/flac',
        aac: 'audio/aac',
    }
    return mimeMap[ext] || 'audio/webm'
}

/**
 * Phân tích báo cáo cuộc họp (ZenVoice Logic)
 * @param {Blob} audioBlob - File âm thanh
 * @param {string} apiKey - Gemini API Key
 * @param {string} modelName - ID Model (mặc định gemini-2.1-flash hoặc gemini-2.0-flash-exp)
 * @param {function} onProgress - Callback tiến độ
 */
export async function analyzeMeeting(audioBlob, apiKey, modelName = 'gemini-2.5-flash', onProgress = () => { }) {
    let retries = 3;
    let delay = 2000;

    while (retries > 0) {
        try {
        onProgress(10, 'Khởi tạo AI...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
            }
        });

        onProgress(30, 'Chuyển đổi dữ liệu âm thanh...');
        const base64Data = await blobToBase64(audioBlob);

        onProgress(50, 'Đang phân tích với AI (đang xử lý)...');

        const prompt = `Phân tích báo cáo âm thanh và trả về JSON chuẩn:
    { 
      "title": "Tên báo cáo ngắn gọn", 
      "summary": "Tóm tắt súc tích", 
      "transcript": "Lời thoại chi tiết", 
      "key_points": ["Ý chính 1", "Ý chính 2"], 
      "decisions": ["Quyết định 1"], 
      "action_items": ["Việc cần làm 1"], 
      "risks": ["Rủi ro 1"], 
      "progress": 85, 
      "tags": ["du-an", "hop"], 
      "mindmap": { 
        "center": "Chủ đề chính của cuộc họp", 
        "branches": [ 
          { 
            "label": "Nhánh quan trọng 1", 
            "children": ["Ý phụ 1.1", "Ý phụ 1.2"] 
          },
          { 
            "label": "Nhánh quan trọng 2", 
            "children": ["Ý phụ 2.1", "Ý phụ 2.2"] 
          }
        ] 
      } 
    }
    Lưu ý quan trọng: 
    1. YÊU CẦU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.
    2. Mindmap phải có ít nhất 3-5 nhánh chính (branches), mỗi nhánh có ít nhất 2-3 ý con (children).
    3. Trả về JSON thuần túy, KHÔNG nằm trong khối markdown (\`\`\`json).`;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Data,
                    mimeType: getMimeType(audioBlob)
                }
            },
            { text: prompt }
        ]);

        onProgress(90, 'Hoàn tất trích xuất dữ liệu...');
        const response = await result.response;
        let text = response.text();

        // Clean up potential markdown blocks
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        onProgress(100, 'Xong!');
        return JSON.parse(text);
    } catch (error) {
        if (error.message?.includes('503') && retries > 1) {
            retries--;
            onProgress(50, `Hệ thống bận, đang thử lại lần ${3 - retries}...`);
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
            continue;
        }
        console.error('Gemini Analysis Error:', error);
        throw error;
    }
    }
}

/**
 * Phân tích báo cáo văn bản (Note Analyzer)
 */
export async function analyzeText(textContent, apiKey, modelName = 'gemini-2.5-flash', onProgress = () => { }) {
    let retries = 3;
    let delay = 2000;

    while (retries > 0) {
        try {
        onProgress(10, 'Khởi tạo AI...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
            }
        });

        onProgress(40, 'Đang phân tích nội dung văn bản...');

        const prompt = `Phân tích nội dung ghi chú và trả về JSON chuẩn:
    { 
      "title": "...", 
      "summary": "...", 
      "key_points": [], 
      "progress": 0, 
      "tags": [], 
      "mindmap": { 
        "center": "Chủ đề chính", 
        "branches": [
          { "label": "Nhánh 1", "children": ["Ý con 1.1", "Ý con 1.2"] }
        ] 
      } 
    }
    Nội dung ghi chú: ${textContent}
    Lưu ý quan trọng: 
    1. YÊU CẦU TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.
    2. Mindmap phải có ít nhất 3-5 nhánh chính (branches), mỗi nhánh có ít nhất 2-3 ý con (children).
    3. Trả về JSON thuần túy, KHÔNG nằm trong khối markdown (\`\`\`json).`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        onProgress(100, 'Xong!');
        return {
            ...JSON.parse(text),
            transcript: textContent // For notes, the transcript is the original text
        };
    } catch (error) {
        if (error.message?.includes('503') && retries > 1) {
            retries--;
            onProgress(40, `Hệ thống bận, đang thử lại lần ${3 - retries}...`);
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
            continue;
        }
        console.error('Gemini Text Analysis Error:', error);
        throw error;
    }
    }
}
/**
 * Hỏi đáp AI dựa trên ngữ cảnh cuộc họp
 */
export async function chatWithAI(userMessage, context, history = [], apiKey, modelName = 'gemini-2.5-flash') {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `Bạn là một trợ lý dự án chuyên nghiệp. Hãy trả lời câu hỏi của người dùng dựa trên nội dung báo cáo sau đây. Nếu câu hỏi không liên quan đến nội dung báo cáo, hãy nhẹ nhàng nhắc nhở người dùng. Dưới đây là nội dung báo cáo:\n\n${context}` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Tôi đã hiểu nội dung báo cáo. Tôi sẵn sàng trả lời các câu hỏi của bạn về cuộc họp/ghi chú này bằng tiếng Việt." }],
                },
                ...history
            ],
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Chat Error:', error);
        throw error;
    }
}

import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const LARGE_FILE_THRESHOLD_MB = 5; // Files larger than 5MB use File Upload API
const FILE_UPLOAD_BASE_URL = 'https://generativelanguage.googleapis.com/upload/v1beta/files';
const FILE_STATUS_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const FILE_ACTIVE_POLL_INTERVAL_MS = 1200;
const FILE_ACTIVE_POLL_MAX_ATTEMPTS = 90; // ~108s max wait

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chuyển đổi Blob sang Base64 (dùng cho file nhỏ <5MB)
 */
async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Xác định MIME Type chuẩn từ file/blob
 */
export function getMimeType(file) {
    if (file.type && file.type !== 'application/octet-stream') return file.type;
    const ext = (file.name || '').split('.').pop()?.toLowerCase();
    const mimeMap = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        m4a: 'audio/mp4',
        ogg: 'audio/ogg',
        webm: 'audio/webm',
        flac: 'audio/flac',
        aac: 'audio/aac',
        opus: 'audio/opus',
    };
    return mimeMap[ext] || 'audio/webm';
}

/**
 * Upload file lên Gemini File API (dành cho file lớn ≥5MB).
 * Trả về fileUri đã upload — có thể tái dùng với nhiều API key khác nhau.
 * @param {Blob} blob
 * @param {string} apiKey
 * @param {function} onProgress
 * @returns {Promise<{fileUri: string, mimeType: string}>}
 */
export async function uploadFileToGemini(blob, apiKey, onProgress = () => {}) {
    const mimeType = getMimeType(blob);
    const uploadUrl = `${FILE_UPLOAD_BASE_URL}?key=${apiKey}`;

    onProgress(15, 'Đang tải file âm thanh lên máy chủ AI...');

    const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'X-Goog-Upload-Protocol': 'raw',
            'X-Goog-Upload-Command': 'upload, finalize',
            'X-Goog-Upload-Header-Content-Length': blob.size,
            'X-Goog-Upload-Header-Content-Type': mimeType,
            'Content-Type': mimeType,
        },
        body: blob,
    });

    if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Upload thất bại (${uploadRes.status}): ${errText}`);
    }

    const uploadData = await uploadRes.json();
    const fileUri = uploadData.file?.uri;
    const fileName = uploadData.file?.name;

    if (!fileUri || !fileName) {
        throw new Error('Không nhận được fileUri từ Gemini File API.');
    }

    onProgress(35, 'Đang chờ AI xử lý file...');

    // Poll until ACTIVE
    let attempts = 0;
    let state = 'PROCESSING';
    while (attempts < FILE_ACTIVE_POLL_MAX_ATTEMPTS) {
        const statusRes = await fetch(
            `${FILE_STATUS_BASE_URL}/${fileName}?key=${apiKey}`
        );
        const statusData = await statusRes.json();
        state = statusData.state;

        if (state === 'ACTIVE') break;
        if (state === 'FAILED') throw new Error('AI từ chối xử lý file này. File có thể bị hỏng hoặc định dạng không hỗ trợ.');

        await new Promise(r => setTimeout(r, FILE_ACTIVE_POLL_INTERVAL_MS));
        attempts++;
        onProgress(35 + Math.floor((attempts / FILE_ACTIVE_POLL_MAX_ATTEMPTS) * 15), 'Đang xử lý dữ liệu âm thanh...');
    }

    if (state !== 'ACTIVE') {
        throw new Error(`File upload timeout: Trạng thái vẫn là "${state}" sau ${Math.round(FILE_ACTIVE_POLL_MAX_ATTEMPTS * FILE_ACTIVE_POLL_INTERVAL_MS / 1000)}s.`);
    }

    return { fileUri, mimeType };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT ENGINEERING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prompt tối ưu cho phân tích file âm thanh
 * - Schema-first: súc tích, chỉ nêu đủ thông tin cần thiết
 * - Không có example dài dòng → giảm token → nhanh hơn ~15-25%
 */
const AUDIO_ANALYSIS_SYSTEM_PROMPT = `Bạn là AI chuyên phân tích nội dung ghi âm công việc trong môi trường doanh nghiệp Việt Nam.
QUY TẮC BẮT BUỘC: Chỉ trả về JSON thuần túy. Không markdown, không text ngoài JSON, không giải thích.
Ngôn ngữ: Hoàn toàn tiếng Việt.

SCHEMA (bắt buộc đúng cấu trúc này):
{
  "title": "string ≤ 60 ký tự",
  "summary": "string 2-4 câu",
  "transcript": "string toàn bộ lời thoại",
  "key_points": ["string"],
  "decisions": [{"content": "string", "owner": "string"}],
  "action_items": [{"task": "string", "priority": "high|medium|low", "owner": "string", "deadline": "string", "status": "pending"}],
  "risks": ["string"],
  "progress": 0,
  "tags": ["string"],
  "mindmap": {"center": "string", "branches": [{"label": "string", "children": ["string"]}]}
}
Mindmap: 3-5 nhánh chính, mỗi nhánh 2-3 ý con.
Điền đầy đủ mọi trường, dùng mảng rỗng [] nếu không có dữ liệu.`;

const AUDIO_ANALYSIS_USER_PROMPT = 'Phân tích file ghi âm này. Chỉ trả về JSON theo đúng schema, không thêm bất kỳ văn bản nào khác.';

/**
 * Prompt tối ưu cho phân tích văn bản ghi chú (súc tích)
 */
const TEXT_ANALYSIS_SYSTEM_PROMPT = `Bạn là AI phân tích ghi chú công việc. Chỉ trả về JSON thuần túy (không markdown, không giải thích). Ngôn ngữ: tiếng Việt.
SCHEMA:
{
  "title": "string ≤ 60 ký tự",
  "summary": "string 2-3 câu",
  "key_points": ["string"],
  "progress": 0,
  "tags": ["string"],
  "mindmap": {"center": "string", "branches": [{"label": "string", "children": ["string"]}]}
}
Mindmap: 3-5 nhánh, mỗi nhánh 2-3 con.`;

// ─────────────────────────────────────────────────────────────────────────────
// CORE GENERATION (retry với nhiều key)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Trích xuất JSON từ text AI trả về một cách bền vững.
 * Xử lý các trường hợp: markdown fence, text thừa sau JSON, Unicode escaping.
 */
function extractJSON(raw) {
    // 1. Strip markdown fences
    let text = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

    // 2. Try direct parse first (happy path)
    try {
        return JSON.parse(text);
    } catch (_) { /* fall through */ }

    // 3. Extract first complete JSON object { ... }
    // Find the first '{' and match its closing '}' by counting depth
    const start = text.indexOf('{');
    if (start === -1) throw new SyntaxError('No JSON object found in AI response.');

    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;

    for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\' && inString) { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') depth++;
        if (ch === '}') {
            depth--;
            if (depth === 0) { end = i; break; }
        }
    }

    if (end === -1) throw new SyntaxError('JSON object not closed in AI response.');

    return JSON.parse(text.substring(start, end + 1));
}
async function generateWithRetry({ apiKey, modelName, fileUri, base64Data, mimeType, systemPrompt, userPrompt }) {
    const MAX_BUSY_RETRIES = 2;
    let busyRetries = MAX_BUSY_RETRIES;
    let delay = 1500;

    while (true) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: systemPrompt,
                generationConfig: {
                    temperature: 0.15,
                    responseMimeType: 'application/json',
                },
            });

            const parts = [];
            if (fileUri) {
                parts.push({ fileData: { mimeType, fileUri } });
            } else if (base64Data) {
                parts.push({ inlineData: { data: base64Data, mimeType } });
            }
            parts.push({ text: userPrompt });

            // Set client-side timeout of 90 seconds (90000ms) to prevent infinite hanging
            const signal = AbortSignal.timeout(90000);

            const result = await model.generateContent(parts, { signal });
            const response = await result.response;
            const raw = response.text();

            // Use robust extractor instead of direct JSON.parse
            return extractJSON(raw);
        } catch (error) {
            const msg = (error.message || '').toLowerCase();
            const name = (error.name || '').toLowerCase();

            const isTimeout = name === 'timeouterror' || name === 'aborterror' || msg.includes('timeout') || msg.includes('abort');
            const isQuota   = msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted');
            const isBusy    = msg.includes('503') || msg.includes('overloaded') || msg.includes('unavailable') || isTimeout;
            const isPayload = msg.includes('request_too_large') || msg.includes('payload') ||
                              (msg.includes('400') && (msg.includes('size') || msg.includes('large')));

            // Quota errors — propagate immediately to trigger key rotation
            if (isQuota) throw new Error('QUOTA_EXHAUSTED');

            // Payload too large — propagate to trigger File Upload API fallback
            if (isPayload) throw new Error('FILE_TOO_LARGE_FOR_INLINE');

            // Service busy — retry a few times with backoff
            if (isBusy && busyRetries > 0) {
                busyRetries--;
                await new Promise(r => setTimeout(r, delay));
                delay = Math.round(delay * 1.8);
                continue;
            }

            if (isBusy) throw new Error('SERVICE_BUSY');

            // Any other error — propagate as-is
            throw error;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Phân tích file ghi âm / âm thanh.
 * - File ≤5MB: gửi inline Base64 (nhanh).
 * - File >5MB: upload qua File API trước, sau đó chỉ truyền URI → hỗ trợ file lên đến 2GB / >1 tiếng.
 * - Khi API key lỗi QUOTA: tự động thử lại với key khác mà KHÔNG upload lại file.
 *
 * @param {Blob} audioBlob
 * @param {string} apiKey               - key hiện tại
 * @param {string} modelName
 * @param {function} onProgress
 * @param {string[]|null} fallbackKeys  - danh sách key dự phòng (nếu có)
 * @returns {Promise<object>}
 */
export async function analyzeMeeting(
    audioBlob,
    apiKey,
    modelName = 'gemini-3.5-flash',
    onProgress = () => {},
    fallbackKeys = []
) {
    const fileSizeMB = audioBlob.size / (1024 * 1024);
    let isLargeAudio = fileSizeMB > LARGE_FILE_THRESHOLD_MB;

    onProgress(5, 'Khởi tạo...');

    // ── Bước 1: Chuẩn bị dữ liệu âm thanh ──────────────────────────────────
    let fileUri = null;
    let base64Data = null;
    const mimeType = getMimeType(audioBlob);

    if (!isLargeAudio) {
        onProgress(20, 'Đang chuyển đổi âm thanh...');
        base64Data = await blobToBase64(audioBlob);
    }

    // ── Bước 2: Gọi AI với cơ chế failover key ──────────────────────────────
    const allKeys = [apiKey, ...fallbackKeys.filter(k => k && k !== apiKey)];
    let lastError = null;

    for (let i = 0; i < allKeys.length; i++) {
        const currentKey = allKeys[i];

        try {
            // Nếu là file lớn và chưa được upload cho API key hiện tại (hoặc do key trước bị tạch và phải đổi key)
            if (isLargeAudio && !fileUri) {
                const uploadResult = await uploadFileToGemini(audioBlob, currentKey, onProgress);
                fileUri = uploadResult.fileUri;
            }

            onProgress(45, i > 0 ? `API Key #${i + 1}: AI đang xử lý...` : 'AI đang xử lý...');

            // Simulated progress ticker: slowly fills 50→88% while AI is generating.
            let tickPercent = 50;
            const ticker = setInterval(() => {
                if (tickPercent < 88) {
                    tickPercent++;
                    const msg = i > 0 ? `API Key #${i + 1}: Đang phân tích...` : 'AI đang phân tích nội dung...';
                    onProgress(tickPercent, msg);
                }
            }, 1000);

            try {
                const result = await generateWithRetry({
                    apiKey: currentKey,
                    modelName,
                    fileUri,
                    base64Data,
                    mimeType,
                    systemPrompt: AUDIO_ANALYSIS_SYSTEM_PROMPT,
                    userPrompt: AUDIO_ANALYSIS_USER_PROMPT,
                });

                clearInterval(ticker);
                onProgress(95, 'Hoàn tất phân tích!');
                return result;
            } catch (generateErr) {
                clearInterval(ticker);
                throw generateErr;
            }
        } catch (err) {
            lastError = err;
            const errMsg = (err.message || '').toLowerCase();
            const isQuota = err.message === 'QUOTA_EXHAUSTED';
            const isBusy = err.message === 'SERVICE_BUSY';
            const isPermissionError = errMsg.includes('permission') || errMsg.includes('403') || errMsg.includes('not have');

            const isFailover = isQuota || isBusy || isPermissionError;

            if (isFailover && i < allKeys.length - 1) {
                console.warn(`[Gemini Failover] Key #${i + 1} lỗi (${err.message}), chuyển sang Key #${i + 2}`);
                onProgress(48, `Key #${i + 1} lỗi/hết hạn, đang chuyển sang Key #${i + 2}...`);
                
                // QUAN TRỌNG: Reset fileUri về null để key tiếp theo upload lại file mới của chính nó!
                fileUri = null;
                continue;
            }

            // File quá lớn cho inline → chuyển đổi sang upload
            if (err.message === 'FILE_TOO_LARGE_FOR_INLINE' && !fileUri) {
                onProgress(20, 'File lớn, đang chuyển sang File Upload API...');
                base64Data = null;
                isLargeAudio = true;
                fileUri = null;
                i--;
                continue;
            }

            throw lastError;
        }
    }

    throw lastError || new Error('Tất cả API Key đều thất bại.');
}

/**
 * Phân tích nội dung ghi chú văn bản (không có audio)
 * @param {string} textContent
 * @param {string} apiKey
 * @param {string} modelName
 * @param {function} onProgress
 */
export async function analyzeText(
    textContent,
    apiKey,
    modelName = 'gemini-3.5-flash',
    onProgress = () => {}
) {
    onProgress(10, 'Đang phân tích ghi chú...');

    const userPrompt = `Phân tích ghi chú sau và trả về JSON theo schema. Chỉ trả về JSON:\n\n${textContent}`;

    const result = await generateWithRetry({
        apiKey,
        modelName,
        fileUri: null,
        base64Data: null,
        mimeType: null,
        systemPrompt: TEXT_ANALYSIS_SYSTEM_PROMPT,
        userPrompt,
    });

    onProgress(100, 'Hoàn tất!');
    return {
        ...result,
        transcript: textContent,
    };
}

/**
 * Hỏi đáp AI dựa trên ngữ cảnh báo cáo (Chat mode)
 * @param {string} userMessage
 * @param {string} context       - nội dung báo cáo làm ngữ cảnh
 * @param {Array}  history       - lịch sử chat [{role, parts}]
 * @param {string} apiKey
 * @param {string} modelName
 */
export async function chatWithAI(
    userMessage,
    context,
    history = [],
    apiKey,
    modelName = 'gemini-3.5-flash'
) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: `Bạn là trợ lý dự án chuyên nghiệp. Trả lời hoàn toàn bằng tiếng Việt dựa trên nội dung báo cáo được cung cấp. Nếu câu hỏi nằm ngoài phạm vi báo cáo, hãy lịch sự nhắc người dùng. Nội dung báo cáo:\n\n${context}`,
    });

    const chat = model.startChat({ history });

    const result = await chat.sendMessage(userMessage);
    return (await result.response).text();
}

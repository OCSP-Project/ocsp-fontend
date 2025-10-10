import { createWorker } from 'tesseract.js';

export interface PermitScanResult {
  permitNumber: string;
  floorArea: number;
  numberOfFloors: number;
  buildingType: string;
  address: string;
  owner: string;
  issueDate?: string;
  expiryDate?: string;
  confidence: number;
  warnings: string[];
  rawText: string;
}

export async function scanPermitImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<PermitScanResult> {
  // Create Tesseract worker
  const worker = await createWorker('vie+eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  try {
    // Perform OCR
    const { data } = await worker.recognize(file);
    const rawText = data.text;
    const confidence = data.confidence / 100;

    // Parse the text
    const result = parsePermitText(rawText, confidence);

    return result;
  } finally {
    await worker.terminate();
  }
}

function parsePermitText(text: string, confidence: number): PermitScanResult {
  const warnings: string[] = [];

  // Debug: Log raw text để kiểm tra
  console.log('🔍 Raw OCR text:', text);

  // Extract permit number
  const permitNumber = extractPermitNumber(text);
  if (!permitNumber) warnings.push('Không tìm thấy số giấy phép');

  // Extract floor area
  const floorArea = extractFloorArea(text);
  if (!floorArea || floorArea <= 0) warnings.push('Không trích xuất được diện tích');

  // Extract number of floors
  const numberOfFloors = extractNumberOfFloors(text);
  if (!numberOfFloors || numberOfFloors <= 0) warnings.push('Không trích xuất được số tầng');

  // Extract building type
  const buildingType = extractBuildingType(text, numberOfFloors || 0);

  // Extract address
  const address = extractAddress(text);

  // Extract owner
  const owner = extractOwner(text);

  // Low confidence warning
  if (confidence < 0.7) {
    warnings.push('Độ chính xác OCR thấp. Vui lòng kiểm tra lại');
  }

  // Debug: Log extracted values
  console.log('📊 Extracted values:', {
    permitNumber,
    floorArea,
    numberOfFloors,
    buildingType,
    address,
    owner
  });

  return {
    permitNumber: permitNumber || '',
    floorArea: floorArea || 0,
    numberOfFloors: numberOfFloors || 0,
    buildingType,
    address: address || '',
    owner: owner || '',
    confidence,
    warnings,
    rawText: text,
  };
}

// ═══════════════════ PARSING FUNCTIONS ═══════════════════

function extractPermitNumber(text: string): string | null {
  const patterns = [
    // Chính xác: "Số: CCS2075" hoặc "Số: CCS2075/GPXD-UBND"
    /(?:Số|số)[\s:]*([A-Z]{2,}\d{4}(?:\/[A-Z\-]+)?)/i,
    // "CCS2075/GPXD-UBND"
    /([A-Z]{2,}\d{4}\/[A-Z\-]+)/i,
    // "CCS2075"
    /([A-Z]{2,}\d{4})/i,
    // Chính xác: "Số: 6015/GPXD-UBND"
    /(?:Số|số)[\s:]*(\d+\/[A-Z\-]+)/i,
    // OCR lỗi: "Số: gOA5™ /GPXD-UBND"
    /(?:Số|số)[\s:]*([a-zA-Z0-9™]+\s*\/[A-Z\-]+)/i,
    // "GP-6015-2024"
    /(GP[\-\s]*\d{4}[\-\s]*\d+)/i,
    // "6015/GPXD-UBND"
    /(\d+\/GP[\-\s]*[A-Z]+)/i,
    // Tìm pattern GPXD-UBND
    /([a-zA-Z0-9™\s]+\/GPXD-UBND)/i,
    // Tìm số có GPXD
    /([a-zA-Z0-9™\s]+\/GPXD)/i,
  ];

  console.log('🔍 Testing permit number patterns...');
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = text.match(pattern);
    console.log(`Pattern ${i + 1}:`, pattern, 'Match:', match);
    
    if (match) {
      const result = match[1].trim();
      console.log(`✅ Found permit number: ${result} from "${match[0]}"`);
      return result;
    }
  }
  
  // Fallback: Tìm pattern CCS + số trong toàn bộ text
  console.log('🔍 Fallback: Finding CCS patterns...');
  const ccsMatches = text.match(/(CCS\d{4})/gi);
  if (ccsMatches) {
    console.log('All CCS matches:', ccsMatches);
    const result = ccsMatches[0];
    console.log(`✅ Fallback found permit number: ${result}`);
    return result;
  }
  
  console.log('❌ No permit number found');
  return null;
}

function extractFloorArea(text: string): number | null {
  const patterns = [
    // Chính xác theo giấy phép: "Tổng diện tích sàn xây dựng: 196,53 m²"
    /Tổng\s+diện\s+tích\s+sàn\s+xây\s+dựng[:\s]*(\d+[,\.]?\d*)\s*m[²2]?/i,
    // OCR lỗi: "Tông diện tích sản xây dựng: 196,53 mỂ"
    /Tông\s+diện\s+tích\s+sản\s+xây\s+dựng[:\s]*(\d+[,\.]?\d*)\s*m[Ể2²]?/i,
    // Trường hợp khác: "Tổng diện tích xây dựng"
    /Tổng\s+diện\s+tích\s+xây\s+dựng[:\s]*(\d+[,\.]?\d*)\s*m[²2]?/i,
    // "Diện tích sàn"
    /diện\s*tích\s+sàn[:\s]*(\d+[,\.]?\d*)\s*m[²2]?/i,
    // "Diện tích xây dựng tầng trệt"
    /diện\s*tích\s+xây\s+dựng\s+tầng\s+trệt[:\s]*(\d+[,\.]?\d*)\s*m[²2]?/i,
    // Tổng quát
    /diện\s*tích[:\s]*(\d+[,\.]?\d*)\s*m[²2]/i,
    // Fallback: tìm số có m² hoặc mỂ
    /(\d+[,\.]?\d*)\s*m[²2Ể]/i,
    // Thêm patterns linh hoạt hơn
    /tổng.*?(\d+[,\.]?\d*)\s*m[²2Ể]/i,
    /tông.*?(\d+[,\.]?\d*)\s*m[²2Ể]/i,
    /(\d+[,\.]?\d*)\s*m[²2Ể].*?tổng/i,
    /(\d+[,\.]?\d*)\s*m[²2Ể].*?tông/i,
    // Tìm số lớn nhất có m² (có thể là diện tích)
    /(\d{2,}[,\.]?\d*)\s*m[²2Ể]/i,
  ];

  console.log('🔍 Testing floor area patterns...');
  console.log('Raw text sample:', text.substring(0, 500));
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = text.match(pattern);
    console.log(`Pattern ${i + 1}:`, pattern, 'Match:', match);
    
    if (match) {
      const value = match[1].replace(',', '.');
      const num = parseFloat(value);
      console.log(`✅ Found floor area: ${num} from "${match[0]}"`);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  
  // Fallback: Tìm tất cả số có m², mỂ và chọn số lớn nhất
  console.log('🔍 Fallback: Finding all numbers with m²/mỂ...');
  const allMatches = text.match(/(\d+[,\.]?\d*)\s*m[²2Ể]/gi);
  if (allMatches) {
    console.log('All m²/mỂ matches:', allMatches);
    const numbers = allMatches.map(match => {
      const value = match.replace(/[^\d,\.]/g, '').replace(',', '.');
      return parseFloat(value);
    }).filter(num => !isNaN(num) && num > 0);
    
    if (numbers.length > 0) {
      const maxNumber = Math.max(...numbers);
      console.log(`✅ Fallback found floor area: ${maxNumber} (largest m²/mỂ value)`);
      return maxNumber;
    }
  }
  
  console.log('❌ No floor area found');
  return null;
}

function extractNumberOfFloors(text: string): number | null {
  const patterns = [
    // Chính xác: "Số tầng: 02 tầng + lửng"
    /Số\s+tầng[:\s]*(\d+)\s+tầng/i,
    // OCR lỗi: "Số tắng: 02 ting + lừng"
    /Số\s+tắng[:\s]*(\d+)\s*ting/i,
    /Số\s+tắng[:\s]*(\d+)/i,
    // "Số tầng: 02"
    /Số\s+tầng[:\s]*(\d+)/i,
    // "02 tầng + lửng"
    /(\d+)\s+tầng(?:\s*\+\s*(?:lửng|lững))?/i,
    // OCR lỗi: "02 ting + lừng"
    /(\d+)\s*ting(?:\s*\+\s*(?:lửng|lừng))?/i,
    // Tìm số có "tầng" ở sau
    /(\d+)\s+tầng/i,
    // Tìm số có "ting" ở sau
    /(\d+)\s*ting/i,
    // Thêm patterns linh hoạt hơn
    /tầng[:\s]*(\d+)/i,
    /tắng[:\s]*(\d+)/i,
    /(\d+)\s*tầng/i,
    /(\d+)\s*ting/i,
    // Tìm số có "lửng" hoặc "lững" hoặc "lừng"
    /(\d+).*?(?:lửng|lững|lừng)/i,
  ];

  console.log('🔍 Testing number of floors patterns...');
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = text.match(pattern);
    console.log(`Pattern ${i + 1}:`, pattern, 'Match:', match);
    
    if (match) {
      const num = parseInt(match[1]);
      console.log(`✅ Found number of floors: ${num} from "${match[0]}"`);
      if (!isNaN(num)) return num;
    }
  }
  
  // Fallback: Tìm tất cả số có "tầng", "ting" và chọn số hợp lý nhất
  console.log('🔍 Fallback: Finding all numbers with "tầng"/"ting"...');
  const allMatches = text.match(/(\d+).*?(?:tầng|ting)/gi);
  if (allMatches) {
    console.log('All "tầng"/"ting" matches:', allMatches);
    const numbers = allMatches.map(match => {
      const num = parseInt(match.replace(/[^\d]/g, ''));
      return num;
    }).filter(num => !isNaN(num) && num > 0 && num <= 10); // Số tầng hợp lý từ 1-10
    
    if (numbers.length > 0) {
      const maxNumber = Math.max(...numbers);
      console.log(`✅ Fallback found number of floors: ${maxNumber} (largest reasonable value)`);
      return maxNumber;
    }
  }
  
  console.log('❌ No number of floors found');
  return null;
}

function extractBuildingType(text: string, floors: number): string {
  const hasLung = /lửng|lững/i.test(text);
  const extra = hasLung ? ' + lửng' : '';
  
  if (floors > 0) {
    return `Nhà ${floors} tầng${extra}`;
  }
  
  return 'Nhà ở riêng lẻ';
}

function extractAddress(text: string): string | null {
  const patterns = [
    // "Trên lô đất số 428"
    /Trên\s+lô\s+đất\s+số[:\s]*(\d+[^,\n]*)/i,
    // "Địa chỉ:"
    /địa\s*chỉ[:\s]*(.*?)(?:\n|$)/i,
    // "Dia chỉ:" (OCR lỗi)
    /Dia\s*chỉ[:\s]*(.*?)(?:\n|$)/i,
    // "tại"
    /tại[:\s]*(.*?)(?:\n|$)/i,
    // Tìm địa chỉ có "Hưng Hoa"
    /(.*?Hưng\s+Hoa.*?)(?:\n|$)/i,
    // Tìm địa chỉ có "CCS2075" - đây có thể là số giấy phép, không phải địa chỉ
    /(.*?CCS\d+.*?)(?:\n|$)/i,
  ];

  console.log('🔍 Testing address patterns...');
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = text.match(pattern);
    console.log(`Pattern ${i + 1}:`, pattern, 'Match:', match);
    
    if (match) {
      let address = match[1].trim().replace(/\s+/g, ' ');
      
      // Clean up OCR errors
      address = address.replace(/\\n/g, ' ');
      address = address.replace(/[™]/g, '');
      
      // Stop at next field
      const stopWords = ['chủ đầu tư', 'giấy phép', 'cấp ngày', 'diện tích', 'cấp cho', 'được phép'];
      for (const word of stopWords) {
        const idx = address.toLowerCase().indexOf(word);
        if (idx > 0) address = address.substring(0, idx).trim();
      }
      
      if (address.length > 10) {
        console.log(`✅ Found address: ${address} from "${match[0]}"`);
        return address;
      }
    }
  }
  
  console.log('❌ No address found');
  return null;
}

function extractOwner(text: string): string | null {
  const patterns = [
    // Chính xác: "Cấp cho: Bà NGUYỄN THỊ VÂN ANH"
    /Cấp\s+cho[:\s]*(.*?)(?:\n|$)/i,
    // OCR lỗi: "Cấp cho: Bà NGUYÊN THỊ VÂN ANH"
    /Cấp\s+cho[:\s]*Bà\s+(.*?)(?:\n|$)/i,
    // "Chủ đầu tư:"
    /chủ\s*đầu\s*tư[:\s]*(.*?)(?:\n|$)/i,
    // "Chủ sở hữu:"
    /chủ\s*sở\s*hữu[:\s]*(.*?)(?:\n|$)/i,
    // Tìm "Bà" + tên
    /Bà\s+([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\s]+)/i,
    // Tìm "Ông" + tên
    /Ông\s+([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\s]+)/i,
  ];

  console.log('🔍 Testing owner patterns...');
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = text.match(pattern);
    console.log(`Pattern ${i + 1}:`, pattern, 'Match:', match);
    
    if (match) {
      let owner = match[1].trim().replace(/\s+/g, ' ');
      
      // Clean up OCR errors
      owner = owner.replace(/NGUYÊN/g, 'NGUYỄN');
      owner = owner.replace(/[™]/g, '');
      
      const stopWords = ['địa chỉ', 'giấy phép', 'diện tích', 'cấp cho', 'được phép'];
      for (const word of stopWords) {
        const idx = owner.toLowerCase().indexOf(word);
        if (idx > 0) owner = owner.substring(0, idx).trim();
      }
      
      if (owner.length > 3) {
        console.log(`✅ Found owner: ${owner} from "${match[0]}"`);
        return owner;
      }
    }
  }
  
  console.log('❌ No owner found');
  return null;
}
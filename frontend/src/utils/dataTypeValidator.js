/**
 * Kiểm tra tính hợp lệ của giá trị dựa trên kiểu dữ liệu
 * @param {string} value - Giá trị cần kiểm tra
 * @param {string} dataType - Kiểu dữ liệu
 * @returns {Object} - Kết quả kiểm tra {isValid: boolean, message: string}
 */
export const validateValueByType = (value, dataType) => {
  if (!value || !dataType) {
    return { isValid: false, message: "Giá trị và kiểu dữ liệu không được để trống" };
  }

  try {
    // Kiểm tra mảng
    if (dataType.includes("[]") || dataType.includes("List") || dataType.includes("Array")) {
      // Kiểm tra cú pháp mảng
      if (!value.startsWith("[") || !value.endsWith("]")) {
        return { isValid: false, message: "Mảng phải được bao quanh bởi dấu ngoặc vuông []" };
      }
      
      // Kiểm tra phần tử trong mảng
      const content = value.substring(1, value.length - 1);
      if (content.trim() !== "") {
        const elements = content.split(",").map(e => e.trim());
        
        // Kiểm tra từng phần tử theo kiểu dữ liệu của mảng
        const elementType = dataType.replace("[]", "").replace("List[", "").replace("]", "").replace("Array<", "").replace(">", "");
        for (const element of elements) {
          const elementCheck = validateValueByType(element, elementType);
          if (!elementCheck.isValid) {
            return { isValid: false, message: `Phần tử mảng không hợp lệ: ${elementCheck.message}` };
          }
        }
      }
      
      return { isValid: true, message: "Mảng hợp lệ" };
    }
    
    // Kiểm tra chuỗi
    if (dataType === "String" || dataType === "str" || dataType === "string" || dataType === "char*") {
      // Chuỗi phải được bao quanh bởi dấu ngoặc kép hoặc đơn
      if (!(value.startsWith('"') && value.endsWith('"')) && 
          !(value.startsWith("'") && value.endsWith("'"))) {
        return { isValid: false, message: "Chuỗi phải được bao quanh bởi dấu ngoặc kép hoặc đơn" };
      }
      return { isValid: true, message: "Chuỗi hợp lệ" };
    }
    
    // Kiểm tra số nguyên
    if (dataType === "int" || dataType === "Integer" || dataType === "long" || dataType === "short" || 
        dataType === "byte" || dataType === "Long" || dataType === "number") {
      if (!/^-?\d+$/.test(value)) {
        return { isValid: false, message: "Số nguyên không hợp lệ" };
      }
      return { isValid: true, message: "Số nguyên hợp lệ" };
    }
    
    // Kiểm tra số thực
    if (dataType === "float" || dataType === "double" || dataType === "Float" || dataType === "Double") {
      if (!/^-?\d+(\.\d+)?$/.test(value)) {
        return { isValid: false, message: "Số thực không hợp lệ" };
      }
      return { isValid: true, message: "Số thực hợp lệ" };
    }
    
    // Kiểm tra boolean
    if (dataType === "boolean" || dataType === "Boolean" || dataType === "bool") {
      if (value !== "true" && value !== "false") {
        return { isValid: false, message: "Giá trị boolean phải là 'true' hoặc 'false'" };
      }
      return { isValid: true, message: "Boolean hợp lệ" };
    }
    
    // Kiểm tra object
    if (dataType.includes("Map") || dataType.includes("dict") || dataType === "object") {
      try {
        if (!value.startsWith("{") || !value.endsWith("}")) {
          return { isValid: false, message: "Object phải được bao quanh bởi dấu ngoặc nhọn {}" };
        }
        // Thử parse JSON để kiểm tra cú pháp
        JSON.parse(value);
        return { isValid: true, message: "Object hợp lệ" };
      } catch (e) {
        return { isValid: false, message: "Object không hợp lệ: " + e.message };
      }
    }
    
    // Mặc định cho các kiểu dữ liệu khác
    return { isValid: true, message: "Giá trị hợp lệ" };
    
  } catch (error) {
    return { isValid: false, message: `Lỗi kiểm tra: ${error.message}` };
  }
};

/**
 * Tạo giá trị mẫu dựa trên kiểu dữ liệu
 * @param {string} dataType - Kiểu dữ liệu
 * @returns {string} - Giá trị mẫu
 */
export const getExampleValueByType = (dataType) => {
  if (!dataType) return "";
  
  // Mảng
  if (dataType.includes("[]") || dataType.includes("List") || dataType.includes("Array")) {
    const elementType = dataType.replace("[]", "").replace("List[", "").replace("]", "").replace("Array<", "").replace(">", "");
    return `[${getExampleValueByType(elementType)}, ${getExampleValueByType(elementType)}]`;
  }
  
  // Chuỗi
  if (dataType === "String" || dataType === "str" || dataType === "string" || dataType === "char*") {
    return '"example"';
  }
  
  // Số nguyên
  if (dataType === "int" || dataType === "Integer" || dataType === "long" || dataType === "short" || 
      dataType === "byte" || dataType === "Long" || dataType === "number") {
    return "42";
  }
  
  // Số thực
  if (dataType === "float" || dataType === "double" || dataType === "Float" || dataType === "Double") {
    return "3.14";
  }
  
  // Boolean
  if (dataType === "boolean" || dataType === "Boolean" || dataType === "bool") {
    return "true";
  }
  
  // Object
  if (dataType.includes("Map") || dataType.includes("dict") || dataType === "object") {
    return '{"key": "value"}';
  }
  
  // Mặc định
  return "";
};
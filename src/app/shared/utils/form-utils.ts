export function toFormData(obj: Record<string, any>): FormData {
    const formData = new FormData();
  
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    }
  
    return formData;
  }
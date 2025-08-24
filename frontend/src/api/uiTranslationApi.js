import api from "./config";

export const getUITranslations = async (lang = "en") => {
  try {
    console.log(
      "API call: http://localhost:8080/api/ui-translations?lang=" + lang
    );
    const response = await api.get(
      `http://localhost:8080/api/ui-translations?lang=${lang}`
    );
    console.log("API response:", response);
    console.log("API response data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch UI translations:", error);
    console.error("Error details:", error.response?.data || error.message);
    throw error;
  }
};

export const getAvailableUILanguages = async () => {
  try {
    const response = await api.get(
      "http://localhost:8080/api/ui-translations/languages"
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch available languages:", error);
    // Fallback to default languages
    return ["en", "vi"];
  }
};

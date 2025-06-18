import axios from "axios";

const API_URL = "http://localhost:8080/api/problems";

export const getProblems = async (language = "en") => {
  const response = await axios.get(API_URL, {
    params: { language },
  });
  return response.data;
};

export const getProblemById = async (id, language = "en") => {
  const response = await axios.get(`${API_URL}/${id}/translate`, {
    params: { language },
  });
  return response.data;
};

export const getProblemByIdOriginal = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Translation management APIs (Admin only)
export const getAvailableLanguages = async () => {
  const response = await axios.get(`${API_URL}/translations/languages`);
  return response.data;
};

export const getTranslation = async (problemId, language) => {
  const response = await axios.get(
    `${API_URL}/${problemId}/translations/${language}`
  );
  return response.data;
};

export const createOrUpdateTranslation = async (problemId, language) => {
  const response = await axios.post(
    `${API_URL}/${problemId}/translations/${language}`
  );
  return response.data;
};

export const deleteTranslation = async (problemId, language) => {
  const response = await axios.delete(
    `${API_URL}/${problemId}/translations/${language}`
  );
  return response.data;
};

export const batchTranslateProblems = async (language, problemIds = null) => {
  const params = { language };
  if (problemIds && problemIds.length > 0) {
    params.problemIds = problemIds.join(",");
  }

  const response = await axios.post(`${API_URL}/translations/batch`, null, {
    params,
  });
  return response.data;
};

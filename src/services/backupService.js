import apiService from "./apiService";

const BACKUP_ENDPOINT = "/api/admin/backup";
const RESTORE_ENDPOINT = "/api/admin/restore";

export const getBackups = async () => {
  try {
    return await apiService.getAll(`${BACKUP_ENDPOINT}/`);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createBackup = async () => {
  try {
    return await apiService.create(BACKUP_ENDPOINT, {});
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const restoreBackup = async (filename) => {
  try {
    return await apiService.create(RESTORE_ENDPOINT, { filename });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

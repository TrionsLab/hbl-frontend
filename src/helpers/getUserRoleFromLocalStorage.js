export const getUserRoleFromLocalStorage = () => {
  try {
    const storedUser = localStorage.getItem("userInfo");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error("Error parsing userInfo from localStorage", err);
    return null;
  }
};

export const getUserRoles = (user) => {
  if (!user || !user.profile || !user.profile.roles) return [];

  return user.profile.roles.split(",");
};

export const isSchoolOwner = (userRoles) => {
  return userRoles.includes("school-owner");
};

export const isSchoolTeacher = (userRoles) => {
  return userRoles.includes("school-teacher");
};

export const isSchoolStudent = (userRoles) => {
  return userRoles.includes("school-student");
};

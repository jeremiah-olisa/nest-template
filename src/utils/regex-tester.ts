const isStrongPassword = (password: string) => {
  const strongPassword = new RegExp(
    '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})',
  );
  return strongPassword.test(password);
};

const isMobilePhone = (phone: string) => {
  const regExp = new RegExp('^+[1-9][0-9s.-]{7,14}$');
  return regExp.test(phone);
};

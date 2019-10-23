import * as Yup from 'yup';

const name = Yup.string().max(
  200,
  'Name has a maximum limit of 200 characters'
);
const email = Yup.string().max(
  100,
  'E-mail has a maximum limit of 100 characters'
);
const password = Yup.string()
  .min(6, 'Password must be at least 6 characters.')
  .max(25, 'Password must be a maximum limit of 25 characters.');

const oldPassword = password;

const confirmPassword = password.when('password', (pass, field) =>
  pass
    ? field
        .required('Please confirm your password.')
        .oneOf([Yup.ref('password')], 'Passwords is not the same.')
    : field
);

export const storeSchema = Yup.object().shape({
  name: name.required('Name is required.'),
  email: email.required('E-mail is required.'),
  password: password.required('Password is required.')
});

export const updateSchema = Yup.object().shape({
  name,
  email,
  oldPassword,
  password: password.when('oldPassword', (oldPass, field) =>
    oldPass ? field.required('The new password is required') : field
  ),
  confirmPassword
});

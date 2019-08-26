import * as Yup from 'yup';

const name = Yup.string().max(
  200,
  'Nome possui limite máximo de 200 caracteres'
);
const email = Yup.string().max(
  100,
  'E-mail possui limite máximo de 100 caracteres'
);
const password = Yup.string()
  .min(6, 'Senha deve ter no mínimo 6 caracteres.')
  .max(25, 'Senha deve ter no máximo 25 caracteres.');

const oldPassword = password;

const confirmPassword = password.when('password', (pass, field) =>
  pass
    ? field
        .required('Por favor confirme sua senha')
        .oneOf([Yup.ref('password')], 'As senhas não são iguais.')
    : field
);

export const storeSchema = Yup.object().shape({
  name: name.required('Nome é obrigatório.'),
  email: email.required('E-mail é obrigatório.'),
  password: password.required('A senha é obrigatória')
});

export const updateSchema = Yup.object().shape({
  name,
  email,
  oldPassword,
  password: password.when('oldPassword', (oldPass, field) =>
    oldPass ? field.required('A nova senha é obrigatória') : field
  ),
  confirmPassword
});

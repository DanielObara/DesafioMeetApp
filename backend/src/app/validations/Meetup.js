import * as Yup from 'yup';

// Regras de validações de campo
const title = Yup.string().max(
  100,
  'Title has a maximum limit of 100 characters'
);

const description = Yup.string().max(
  500,
  'Description has a maximum limit of 500 characters'
);

const location = Yup.string().max(
  150,
  'Localization has a maximum limit of 150 150 characters.'
);
const date = Yup.date('Oops.. Its a invalid Date.');
const banner_id = Yup.number();
const subscribers = Yup.array(
  Yup.number('Subscribers must be an array of IDs.')
);

export const storeSchema = Yup.object().shape({
  title: title.required('Oops.. The title cannot be empty.'),
  description: description.required('Oops.. The description cannot be empty.'),
  location: location.required('Oops.. The localization cannot be empty.'),
  date: date.required('Oops.. The date cannot be empty.'),
  banner_id: banner_id.required('Oops.. The image cannot be empty.')
});

export const updateSchema = Yup.object().shape({
  title: title.required('Oops.. The title cannot be empty.'),
  description: description.required('Oops.. The description cannot be empty.'),
  location: location.required('Oops.. The localization cannot be empty.'),
  date: date.required('Oops.. The date cannot be empty.'),
  banner_id: banner_id.required('Oops.. The image cannot be empty.'),
  subscribers
});

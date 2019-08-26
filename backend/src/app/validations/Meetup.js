import * as Yup from 'yup';

// Regras de validações de campo
const title = Yup.string().max(
  100,
  'Título possui limite máximo de 100 caracteres'
);

const description = Yup.string().max(
  500,
  'Descrição possui limite máximo de 500 caracteres.'
);

const location = Yup.string().max(
  150,
  'Localização possui limite máximo de 150 caracteres.'
);
const date = Yup.date('Oops.. A Data é inválida.');
const banner_id = Yup.number();
const subscribers = Yup.array(
  Yup.number('Os Inscritos deve ser um array de IDs')
);

export const storeSchema = Yup.object().shape({
  title: title.required('Oops.. O título não pode ser vazio.'),
  description: description.required('Oops.. A descrição não pode ser vazia.'),
  location: location.required('Oops.. A localização não pode ser vazia.'),
  date: date.required('Oops.. A título não pode ser vazia.'),
  banner_id: banner_id.required('Oops.. A imagem não pode ser vazia.')
});

export const updateSchema = Yup.object().shape({
  title: title.required('Oops.. O título não pode ser vazio.'),
  description: description.required('Oops.. A descrição não pode ser vazia.'),
  location: location.required('Oops.. A localização não pode ser vazia.'),
  date: date.required('Oops.. A título não pode ser vazia.'),
  banner_id: banner_id.required('Oops.. A imagem não pode ser vazia.'),
  subscribers
});

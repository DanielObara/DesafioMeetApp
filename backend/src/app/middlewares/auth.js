import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ error: 'Oops.. Token não informado' });

  // Retorna um array
  // com o Bearer na primeira posição do array
  // token na segunda posição. Como só precisamos do token descartamos o bearer
  // utilizando a virgula eu descarto a primeira posição
  const [, token] = authHeader.split(' ');

  try {
    // Podemos usar o jwt.verify porém ele utiliza callback
    // Para poder saber quando termina a função utilizamos o promisify
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Oops.. Token inválido' });
  }
};

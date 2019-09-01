import React, { useState, useEffect, useRef } from 'react';
import { useStore } from 'react-redux';
import { useField } from '@rocketseat/unform';
import { toast } from 'react-toastify';

import api from '~/services/api';
import { getError } from '~/util/errorHandler';

import adorable from '~/services/adorable';

import { Container } from './styles';

export default function AvatarInput() {
  const { defaultValue, registerField } = useField('avatar');
  const fullName = useStore(state => state.user.profile.name);

  const [file, setFile] = useState(defaultValue && defaultValue.id);
  const [preview, setPreview] = useState(defaultValue && defaultValue.url);

  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      registerField({
        name: 'avatar_id',
        ref: ref.current,
        path: 'dataset.file',
      });
    }
  }, [ref, registerField]);

  async function handleChange(e) {
    const data = new FormData();

    data.append('file', e.target.files[0]); // Gets only the first file
    data.append('type', 'avatar');

    try {
      const response = await api.post('files', data);

      const { id, url } = response.data;

      setFile(id);
      setPreview(url);
    } catch (err) {
      toast.error(getError(err) || 'Whoops! Internal server error.');
    }
  }

  return (
    <Container>
      <label htmlFor="avatar">
        <img src={preview || adorable(fullName)} alt={fullName} />

        <input
          type="file"
          id="avatar"
          accept="image/*"
          data-file={file}
          onChange={handleChange}
          ref={ref}
        />
      </label>
    </Container>
  );
}

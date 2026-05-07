import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useCreateRequest } from '../../hooks/useDsar';
import { REQUEST_TYPES } from '../../types';
import type { CreateRequestPayload } from '../../types';

const initial: CreateRequestPayload = {
  dataSubjectName: '',
  dataSubjectEmail: '',
  requestType: 'ACCESS',
  details: '',
  dueDate: '',
};

export function RequestForm() {
  const [form, setForm] = useState<CreateRequestPayload>(initial);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateRequest();

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setForm(initial);
    setError(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        ...form,
        dueDate: form.dueDate || null,
      });
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create request');
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid">
      <div className="field">
        <label htmlFor="dataSubjectName">Data subject name</label>
        <input
          id="dataSubjectName"
          name="dataSubjectName"
          value={form.dataSubjectName}
          onChange={onChange}
          placeholder="Jane Doe"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="dataSubjectEmail">Email</label>
        <input
          id="dataSubjectEmail"
          name="dataSubjectEmail"
          type="email"
          value={form.dataSubjectEmail}
          onChange={onChange}
          placeholder="jane.doe@example.com"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="requestType">Request type</label>
        <select
          id="requestType"
          name="requestType"
          value={form.requestType}
          onChange={onChange}
        >
          {REQUEST_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="dueDate">Due date</label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={form.dueDate ?? ''}
          onChange={onChange}
        />
      </div>
      <div className="field">
        <label htmlFor="details">Context</label>
        <textarea
          id="details"
          name="details"
          value={form.details}
          onChange={onChange}
          placeholder="Summarize the request and any initial details"
          required
        />
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="button-row">
        <button className="primary" type="submit" disabled={create.isPending}>
          {create.isPending ? 'Submitting…' : 'Create request'}
        </button>
        <button
          className="secondary"
          type="button"
          onClick={reset}
          disabled={create.isPending}
        >
          Reset
        </button>
      </div>
    </form>
  );
}

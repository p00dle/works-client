import * as React from 'react';
import { usePasswordReset, useUserData } from '~/queries/user';
import { Button } from '~/components/_common/Button';
import { Form, Input } from '~/components/_common/Form';
import { Section } from '~/components/_common/Section';


const PasswordResetForm: React.FC = function PasswordResetForm() {
  const userdata = useUserData();
  const passwordReset = usePasswordReset();
  return (
    <Section title="PASSWORD RESET" className="p-4 w-96 h-96">
      {userdata.data 
        ? <Form onSubmit={vals => passwordReset.mutate(vals)} >
            <Input prop="username" type="hidden" initialValue={userdata.data.username} />
            <Input prop="oldPassword" type="password" />
            <Input prop="password" label="NEW PASSWORD" type="password" />
            <Input prop="password2" label="REPEAT PASSWORD" type="password" />
            <Input type="submit" />
          </Form>
        : null
      }
    </Section>
  )
}

export const Account: React.FC = function Account() {
  return (
    <div className="grid grid-cols-3">
      <PasswordResetForm />
    </div>
  );
}
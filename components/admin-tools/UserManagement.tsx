import * as React from 'react';
import { useEffect } from 'react';
import { useCreateUser, useRemoveUser, useUpdateUser, useUsers } from '~/queries/user';
import { Button } from '~/components/_common/Button';
import { Form, Input } from '~/components/_common/Form';
import { Icon } from '~/components/_common/Icon';
import { useModal } from '~/components/layout/Modal';
import { Section } from '~/components/_common/Section';
import { Table, TableColumns } from '~/components/_common/Table';
import { format } from '~/lib/format';
import { User, userRoles } from '~/types/user';
import { useConfirmModal } from '~/components/_common/ConfirmModal';
import { useInfoModal } from '~/components/_common/InfoModal';


const EditUserModal: React.FC<{props: User}> = function EditUserModal({props: user}) {
  const updateUser = useUpdateUser();
  const showInfoModal = useInfoModal();
  function onSubmit(user: User) {
    updateUser.mutate(user, {
      onSuccess: () => showInfoModal({type: 'success', text: `User ${user.username} updated successfully`}),
      onError: (error) => showInfoModal({type: 'error', text: `Error updating user ${user.username}: ${String(error)}`})
    })
  }
  return (
    <div className="p-4">
      <Form onSubmit={onSubmit} >
        <Input type="string" readOnly prop="username" initialValue={user.username} />
        <Input type="string" prop="fullName" initialValue={user.fullName} />
        <Input type="enum" values={userRoles} prop="role" initialValue={user.role} />
        <Input type="string" prop="managerId" initialValue={user.managerId} />
        <Input type="email" prop="email" initialValue={user.email} />
        <Input type="submit" />
      </Form>
    </div>
  );
}

const EditUser: React.FC<{user: User}> = function EditUser({user}) {
  const openModal = useModal('EDIT USER', EditUserModal, user)
  return <Button onClick={openModal} className="text-sm">
    <Icon icon="edit" />
  </Button>
}

const DeleteUser: React.FC<{user: User}> = function DeleteUser({user}) {
  const removeUser = useRemoveUser();
  const showInfoModal = useInfoModal();
  const openModal = useConfirmModal(`Are you sure you want to remove user ${user.username}?`, () => {
    removeUser.mutate({username: user.username}, {
      onSuccess: () => showInfoModal({type: 'success', text: `User ${user.username} removed successfully`}),
      onError: (error) => showInfoModal({type: 'error', text: `Error deleting user ${user.username}: ${String(error)}`})
    });
  });
  return <Button onClick={openModal} className="text-sm">
    <Icon icon="trash-alt" />
  </Button>
}

export const UserManagement: React.FC = function UserManagement() {
  const usersState = useUsers();
  const createUser = useCreateUser();
  const tableColumns: TableColumns<User> = [
    {prop: 'username', header: 'ID', filter: 'search' },
    {prop: 'fullName', header: 'FULL NAME', filter: 'search' },
    {prop: 'role', header: 'ROLE', filter: 'select' },
    {prop: 'managerId', header: 'MANAGER ID', filter: 'search' },
    {prop: 'email', header: 'EMAIL', filter: 'search' },
    {prop: 'lastLogin', header: 'LAST LOGIN', sort: true, filter: 'date', format: format.number.asDateTime },
    {header: 'EDIT', row: (user) => <EditUser user={user} /> },
    {header: 'REMOVE', row: (user) => <DeleteUser user={user} /> }
  ];
  return (
    <div className="space-y-4 px-4 pb-8">
      <Section title="USERS" className="p-4">
        {usersState.data ? <Table data={usersState.data} columns={tableColumns} /> : null }
      </Section>
      <Section title="CREATE" sectionClassName="w-96" className="p-4">
        <Form onSubmit={(user: User) => createUser.mutate(user)}>
          <Input type="string" prop="username" />
          <Input type="enum" prop="role" values={userRoles} />
          <Input type="email" prop="email" />
          <Input type="string" prop="fullName" />
          <Input type="string" prop="managerId" />
          <Input type="submit" />
        </Form>
      </Section>
    </div>
  );
}
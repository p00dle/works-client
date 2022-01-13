import { useMutation, useQuery, useQueryClient  } from 'react-query';
import { api } from '~/bootstrap/api';
import { User } from '../types/user';

export function useUserData() {
  return useQuery('userdata', api.factory('GET', '/users/userdata') as unknown as () => User);
}

export function useUsers() {
  return useQuery('users', api.factory('GET', '/users') as unknown as () => User[]);
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation((user: User) => api.request('POST', '/users/create', void 0, user), {
    onSuccess: () => queryClient.invalidateQueries('users')
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation((user: User) => api.request('POST', '/users/update', void 0, user), {
    onSuccess: () => queryClient.invalidateQueries('users')
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();
  return useMutation((query: {username: string}) => api.request('POST', '/users/delete', query), {
    onSuccess: () => queryClient.invalidateQueries('users')
  });
}

export function usePasswordReset() {
  const queryClient = useQueryClient();
  return useMutation((data: {username: string, oldPassword: string, password: string, password2: string}) => api.request('POST', '/account/password-reset-authenticated', void 0, data))
}
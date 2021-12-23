import { navFactory } from '~/lib/nav-item'
import { AllRoutes } from '~/bootstrap/router'
import { Navigation } from '../types/nav';

const nav = navFactory<AllRoutes>()

const commonNavItems = [
  nav({
    name: 'HOME',
    route: '/home',
    icon: 'home',
  }),
]

const adminNavItems = [
  nav({
    name: 'ADMIN TOOLS',
    subMenu: [
      nav({
        name: 'UPLOAD',
        route: '/upload',
      }),
      nav({
        name: 'USERS',
        route: '/user-management',
      }),
    ],
    icon: 'cog',
  })
];

export const navigation: Navigation<AllRoutes> = {
  'admin': [
    ...commonNavItems,
    ...adminNavItems
  ],
  'non-admin': [
    ...commonNavItems,
  ]
}
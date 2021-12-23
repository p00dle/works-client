import { NavItem, NavItemFactory } from '../types/nav';
import { Routes } from '../types/router';

export const navFactory: NavItemFactory = <T extends Routes>() => (navItem: NavItem<T, keyof T>) => navItem;

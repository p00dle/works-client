import * as React from 'react';
import { useReducer, useEffect } from 'react';
import { navigation } from '~/bootstrap/nav';
import { useRouter } from '~/bootstrap/router';
import { useUserData } from '~/queries/user';
import { NavItem } from '~/types/nav';
import { User } from '~/types/user';
import { Link } from '~/components/_common/Link';
import { Icon } from '~/components/_common/Icon';
import { WithClassName } from '~/types/react';

interface NavLinkProps extends NavItem<any, any> {
  isExpanded: boolean;
  isSelected: boolean;
  subMenu?: NavLinkProps[];
}


type NavAction = 
  | { type: 'update-route', payload: { route: string } }
  | { type: 'toggle-expand', payload: { name: string } }
  | { type: 'set-navigation', payload: { navitems: NavItem<any, any>[] }}
;

function selectNavLink(navLinks: NavLinkProps[], route: string): [NavLinkProps[], boolean] {

  let selected = false; 
  const updatedNavLinks = navLinks.map(navLink => {
    if (navLink.subMenu) {
      const [subMenu, childSelected] = selectNavLink(navLink.subMenu, route);
      selected = childSelected;
      return {...navLink, subMenu, isExpanded: childSelected || navLink.isExpanded }
    } else { 
      const isSelected = navLink.route === route;
      if (isSelected) selected = true;
      return {...navLink, isSelected }
    }
  });
  return [updatedNavLinks, selected];
}

function mapNavItems(navItems: NavItem<any, any>[]): NavLinkProps[] {
  return navItems.map(navItem => {
    if (navItem.subMenu) {
      return {...navItem, subMenu: mapNavItems(navItem.subMenu), isExpanded: false, isSelected: false }
    } else {
      return {...navItem, isExpanded: false, isSelected: false, subMenu: undefined }
    }
  })
}

function setNavigation(navItems: NavItem<any, any>[], route: string): NavLinkProps[] {
  const navLinks = mapNavItems(navItems);
  const [updatedNavLinks] = selectNavLink(navLinks, route);
  return updatedNavLinks;
}

function toggleExpand(navLinks: NavLinkProps[], name: string): [NavLinkProps[], boolean] {
  let navLinkFound = false;
  const updatedNavLinks = navLinks.map(navLink => {
    if (navLinkFound) {
      return {...navLink};
    } else if (navLink.name === name) {
      navLinkFound = true;
      return {...navLink, isExpanded: !navLink.isExpanded };
    } else if (navLink.subMenu) {
      const [subMenu,childFound] = toggleExpand(navLink.subMenu, name);
      if (childFound) {
        navLinkFound = true;
      }
      return {...navLink, subMenu };
    }
    return {...navLink};
  });
  return [updatedNavLinks, navLinkFound];
}

function navReducer(state: {navLinks: NavLinkProps[], route: string}, action: NavAction): {navLinks: NavLinkProps[], route: string} {
  switch(action.type) {
    case 'update-route': {
      const route = action.payload.route;
      const [navLinks] = selectNavLink(state.navLinks, route);
      return { route, navLinks };
    }
    case 'toggle-expand': {
      const [navLinks] = toggleExpand(state.navLinks, action.payload.name);
      return { route: state.route, navLinks };
    }
    case 'set-navigation': {
      const navLinks = setNavigation(action.payload.navitems, state.route);
      return { navLinks, route: state.route }
    }
    default:
      return state;
  }
}

const navLinkClass = "transition-all h-12 text-lg border-t-2 border-t-emerald-600 grid grid-cols-[2rem_1fr_1rem] px-2 items-center hover:bg-emerald-600 dark:hover:bg-slate-500 "

const depth0NavLinkClass = "last:border-b-2 last:border-b-emerald-600"

const selectedNavLinkClass = "text-white bg-emerald-500 dark:text-emerald-300 dark:bg-slate-600"

const NavLink: React.FC<NavLinkProps & { toggleExpand: (name: string) => void, depth?: number }> = function NavLink({ name, route, routeParams, icon, subMenu, isExpanded, isSelected, toggleExpand, depth = 0 }) {
  if (route) {
    return (
      <li className={depth ? '' : depth0NavLinkClass}>
        <Link route={route} params={routeParams} className={navLinkClass + (isSelected ? selectedNavLinkClass : '')} >
          {icon ? <Icon icon={icon} className="text-2xl w-10" /> : <div />}
          <span>{name}</span>
        </Link>
      </li>
    );
  } else if (Array.isArray(subMenu)) {
    return (
      <li className={depth ? '' : depth0NavLinkClass}>
        <div onClick={() => toggleExpand(name)} className={navLinkClass + "cursor-pointer"}>
          {icon ? <Icon icon={icon} className="text-2xl w-10" /> : <div /> }
          <span>{name}</span>
          <span className="">{isExpanded ? '\u25BC' : '\u25B2'}</span>
        </div>
        <ul>
            {isExpanded ? subMenu.map(navLink => <NavLink {...navLink} key={navLink.name} toggleExpand={toggleExpand} depth={depth + 1} />) : null}
        </ul>
      </li>
    )
  }
  return null;
}

export const Nav: React.FC<WithClassName> = function Nav({className = ''}) {
  const userState = useUserData() as { data: User | null};
  const { route } = useRouter();
  const [navState, dispatch] = useReducer(navReducer, {navLinks: [], route});
  useEffect(() => {
    if (!userState.data) return;
    dispatch({type: 'set-navigation', payload: {navitems: navigation[userState.data.role]}});
  }, [userState?.data?.role]);
  useEffect(() => {
    if (!userState.data) return;
    dispatch({type: 'update-route', payload: { route }});
  }, [route]);

  function toggleExpand(name: string) {
    dispatch({type: 'toggle-expand', payload: { name } });
  }
  return (
    <nav>
      <ul className={"select-none" + " " + className}>
        {navState.navLinks.map(navLink => <NavLink {...navLink} key={navLink.name} toggleExpand={() => toggleExpand(navLink.name)} />)}
      </ul>
    </nav>
  );
}
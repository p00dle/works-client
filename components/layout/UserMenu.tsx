import * as React from 'react';
import { Link } from '~/components/_common/Link';
import { useHideOnClickOutside } from '~/lib/react-utils';
import { Icon } from '~/components/_common/Icon';
import { useUserData } from '~/queries/user';
import { Button } from '~/components/_common/Button';


export const UserMenu: React.FC = function UserMenu() {
  const userState = useUserData();
  const { shouldShow, show, hide, ref } =  useHideOnClickOutside();
  const user = userState.data || { role: '', fullName: '' };
  return (
    <div ref={ref}>
      <div className="rounded-full sidebar text-3xl h-12 w-12 flex items-center justify-center cursor-pointer hover:bg-emerald-600 transition-all" onClick={show}><Icon icon="user" /></div>
      <dialog className={"z-[3] absolute left-[calc(100vw_-_21rem)] top-20 border-2 secondary rounded-lg w-[20rem] m-0 " + (shouldShow ? "block" : "hidden")}>
        <div className="flex flex-row-reverse text-xl pr-2 pt-1 cursor-pointer"><div onClick={hide}>&#10006;</div></div>
        <div className="flex">
          <div className="flex flex-col grow pl-4 pb-4 space-y-2">
            <div className="">
              <div className="rounded-full w-24 h-24 bg-slate-400 text-6xl flex items-center justify-center">
                <Icon icon="user" />
              </div>
            </div>
            <div>{user.fullName}</div>
            <div className="text-slate-600">{user.role}</div>
          </div>
          <div className="flex flex-col space-y-4 pt-4 pr-2">
            <Button ><Link route="/account" onClick={hide} >Account</Link></Button>
            <Button ><a href="/api/account/logout">Logout</a></Button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

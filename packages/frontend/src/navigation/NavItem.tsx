import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';

interface NavProps {
  icon?: IconProp;
  description: string;
  to: string;
}

const NavItem = ({ icon, description, to }: NavProps): JSX.Element => {
  return (
    <NavLink
      to={to}
      className={(isActive): string =>
        `relative px-4 py-1 cursor-pointer no-underline flex items-center text-black ${
          isActive ? ' bg-gray-200' : ' hover:bg-gray-100'
        }`
      }
      id={to.substring(1) + '-nav-button'}
    >
      {icon && (
        <div className="inline-block w-8 text-center">
          <FontAwesomeIcon icon={icon} size="1x" className="inline-block" />
        </div>
      )}
      <div className="flex-auto inline-block my-1">
        <span>{description}</span>
      </div>
    </NavLink>
  );
};

export default NavItem;

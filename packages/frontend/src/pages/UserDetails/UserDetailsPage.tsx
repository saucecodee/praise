import { shortenEthAddress } from 'api/dist/user/utils/core';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { useRecoilValue } from 'recoil';
import { useParams } from 'react-router-dom';
import { UserDto, UserRole } from 'api/dist/user/types';
import { toast } from 'react-hot-toast';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { SingleUser, SingleUserParams, useAdminUsers } from '@/model/users';
import { DATE_FORMAT, formatIsoDateUTC } from '@/utils/date';
import { classNames } from '@/utils/index';
import { BackLink } from '@/navigation/BackLink';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';

const roles = [UserRole.ADMIN, UserRole.FORWARDER, UserRole.QUANTIFIER];

const UserDetailsPage = (): JSX.Element | null => {
  const { userId } = useParams<SingleUserParams>();
  const user = useRecoilValue(SingleUser(userId));
  const { addRole, removeRole } = useAdminUsers();

  const handleRole = async (role: UserRole, user: UserDto): Promise<void> => {
    let resp;
    const isRemove = user.roles.includes(role);
    if (isRemove) {
      resp = await removeRole(user._id, role);
    } else {
      resp = await addRole(user._id, role);
    }
    if (resp?.status === 200) {
      toast.success(`Role ${isRemove ? 'removed' : 'added'} successfully!`);
    }
  };

  if (!user) return null;

  return (
    <Page>
      <BreadCrumb name="User details" icon={faUserGroup} />
      <BackLink />
      <Box className="flex flex-col gap-2 mb-5">
        <span>User identity</span>
        <h2>
          {user.ethereumAddress && shortenEthAddress(user.ethereumAddress)}
        </h2>
        <div>
          Created: {formatIsoDateUTC(user.createdAt, DATE_FORMAT)}
          <br />
          Last updated: {formatIsoDateUTC(user.updatedAt, DATE_FORMAT)}
        </div>
      </Box>
      <Box className="flex flex-col gap-2 mb-5">
        <span>Linked Discord identity</span>
        {user?.accounts?.map((account) => (
          <>
            <h2>{account.name}</h2>
            <div>
              Discord User ID: {account.user}
              <br />
              Created: {formatIsoDateUTC(account.createdAt, DATE_FORMAT)}
              <br />
              Last updated: {formatIsoDateUTC(account.updatedAt, DATE_FORMAT)}
            </div>
          </>
        ))}
      </Box>
      <Box>
        <h2>Roles</h2>
        <div className="flex flex-wrap gap-4 pt-5">
          {roles.map((role) => (
            <div
              key={role}
              className={classNames(
                'flex gap-2 justify-center items-center py-2 px-3 rounded-md cursor-pointer bg-themecolor-alt-2',
                user.roles.includes(role) ? '' : 'opacity-50'
              )}
              onClick={(): void => void handleRole(role, user)}
            >
              <input
                checked={user.roles.includes(role)}
                className="cursor-pointer"
                name={role}
                type="checkbox"
                readOnly
              />
              <label className="text-white cursor-pointer" htmlFor={role}>
                {role}
              </label>
            </div>
          ))}
        </div>
      </Box>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default UserDetailsPage;

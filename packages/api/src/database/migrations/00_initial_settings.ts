import { SettingsModel } from '../../settings/entities';

const settings = [
  {
    key: 'NAME',
    value: 'Praise',
    type: 'String',
  },
  {
    key: 'DESCRIPTION',
    value:
      'Praise community contributions, build a culture of giving and gratitude.',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    value: 3,
    type: 'Number',
  },
  {
    key: 'PRAISE_PER_QUANTIFIER',
    value: 50,
    type: 'Number',
  },
  {
    key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    value: false,
    type: 'Boolean',
  },
  {
    key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    value: 0.1,
    type: 'Number',
  },
  {
    key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
    value: '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
    type: 'List',
  },
  {
    key: 'PRAISE_GIVER_ROLE_ID',
    value: '0',
    type: 'String',
  },
  {
    key: 'PRAISE_SUCCESS_MESSAGE',
    value: '✅ Praise {@receivers} {reason}',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR',
    value:
      '**❌ Account Not Activated**\nYour account is not activated in the praise system. Unactivated accounts can not praise users. Use the `/activate` command to activate your praise account and to link your eth address.',
    type: 'Textarea',
  },
  {
    key: 'DM_ERROR',
    value:
      '**❌ Server Not Found**\nThe praise command can only be used in the discord server.',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    value:
      '**❌ User does not have `{role}` role**\nThe praise command can only be used by members with the {@role} role. Attend an onboarding-call, or ask a steward or guide for an Intro to Praise.',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_INVALID_RECEIVERS_ERROR',
    value:
      '**❌ Receivers Not Mentioned**\nThis command requires atleast one valid receiver to be mentioned, in order for praise to get dished.',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_REASON_MISSING_ERROR',
    value:
      '**❌ `reason` Not Provided**\nPraise can not be dished or quantified without a reason.',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_UNDEFINED_RECEIVERS_WARNING',
    value:
      "**⚠️  Undefined Receivers**\nCould not praise {@receivers}.\n{@user}, this warning could have been caused when a user isn't mentioned properly in the praise receivers field OR when a user isn't found in the discord server.",
    type: 'Textarea',
  },
  {
    key: 'PRAISE_TO_ROLE_WARNING',
    value:
      "**⚠️  Roles as Praise receivers**\nCouldn't praise roles - {@receivers}.\n Praise does not support group/role based praising.",
    type: 'Textarea',
  },
  {
    key: 'PRAISE_SUCCESS_DM',
    value:
      '**👏 Congratulations! You have been Praised! 👏**\n[View your praise]({praiseURL})\n**Thank you** for supporting the community!',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
    value:
      "**You were just [praised](praiseURL)**\nIt looks like you haven't activated your account... To activate your account, use the `/activate` command in the server.",
    type: 'Textarea',
  },
  {
    key: 'LOGO',
    value: 'uploads/praise_logo.png',
    type: 'Image',
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },

      // Insert setting if not found, otherwise continue
      update: { $setOnInsert: { ...s } },
      upsert: true,
    },
  }));

  await SettingsModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const allKeys = settings.map((s) => s.key);
  await SettingsModel.deleteMany({ key: { $in: allKeys } });
};

export { up, down };

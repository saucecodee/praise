import { BadRequestError, NotFoundError } from '@error/errors';
import { removeFile, upload } from '@shared/functions';
import { TypedRequestBody, TypedResponse } from '@shared/types';
import { Request } from 'express';
import { SettingsModel } from '@settings/entities';
import {
  settingListTransformer,
  settingTransformer,
} from '@settings/transformers';
import { SettingDto, SettingSetInput } from '@settings/types';
import { PeriodStatusType } from '@period/types';
import { PeriodModel } from '../entities';

export const all = async (
  req: Request,
  res: TypedResponse<SettingDto[]>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const settings = await SettingsModel.find({ period: period._id });

  res.status(200).json(settingListTransformer(settings));
};

export const single = async (
  req: Request,
  res: TypedResponse<SettingDto>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const setting = await SettingsModel.findOne({
    _id: req.params.settingId,
    period: period._id,
  });
  if (!setting) throw new NotFoundError('Settings');
  res.status(200).json(settingTransformer(setting));
};

export const set = async (
  req: TypedRequestBody<SettingSetInput>,
  res: TypedResponse<SettingDto>
): Promise<void> => {
  const { value } = req.body;

  if (typeof value === 'undefined' && !req.files)
    throw new BadRequestError('Value is required field');

  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');
  if (period.status !== PeriodStatusType.OPEN)
    throw new BadRequestError(
      'Period settings can only be changed before the period begins'
    );

  const setting = await SettingsModel.findOne({
    _id: req.params.settingId,
    period: period._id,
  });
  if (!setting) throw new NotFoundError('Settings');

  if (req.files) {
    await removeFile(setting.value);
    const uploadRespone = await upload(req, 'value');
    if (uploadRespone) {
      setting.value = uploadRespone;
    }
  } else {
    setting.value = req.body.value; //TODO validate input
  }

  await setting.save();
  res.status(200).json(settingTransformer(setting));
};

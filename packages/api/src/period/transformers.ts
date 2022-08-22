import { quantificationListTransformer } from '@/praise/transformers';
import { Quantification, QuantificationDto } from '@/praise/types';
import { userAccountTransformer } from '@/useraccount/transformers';
import {
  PeriodDetailsGiverReceiver,
  PeriodDetailsGiverReceiverDto,
  PeriodDocument,
  PeriodDetailsDto,
} from './types';

/**
 * Serialize a PeriodDocument
 *
 * @param {PeriodDocument} periodDocument
 * @returns {PeriodDetailsDto}
 */
export const periodTransformer = (
  periodDocument: PeriodDocument
): PeriodDetailsDto => {
  const { _id, name, status, endDate, createdAt, updatedAt } = periodDocument;
  return {
    _id,
    name,
    status,
    endDate: endDate.toISOString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
};

/**
 * Serialize a list of Praise.quantification lists
 *
 * @param {(Quantification[][] | undefined)} listOfQuantificationLists
 * @returns {Promise<Array<Array<QuantificationDto>>>}
 */
const listOfQuantificationListsTransformer = async (
  listOfQuantificationLists: Quantification[][] | undefined
): Promise<Array<Array<QuantificationDto>>> => {
  if (listOfQuantificationLists && Array.isArray(listOfQuantificationLists)) {
    const quantifications: QuantificationDto[][] = [];
    for (const q of listOfQuantificationLists) {
      quantifications.push(await quantificationListTransformer(q));
    }
    return quantifications;
  }
  return [];
};

/**
 * Serialize relevant details about a Praise giver/receiver in a period
 *
 * @param {PeriodDetailsGiverReceiver} gr
 * @returns {Promise<PeriodDetailsGiverReceiverDto>}
 */
const periodDetailsGiverReceiverToDto = async (
  gr: PeriodDetailsGiverReceiver
): Promise<PeriodDetailsGiverReceiverDto> => {
  const { _id, praiseCount, quantifications, scoreRealized, userAccounts } = gr;
  return {
    _id: _id.toString(),
    praiseCount,
    quantifications: await listOfQuantificationListsTransformer(
      quantifications
    ),
    scoreRealized,
    userAccount:
      Array.isArray(userAccounts) && userAccounts.length > 0
        ? userAccountTransformer(userAccounts[0])
        : undefined,
  };
};

/**
 * Serialize relevant details about a list of Praise givers/receivers in a period
 *
 * @param {(PeriodDetailsGiverReceiver[] | undefined)} periodDetailsGiverReceiverList
 * @returns {Promise<PeriodDetailsGiverReceiverDto[]>}
 */
export const periodDetailsGiverReceiverListTransformer = async (
  periodDetailsGiverReceiverList: PeriodDetailsGiverReceiver[] | undefined
): Promise<PeriodDetailsGiverReceiverDto[]> => {
  if (
    periodDetailsGiverReceiverList &&
    Array.isArray(periodDetailsGiverReceiverList)
  ) {
    const grDto: PeriodDetailsGiverReceiverDto[] = [];
    for (const pdr of periodDetailsGiverReceiverList) {
      grDto.push(await periodDetailsGiverReceiverToDto(pdr));
    }
    return grDto;
  }
  return [];
};

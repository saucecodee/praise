import React, { Suspense } from 'react';

import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PeriodStatusType } from 'api/dist/period/types';
import { PeriodPageParams, SinglePeriod } from '@/model/periods';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadPlaceholder } from '@/components/LoadPlaceholder';
import { Top10Praise } from './analytics/Top10Praise';
import { ReceiversByScore } from './analytics/ReceiversByScore';
import { PeriodStats } from './analytics/PeriodStats';
import { QuantifierScoringDistribution } from './analytics/QuantifierScoringDistribution';
import { QuantificationSpread } from './analytics/QuantificationSpread';
import { ReceiversByNumber } from './analytics/ReceiversByNumber';
import { GiversByScore } from './analytics/GiversByScore';
import { GiversByNumber } from './analytics/GiversByNumber';
import { QuantifiersByScore } from './analytics/QuantifiersByScore';
import { ScoreDistribution } from './analytics/ScoreDistribution';

interface AnalyticsBoxProps {
  height: number;
  analysis: JSX.Element;
}

const AnalyticsBox = ({ height, analysis }: AnalyticsBoxProps): JSX.Element => {
  return (
    <ErrorBoundary height={height}>
      <Suspense
        fallback={
          <div style={{ height }}>
            <LoadPlaceholder height={height} />
          </div>
        }
      >
        {analysis}
      </Suspense>
    </ErrorBoundary>
  );
};

const Analytics = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  if (!period || period.status !== PeriodStatusType.CLOSED) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        Analytics are available after quantification when the period is closed.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 px-5">
      <h2>Period metrics</h2>
      <AnalyticsBox height={100} analysis={<PeriodStats />} />

      <h2>Top 10 praise</h2>
      <p>
        Which were the ten most significant contributions this period (according
        to the praise score)?
      </p>
      <AnalyticsBox height={1400} analysis={<Top10Praise />} />

      <h2>Receivers by score</h2>
      <p>Which users received the highest total praise score?</p>
      <AnalyticsBox height={375} analysis={<ReceiversByScore />} />

      <h2>Receivers by number</h2>
      <p>Which users received the most praise?</p>
      <AnalyticsBox height={375} analysis={<ReceiversByNumber />} />

      <h2>Givers by score</h2>
      <p>
        Which givers praised contributions that led to the highest praise
        scores?
      </p>
      <AnalyticsBox height={375} analysis={<GiversByScore />} />

      <h2>Top givers by number</h2>
      <p>Which users gave the most praise?</p>
      <AnalyticsBox height={375} analysis={<GiversByNumber />} />

      <h2>Quantification score distribution</h2>
      <p>How often does each score of the scale get used by quantifiers?</p>
      <AnalyticsBox height={375} analysis={<ScoreDistribution />} />
      <p className="text-xs">
        <b>*</b> This metric disregards scores of praise marked as a duplicate,
        since the score of the original is already being taken into account.
      </p>

      <h2>Quantifiers by score</h2>
      <p>
        Which quantifier gave the highest quantification scores? If all
        quantifiers where assigned the equal amount of praise and all
        quantifiers on average gave similar quantification scores the boxes
        would all be the same size.
      </p>
      <AnalyticsBox height={375} analysis={<QuantifiersByScore />} />
      <p className="text-xs">
        <b>*</b> The visualisation does not take into account that some
        quantifiers get assigned less praise than others.
      </p>

      <h2>Quantifier scoring distribution</h2>
      <p>
        On average, does the quantifiers score praise similarly? Are some
        quantifiers more generous than others?
      </p>
      <AnalyticsBox height={375} analysis={<QuantifierScoringDistribution />} />

      <h2>Quantification spread</h2>
      <p>
        When does the quantifiers agree or disagree? High quantification spread
        means disagreement between quantifiers as to the importance of a
        contribution.
      </p>
      <AnalyticsBox height={375} analysis={<QuantificationSpread />} />
      <p className="text-xs">
        <b>*</b>The spread is measured by the difference between the highest and
        lowest score given to a praise.
      </p>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default Analytics;

import { Module } from '@nestjs/common';

import { MvpRiskCalculator } from './application/risk-calculator';
import { mvpRiskCalculator } from './infrastructure/inactivity-analysis-singletons';

@Module({
  providers: [{ provide: MvpRiskCalculator, useValue: mvpRiskCalculator }],
  exports: [MvpRiskCalculator]
})
export class InactivityAnalysisModule {}

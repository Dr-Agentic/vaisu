import React from 'react';
import type { ExecutiveSummary as ExecutiveSummaryType } from '../../../../shared/src/types';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target } from 'lucide-react';

interface ExecutiveSummaryProps {
  summary: ExecutiveSummaryType;
}

export function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Headline */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold">{summary.headline}</h2>
      </div>

      {/* Key Ideas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summary.keyIdeas.map((idea, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg"
          >
            <div className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-90">
              Key Idea {index + 1}
            </div>
            <p className="text-sm leading-relaxed">{idea}</p>
          </div>
        ))}
      </div>

      {/* KPIs */}
      {summary.kpis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary.kpis.slice(0, 3).map((kpi) => (
            <div
              key={kpi.id}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-5 text-white shadow-lg"
            >
              <div className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-90">
                {kpi.label}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {kpi.value.toLocaleString()}
                </span>
                <span className="text-lg opacity-90">{kpi.unit}</span>
              </div>
              {kpi.trend && (
                <div className="flex items-center gap-1 mt-2 text-sm">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : kpi.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : null}
                  {kpi.trendValue && (
                    <span>{Math.abs(kpi.trendValue)}%</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Risks and Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risks */}
        {summary.risks.length > 0 && (
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold uppercase tracking-wide">Top Risks</h3>
            </div>
            <ul className="space-y-2">
              {summary.risks.slice(0, 3).map((risk, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="flex-shrink-0 mt-1">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Opportunities */}
        {summary.opportunities.length > 0 && (
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5" />
              <h3 className="font-semibold uppercase tracking-wide">Top Opportunities</h3>
            </div>
            <ul className="space-y-2">
              {summary.opportunities.slice(0, 3).map((opportunity, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="flex-shrink-0 mt-1">•</span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Call to Action */}
      {summary.callToAction && (
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5" />
            <h3 className="font-semibold uppercase tracking-wide">Next Steps</h3>
          </div>
          <p className="text-sm">{summary.callToAction}</p>
        </div>
      )}
    </div>
  );
}

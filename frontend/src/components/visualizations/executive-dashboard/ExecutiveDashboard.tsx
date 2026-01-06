import { DashboardData } from '@shared/types';
import {
  AlertTriangle,
  Lightbulb,
  Target,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { GraphViewerLayout } from '../toolkit/GraphViewerLayout';


interface ExecutiveDashboardProps {
  data: DashboardData;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ data }) => {
  const { executiveCard, kpiTiles, charts } = data;
  const { headline, keyIdeas, risks, opportunities, callToAction } = executiveCard;

  // Find the radar chart data for signals
  const signalsChart = charts.find((c) => c.type === 'radar');

  return (
    <GraphViewerLayout
      title="Executive Dashboard"
      description="High-level summary and strategic insights."
    >
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Headline Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {headline}
            </h2>

            {/* Call to Action */}
            {callToAction && (
              <div className="mt-6 flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Recommended Action</h3>
                  <p className="text-blue-800 dark:text-blue-200 mt-1">{callToAction}</p>
                </div>
              </div>
            )}
          </div>

          {/* Key Ideas & Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Key Ideas */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Key Takeaways
                </h3>
                <ul className="space-y-4">
                  {keyIdeas.map((idea, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{idea}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Document DNA (Radar Chart) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center min-h-[300px]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 self-start w-full">
                Document DNA
              </h3>
              {signalsChart ? (
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={signalsChart.data}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
                      <Radar
                        name="Signals"
                        dataKey="A"
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No signal data available</div>
              )}
            </div>
          </div>

          {/* Risks & Opportunities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Opportunities */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-emerald-500">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Opportunities
              </h3>
              <ul className="space-y-3">
                {opportunities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-rose-500">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Risks & Challenges
              </h3>
              <ul className="space-y-3">
                {risks.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-rose-50/50 dark:bg-rose-900/10">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* KPIs Section (if any) */}
          {kpiTiles.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Key Performance Indicators
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiTiles.map((kpi, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{kpi.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</span>
                      <span className="text-xs text-gray-500">{kpi.unit}</span>
                    </div>
                    {kpi.trend && (
                      <div className={`mt-2 text-xs font-medium flex items-center gap-1 
                        ${kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-rose-600' : 'text-gray-500'}`}>
                        {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'}
                        {kpi.trendValue ? `${kpi.trendValue}%` : kpi.trend}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </GraphViewerLayout>
  );
};

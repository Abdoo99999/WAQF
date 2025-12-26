import React, { useState, useEffect, useRef } from 'react';
import { getInstitutions, getEvaluations, getResponses, getIndicators, generateImprovementPlan, getImprovements } from '../services/db';
import { Institution, Evaluation, ImprovementItem } from '../types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Printer, AlertCircle, CheckCircle, Clock, ArrowUpCircle, Download } from 'lucide-react';

// Declare html2pdf
declare const html2pdf: any;

const COLORS = ['#ef4444', '#f59e0b', '#10b981']; // High, Medium, Low priority colors

// Custom Tick for Radar Chart
const RadarCustomTick = ({ payload, x, y, textAnchor, stroke, radius }: any) => {
    return (
        <g className="recharts-layer recharts-polar-angle-axis-tick">
            <text
                radius={radius}
                stroke={stroke}
                x={x}
                y={y}
                className="recharts-text recharts-polar-angle-axis-tick-value"
                textAnchor={textAnchor}
                fill="#4b5563"
                fontSize="11px"
                fontWeight="bold"
            >
                <tspan x={x} dy="0.355em">{payload.value}</tspan>
            </text>
        </g>
    );
};

const Reports: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [improvements, setImprovements] = useState<ImprovementItem[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInstitutions(getInstitutions());
  }, []);

  useEffect(() => {
    if (!selectedInstId) return;
    
    const ev = getEvaluations().find(e => e.institution_id === selectedInstId);
    if (!ev) {
        setReportData(null);
        return;
    }

    const responses = getResponses(ev.id);
    const indicators = getIndicators();

    generateImprovementPlan(ev.id, responses, indicators);
    setImprovements(getImprovements(ev.id));

    const axisScores: Record<string, { total: number, count: number }> = {};
    // Pre-seed axes
    const uniqueAxes = Array.from(new Set(indicators.map(i => i.axis)));
    uniqueAxes.forEach(ax => { axisScores[ax] = { total: 0, count: 0 } });

    responses.forEach(r => {
        const ind = indicators.find(i => i.id === r.indicator_id);
        if (ind) {
            if (!axisScores[ind.axis]) axisScores[ind.axis] = { total: 0, count: 0 };
            axisScores[ind.axis].total += r.score;
            axisScores[ind.axis].count += 1;
        }
    });

    const radarData = uniqueAxes.map((axis, index) => {
        const scoreData = axisScores[axis];
        const avg = scoreData.count > 0 ? (scoreData.total / scoreData.count) : 0;
        return {
            subject: `${index + 1}. ${axis}`, // Add index for clarity
            A: Number(avg.toFixed(2)),
            fullMark: 5
        };
    });

    setReportData({ radarData, evaluation: ev });

  }, [selectedInstId]);

  const handleDownloadPDF = () => {
      const element = document.getElementById('report-content');
      if (!element) return;
      
      const opt = {
        margin:       10,
        filename:     `Report-${institutions.find(i => i.id === selectedInstId)?.name}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().from(element).set(opt).save();
  };

  const improvementStats = [
      { name: 'عالية', value: improvements.filter(i => i.priority === 'High').length },
      { name: 'متوسطة', value: improvements.filter(i => i.priority === 'Medium').length },
      { name: 'منخفضة', value: improvements.filter(i => i.priority === 'Low').length },
  ].filter(i => i.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white">التقارير وخطة التحسين</h2>
        {reportData && (
            <div className="flex gap-2">
                <button onClick={() => window.print()} className="bg-navy-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-navy-900 shadow-md">
                    <Printer size={18} /> طباعة
                </button>
                <button onClick={handleDownloadPDF} className="bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-800 shadow-md">
                    <Download size={18} /> تصدير PDF
                </button>
            </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 no-print">
        <select 
          className="w-full p-3 border border-gray-300 rounded-lg outline-none"
          value={selectedInstId}
          onChange={(e) => setSelectedInstId(e.target.value)}
        >
          <option value="">-- اختر المؤسسة لعرض التقرير --</option>
          {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>

      {reportData ? (
        <div id="report-content" className="space-y-8 animate-fadeIn print-content p-4 bg-white">
            {/* Header for Print/PDF */}
            <div className="text-center border-b pb-4 mb-8">
                <h1 className="text-2xl font-bold text-navy-900">تقرير الأداء وخطة التحسين</h1>
                <p className="text-gray-500">وزارة الأوقاف والشؤون الدينية</p>
                <p className="mt-2 text-sm font-bold">المؤسسة: {institutions.find(i => i.id === selectedInstId)?.name}</p>
            </div>

            {/* Visual Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Radar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 page-break">
                    <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                        <ArrowUpCircle className="text-teal-600" /> تحليل الفجوات
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={reportData.radarData}>
                                <PolarGrid />
                                <PolarAngleAxis 
                                    dataKey="subject" 
                                    tick={RadarCustomTick}
                                />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                                <Radar name="المؤسسة" dataKey="A" stroke="#0d9488" fill="#0d9488" fillOpacity={0.6} />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Priorities Donut */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                     <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                         <AlertCircle className="text-orange-500" /> أولويات التحسين
                     </h3>
                     <div className="flex items-center justify-center h-72 relative">
                        {improvementStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={improvementStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {improvementStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-gray-400">
                                <CheckCircle size={48} className="mx-auto mb-2 text-green-500 opacity-50" />
                                <p>أداء ممتاز، لا توجد بنود حرجة</p>
                            </div>
                        )}
                        <div className="absolute font-bold text-2xl text-navy-900">{improvements.length}</div>
                     </div>
                </div>
            </div>

            {/* Visual Improvement Cards (Grid) */}
            <div className="mt-8 page-break">
                <h3 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                    <Clock className="text-blue-600" /> خطة التحسين التنفيذية
                </h3>
                
                {improvements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {improvements.map(imp => {
                            let statusColor = 'bg-gray-100 text-gray-600';
                            let statusText = 'متابعة';
                            let borderClass = 'border-l-4 border-l-gray-400';

                            if (imp.priority === 'High') {
                                statusColor = 'bg-red-100 text-red-700';
                                statusText = 'حرج / يتطلب تدخل فوري';
                                borderClass = 'border-l-4 border-l-red-500';
                            } else if (imp.priority === 'Medium') {
                                statusColor = 'bg-orange-100 text-orange-700';
                                statusText = 'خطر متوسط';
                                borderClass = 'border-l-4 border-l-orange-500';
                            } else {
                                statusColor = 'bg-yellow-100 text-yellow-700';
                                statusText = 'تحسين';
                                borderClass = 'border-l-4 border-l-yellow-500';
                            }

                            return (
                                <div key={imp.id} className={`bg-white p-5 rounded-lg shadow-sm ${borderClass} border border-gray-100`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                            {statusText}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-navy-900 text-sm mb-4 leading-relaxed">
                                        {imp.issue_summary.replace('انخفاض في المؤشر: ', '')}
                                    </h4>
                                    <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs text-gray-400 font-medium">الإجراء:</span>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">تحسين مطلوب</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                        <CheckCircle size={40} className="mx-auto text-green-500 mb-2" />
                        <p className="text-gray-500">لا توجد إجراءات تحسين مطلوبة حالياً.</p>
                    </div>
                )}
            </div>
        </div>
      ) : (
          <div className="text-center py-20 text-gray-400">
              {selectedInstId ? "لا يوجد تقييم لهذه المؤسسة بعد" : "اختر مؤسسة لعرض خطة التحسين"}
          </div>
      )}
    </div>
  );
};

export default Reports;
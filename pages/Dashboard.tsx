import React, { useMemo, useEffect, useState } from 'react';
import { getInstitutions, getEvaluations, getComplianceRecords, getAllResponses, getRisks } from '../services/db';
import { Institution, Evaluation, Response, RiskRegisterItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, CartesianGrid, LineChart, Line, LabelList } from 'recharts';
import { calculateRiskScore, GOVERNORATES } from '../constants';
import { Building, AlertTriangle, CheckCircle, TrendingUp, MapPin, Shield, Wallet, Users, UserCheck, Target, Activity, Coins, Medal, Briefcase } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];
const GOV_COLORS = ['#3366cc', '#dc3912', '#ff9900', '#109618', '#990099', '#0099c6', '#dd4477', '#66aa00', '#b82e2e', '#316395', '#994499'];

const InfographicCard = ({ title, value, icon: Icon, gradient, subtext, footer }: any) => (
  <div className={`relative overflow-hidden rounded-2xl shadow-xl ${gradient} text-white p-6 transition-transform hover:scale-[1.02] duration-300`}>
    <div className="relative z-10 flex justify-between items-start">
        <div>
            <p className="text-blue-100 font-medium mb-1 text-lg">{title}</p>
            <h3 className="text-4xl font-extrabold tracking-tight my-3">{value}</h3>
            {subtext && <p className="text-sm text-white/80 font-light">{subtext}</p>}
        </div>
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner">
            <Icon size={32} className="text-white" />
        </div>
    </div>
    {footer && (
        <div className="relative z-10 mt-6 pt-4 border-t border-white/20 text-sm font-medium">
            {footer}
        </div>
    )}
    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
    <div className="absolute top-10 -left-10 w-20 h-20 bg-black/10 rounded-full blur-2xl"></div>
  </div>
);

// Custom Tick for Radar Chart to prevent overlap
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
                {/* Break text into two lines if needed or just render */}
                <tspan x={x} dy="0.355em">{payload.value}</tspan>
            </text>
        </g>
    );
};


// Mock Data for Strategy 2026-2030
const STRATEGY_DATA = [
    { year: '2025', actual: 3.2, target: 3.2 },
    { year: '2026', actual: null, target: 3.5 },
    { year: '2027', actual: null, target: 3.8 },
    { year: '2028', actual: null, target: 4.2 },
    { year: '2029', actual: null, target: 4.5 },
    { year: '2030', actual: null, target: 4.8 },
];

const Dashboard: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [risks, setRisks] = useState<RiskRegisterItem[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    setInstitutions(getInstitutions());
    setEvaluations(getEvaluations());
    setCompliance(getComplianceRecords());
    setRisks(getRisks());
    setResponses(getAllResponses());
  }, []);
  
  // 1. Institution Types Breakdown
  const typeStats = useMemo(() => {
      const general = institutions.filter(i => i.type === 'وقفية عامة').length;
      const special = institutions.filter(i => i.type === 'وقفية خاصة').length;
      return [
          { name: 'عامة', value: general, fill: '#0d9488' }, // Teal 600
          { name: 'خاصة', value: special, fill: '#f59e0b' } // Amber 500
      ];
  }, [institutions]);

  // 1.b Total Capital
  const totalCapital = useMemo(() => {
      return institutions.reduce((acc, i) => acc + (i.capital_omr || 0), 0);
  }, [institutions]);

  // 1.c Top 5 Performing Institutions
  const topInstitutions = useMemo(() => {
      const scores: Record<string, { total: number, count: number, name: string }> = {};
      
      const instMap = new Map<string, string>(institutions.map(i => [i.id, i.name] as [string, string]));

      responses.forEach(r => {
          const evalRec = evaluations.find(e => e.id === r.evaluation_id);
          if(evalRec) {
              const instId = evalRec.institution_id;
              if(!scores[instId]) scores[instId] = { total: 0, count: 0, name: instMap.get(instId) || 'Unknown' };
              scores[instId].total += r.score;
              scores[instId].count++;
          }
      });

      const avgScores = Object.values(scores).map(s => ({
          name: s.name,
          score: Number((s.total / s.count).toFixed(2))
      }));

      return avgScores.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [responses, institutions, evaluations]);

  // 1.d Employee Stats
  const employeeStats = useMemo(() => {
      const omani = institutions.reduce((acc, i) => acc + (i.employees_omani || 0), 0);
      const nonOmani = institutions.reduce((acc, i) => acc + (i.employees_non_omani || 0), 0);
      return [
          { name: 'عماني', value: omani, fill: '#10b981' }, // Emerald
          { name: 'غير عماني', value: nonOmani, fill: '#6366f1' } // Indigo
      ];
  }, [institutions]);

  // 1.e Capital Size Classification
  const capitalStats = useMemo(() => {
      let small = 0, medium = 0, large = 0;
      institutions.forEach(i => {
          if (i.capital_omr < 100000) small++;
          else if (i.capital_omr < 1000000) medium++;
          else large++;
      });
      return [
          { name: 'صغيرة (< 100 ألف)', value: small, fill: '#60a5fa' },
          { name: 'متوسطة (100 ألف - 1 مليون)', value: medium, fill: '#3b82f6' },
          { name: 'كبيرة (> 1 مليون)', value: large, fill: '#1e40af' },
      ].filter(d => d.value > 0);
  }, [institutions]);


  // 2. Risk Matrix
  const riskMatrix = useMemo(() => {
      let high = 0, med = 0, low = 0;
      risks.forEach(r => {
          const score = r.probability * r.impact;
          if (score >= 15) high++;
          else if (score >= 8) med++;
          else low++;
      });
      return { high, med, low, total: risks.length };
  }, [risks]);

  // 3. Gov Stats (Visual with unique colors)
  const govStats = useMemo(() => {
      const counts: Record<string, number> = {};
      GOVERNORATES.forEach(g => counts[g] = 0);
      institutions.forEach(i => {
          if (i.governorate && counts[i.governorate] !== undefined) {
              counts[i.governorate]++;
          }
      });
      return Object.keys(counts)
        .map((g, idx) => ({ name: g, value: counts[g], fill: GOV_COLORS[idx % GOV_COLORS.length] }))
        .sort((a, b) => b.value - a.value)
        .filter(g => g.value > 0);
  }, [institutions]);

  const averageScore = useMemo(() => {
      if (responses.length === 0) return 0;
      const total = responses.reduce((acc, r) => acc + r.score, 0);
      return (total / responses.length).toFixed(1);
  }, [responses]);

  // Radar Data with Indexes
  const radarData = [
        { id: 1, subject: '1. الشرعي', A: 4.2, fullMark: 5 },
        { id: 2, subject: '2. الإداري', A: 3.5, fullMark: 5 },
        { id: 3, subject: '3. المالي', A: 3.8, fullMark: 5 },
        { id: 4, subject: '4. الحوكمة', A: 2.9, fullMark: 5 },
        { id: 5, subject: '5. الابتكار', A: 2.1, fullMark: 5 },
        { id: 6, subject: '6. الاستدامة', A: 4.0, fullMark: 5 },
    ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end mb-6">
         <div>
            <h2 className="text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">لوحة القيادة الاستراتيجية</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">نظرة شاملة على الأصول البشرية، المالية، ومستويات الأداء</p>
         </div>
      </div>

      {/* Hero Financial & HR KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Capital Size Card */}
        <InfographicCard 
          title="حجم رأس المال الوقفي" 
          value={`${(totalCapital / 1000000).toFixed(2)} M`} 
          icon={Coins} 
          gradient="bg-gradient-to-br from-indigo-900 to-navy-900"
          subtext="ر.ع (القيمة السوقية التقديرية)"
          footer={<span className="text-blue-200">النمو السنوي: +4.2%</span>}
        />
        
        {/* Public vs Private Visual Indicator - Colorized */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="w-1/2">
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">توزيع المؤسسات</p>
                <div className="space-y-4 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-600"></div>
                        <span className="text-navy-900 dark:text-white font-bold text-xl">{typeStats[0].value}</span>
                        <span className="text-xs text-gray-500">عامة</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-navy-900 dark:text-white font-bold text-xl">{typeStats[1].value}</span>
                        <span className="text-xs text-gray-500">خاصة</span>
                    </div>
                </div>
            </div>
            <div className="w-1/2 h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={typeStats} innerRadius={25} outerRadius={40} dataKey="value" paddingAngle={5}>
                            {typeStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <InfographicCard 
          title="متوسط الأداء" 
          value={averageScore} 
          icon={Activity} 
          gradient="bg-gradient-to-br from-purple-700 to-purple-900"
          subtext="من 5.0"
        />
        
        {/* Critical Risks Card - Prominent Number */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-red-600 to-red-800 text-white p-6">
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <p className="text-red-100 font-medium text-lg">المخاطر الحرجة</p>
                    <div className="bg-white/20 p-2 rounded-lg"><AlertTriangle size={24} /></div>
                </div>
                <div className="flex items-baseline mt-4">
                    <h3 className="text-6xl font-extrabold tracking-tight">{riskMatrix.high}</h3>
                    <span className="mr-2 text-red-200 font-medium">حالة</span>
                </div>
                <p className="text-xs text-red-100 mt-2 opacity-80">تتطلب تدخلاً فورياً</p>
            </div>
             <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Geographic Distribution - Vertical & Colored */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                    <MapPin className="text-teal-600" /> التوزيع الجغرافي (حسب المحافظة)
                </h3>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={govStats} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 12, fill: '#4b5563'}} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f0f4f8'}} contentStyle={{borderRadius: '10px'}} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                            {govStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            <LabelList dataKey="value" position="top" fill="#374151" fontSize={14} fontWeight="bold" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Top 5 Institutions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-6 flex items-center gap-2">
             <Medal className="text-gold-500" /> الأعلى أداءً (التوب 5)
          </h3>
          <div className="h-64 relative">
             {topInstitutions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={topInstitutions} margin={{ left: 10, right: 10 }}>
                        <XAxis type="number" domain={[0, 5]} hide />
                        <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '10px'}} />
                        <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: '#f1f5f9' }}>
                             <LabelList dataKey="score" position="right" fill="#374151" fontSize={12} fontWeight="bold" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             ) : (
                 <div className="flex items-center justify-center h-full text-gray-400 text-sm">لا توجد بيانات تقييم كافية</div>
             )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Capital Size Distribution (New) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
             <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-6 flex items-center gap-2">
                <Briefcase className="text-blue-600" /> تصنيف المؤسسات حسب رأس المال
             </h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={capitalStats} barSize={50}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f0f4f8'}} contentStyle={{borderRadius: '10px'}} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {capitalStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            <LabelList dataKey="value" position="top" fill="#374151" fontSize={14} fontWeight="bold" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </div>

        {/* Strategy Chart 2026-2030 */}
           <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                    <Target className="text-red-600" /> مسار النضج الاستراتيجي
                </h3>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={STRATEGY_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="year" axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 5]} axisLine={false} tickLine={false} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <Tooltip contentStyle={{borderRadius: '10px'}} />
                        <Area type="monotone" dataKey="target" stroke="#8884d8" strokeWidth={3} fillOpacity={1} fill="url(#colorTarget)" name="المستهدف" />
                        <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={{r: 6}} name="الفعلي" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart with Labels (Fixed Overlap) */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-6 flex items-center gap-2">
                <Shield className="text-blue-600" /> توازن الأداء المؤسسي
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={RadarCustomTick} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                        <Radar name="الأداء الحالي" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [value, 'النتيجة']}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
          </div>
          
          {/* New Employee Stats Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-6 flex items-center gap-2">
                 <Users className="text-teal-600" /> إحصائيات الموظفين (عماني / غير عماني)
              </h3>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={employeeStats} barSize={60}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{fontSize: 14, fontWeight: 'bold', fill: '#4b5563'}} axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: '#f0f4f8'}} contentStyle={{borderRadius: '10px'}} />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                             {employeeStats.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.fill} />
                             ))}
                             <LabelList dataKey="value" position="top" fill="#374151" fontSize={16} fontWeight="bold" />
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
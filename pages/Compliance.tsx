import React, { useState, useEffect } from 'react';
import { getInstitutions, getComplianceRecords, saveComplianceRecord, generateId, getComplianceByInstAndYear, getRisks, saveRisk, deleteRisk } from '../services/db';
import { Institution, ComplianceRecord, RiskRegisterItem, CustomRequirement } from '../types';
import { CURRENT_YEAR, calculateRiskScore } from '../constants';
import { Save, AlertTriangle, CheckCircle, Info, ShieldAlert, Plus, Trash2, Scale, X } from 'lucide-react';
import { useUi } from '../contexts/UiContext';

const CompliancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compliance' | 'risks'>('compliance');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState('');
  const { showToast } = useUi();
  
  // Compliance State
  const [record, setRecord] = useState<Partial<ComplianceRecord>>({});
  const [newReqText, setNewReqText] = useState('');
  const [showAddReq, setShowAddReq] = useState(false);
  
  // Risk Register State
  const [instRisks, setInstRisks] = useState<RiskRegisterItem[]>([]);
  const [newRisk, setNewRisk] = useState<Partial<RiskRegisterItem>>({});
  const [showRiskForm, setShowRiskForm] = useState(false);

  // Real-time calculated risk based on compliance form
  const complianceRisk = calculateRiskScore(record);

  useEffect(() => {
    setInstitutions(getInstitutions());
  }, []);

  useEffect(() => {
    if (selectedInstId) {
        // Load Compliance
        const existing = getComplianceByInstAndYear(selectedInstId, CURRENT_YEAR);
        if (existing) {
            setRecord(existing);
        } else {
            setRecord({
                institution_id: selectedInstId,
                cycle_year: CURRENT_YEAR,
                institution_status: 'فاعلة',
                board_status: 'قائم',
                has_executive_management: false,
                has_auditor_company: false,
                has_minutes_prev_year: false,
                has_financial_report_prev_year: false,
                custom_requirements: [],
                notes: ''
            });
        }

        // Load Risks
        setInstRisks(getRisks(selectedInstId));
    } else {
        setRecord({});
        setInstRisks([]);
    }
  }, [selectedInstId]);

  const handleSaveCompliance = () => {
      if (!selectedInstId) return;
      const toSave: ComplianceRecord = {
          ...record as ComplianceRecord,
          id: record.id || generateId(),
          institution_id: selectedInstId,
          cycle_year: CURRENT_YEAR,
          last_updated_at: new Date().toISOString()
      };
      saveComplianceRecord(toSave);
      showToast('تم حفظ سجل الامتثال بنجاح', 'success');
  };

  const handleAddRequirement = () => {
      if (!newReqText) return;
      const newReq: CustomRequirement = {
          id: generateId(),
          text: newReqText,
          met: false
      };
      setRecord(prev => ({
          ...prev,
          custom_requirements: [...(prev.custom_requirements || []), newReq]
      }));
      setNewReqText('');
      setShowAddReq(false);
  };

  const handleRemoveRequirement = (id: string) => {
      setRecord(prev => ({
          ...prev,
          custom_requirements: prev.custom_requirements?.filter(r => r.id !== id)
      }));
  };

  const toggleCustomRequirement = (id: string) => {
      setRecord(prev => ({
          ...prev,
          custom_requirements: prev.custom_requirements?.map(r => r.id === id ? { ...r, met: !r.met } : r)
      }));
  };

  const handleSaveRisk = () => {
      if (!selectedInstId || !newRisk.risk_title) return;
      const riskToSave: RiskRegisterItem = {
          id: generateId(),
          institution_id: selectedInstId,
          risk_title: newRisk.risk_title,
          category: newRisk.category || 'Operational',
          probability: Number(newRisk.probability) || 1,
          impact: Number(newRisk.impact) || 1,
          mitigation_plan: newRisk.mitigation_plan || '',
          status: 'Open'
      };
      saveRisk(riskToSave);
      setInstRisks(getRisks(selectedInstId));
      setShowRiskForm(false);
      setNewRisk({});
      showToast('تم إضافة الخطر بنجاح', 'success');
  };

  const handleDeleteRisk = (id: string) => {
      if(confirm('حذف هذا الخطر؟')) {
          deleteRisk(id);
          setInstRisks(getRisks(selectedInstId));
          showToast('تم حذف الخطر', 'info');
      }
  };

  const updateComplianceField = (field: keyof ComplianceRecord, value: any) => {
      setRecord(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-navy-900">إدارة المخاطر والامتثال ({CURRENT_YEAR})</h2>
      </div>
      
      {/* Selection */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-medium mb-2 text-gray-700">اختر المؤسسة</label>
        <select 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-800 outline-none"
          value={selectedInstId}
          onChange={(e) => setSelectedInstId(e.target.value)}
        >
          <option value="">-- اختر المؤسسة --</option>
          {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>

      {selectedInstId && (
          <div className="animate-fadeIn">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                  <button 
                    onClick={() => setActiveTab('compliance')}
                    className={`pb-3 px-6 font-bold text-sm transition-colors ${activeTab === 'compliance' ? 'border-b-2 border-navy-800 text-navy-900' : 'text-gray-500 hover:text-navy-700'}`}
                  >
                      <span className="flex items-center gap-2"><Scale size={16} /> الامتثال النظامي</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('risks')}
                    className={`pb-3 px-6 font-bold text-sm transition-colors ${activeTab === 'risks' ? 'border-b-2 border-navy-800 text-navy-900' : 'text-gray-500 hover:text-navy-700'}`}
                  >
                      <span className="flex items-center gap-2"><ShieldAlert size={16} /> سجل المخاطر</span>
                  </button>
              </div>

              {/* COMPLIANCE TAB */}
              {activeTab === 'compliance' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                                <Info size={20} className="text-teal-600" /> الحالة الأساسية
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">حالة المؤسسة</label>
                                    <select className="w-full p-2 border rounded-lg bg-gray-50" value={record.institution_status} onChange={(e) => updateComplianceField('institution_status', e.target.value)}>
                                        <option value="فاعلة">فاعلة</option>
                                        <option value="غير فاعلة">غير فاعلة</option>
                                        <option value="قيد التصفية">قيد التصفية</option>
                                        <option value="متوقفة">متوقفة</option>
                                        <option value="أخرى">أخرى</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">حالة مجلس الإدارة</label>
                                    <select className="w-full p-2 border rounded-lg bg-gray-50" value={record.board_status} onChange={(e) => updateComplianceField('board_status', e.target.value)}>
                                        <option value="قائم">قائم</option>
                                        <option value="منتهي">منتهي الصلاحية</option>
                                        <option value="غير موجود">غير موجود</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                                <CheckCircle size={20} className="text-teal-600" /> المتطلبات النظامية
                            </h3>
                            <div className="space-y-4">
                                <ToggleItem label="هل توجد إدارة تنفيذية أو مدير؟" checked={record.has_executive_management} onChange={(v) => updateComplianceField('has_executive_management', v)} />
                                <ToggleItem label="هل تم تعيين شركة تدقيق؟" checked={record.has_auditor_company} onChange={(v) => updateComplianceField('has_auditor_company', v)} />
                                <ToggleItem label="هل توجد محاضر اجتماعات للعام الماضي؟" checked={record.has_minutes_prev_year} onChange={(v) => updateComplianceField('has_minutes_prev_year', v)} />
                                <ToggleItem label="هل يوجد تقرير مالي معتمد للعام الماضي؟" checked={record.has_financial_report_prev_year} onChange={(v) => updateComplianceField('has_financial_report_prev_year', v)} />
                            </div>

                            {/* Custom Requirements Section */}
                            <div className="mt-8 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-800 text-sm">متطلبات إضافية</h4>
                                    <button onClick={() => setShowAddReq(true)} className="text-blue-600 text-xs flex items-center gap-1 hover:underline"><Plus size={14}/> إضافة متطلب</button>
                                </div>
                                
                                {showAddReq && (
                                    <div className="flex gap-2 mb-4 animate-fadeIn">
                                        <input 
                                            type="text" 
                                            className="flex-1 border p-2 rounded text-sm" 
                                            placeholder="اكتب المتطلب الجديد..." 
                                            value={newReqText} 
                                            onChange={e => setNewReqText(e.target.value)} 
                                        />
                                        <button onClick={handleAddRequirement} className="bg-navy-800 text-white px-3 py-1 rounded text-sm">إضافة</button>
                                        <button onClick={() => setShowAddReq(false)} className="text-gray-500 px-2"><X size={16}/></button>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {record.custom_requirements?.map(req => (
                                        <div key={req.id} className="flex items-center justify-between group">
                                            <ToggleItem label={req.text} checked={req.met} onChange={() => toggleCustomRequirement(req.id)} className="flex-1" />
                                            <button onClick={() => handleRemoveRequirement(req.id)} className="mr-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!record.custom_requirements || record.custom_requirements.length === 0) && (
                                        <p className="text-xs text-gray-400 text-center py-2">لا توجد متطلبات إضافية</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSaveCompliance} className="w-full bg-navy-800 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-navy-900 flex justify-center items-center gap-2">
                            <Save size={20} /> حفظ سجل الامتثال
                        </button>
                    </div>

                    {/* Sidebar Risk */}
                    <div className="lg:col-span-1">
                        <div className={`sticky top-6 p-6 rounded-xl border ${complianceRisk.score >= 6 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            <h3 className="text-lg font-bold text-navy-900 mb-2">تحليل المخاطر (الامتثال)</h3>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`text-4xl font-bold ${complianceRisk.score >= 6 ? 'text-red-600' : 'text-green-600'}`}>{complianceRisk.score}</div>
                                <div><div className="text-xs text-gray-500 uppercase">نقاط الخطر</div><div className={`font-bold ${complianceRisk.score >= 6 ? 'text-red-700' : 'text-green-700'}`}>{complianceRisk.label}</div></div>
                            </div>
                            <div className="space-y-3">
                                <RiskIndicator label="مجلس الإدارة" active={record.board_status !== 'قائم'} points={3} />
                                <RiskIndicator label="الإدارة التنفيذية" active={!record.has_executive_management} points={2} />
                                <RiskIndicator label="شركة التدقيق" active={!record.has_auditor_company} points={2} />
                                <RiskIndicator label="التقرير المالي" active={!record.has_financial_report_prev_year} points={2} />
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {/* RISK REGISTER TAB */}
              {activeTab === 'risks' && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                          <h3 className="text-lg font-bold text-navy-900">قائمة المخاطر المرصودة</h3>
                          <button onClick={() => setShowRiskForm(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 text-sm"><Plus size={16} /> إضافة خطر</button>
                      </div>

                      {showRiskForm && (
                          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fadeIn">
                              <h4 className="font-bold mb-4">تسجيل خطر جديد</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="col-span-2">
                                      <label className="block text-xs font-bold text-gray-500 mb-1">وصف الخطر</label>
                                      <input type="text" className="w-full p-2 border rounded" value={newRisk.risk_title || ''} onChange={e => setNewRisk({...newRisk, risk_title: e.target.value})} placeholder="مثال: نزاع قانوني على أصل وقفي" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1">التصنيف</label>
                                      <select className="w-full p-2 border rounded" value={newRisk.category} onChange={e => setNewRisk({...newRisk, category: e.target.value as any})}>
                                          <option value="Operational">تشغيلي</option>
                                          <option value="Financial">مالي</option>
                                          <option value="Legal">قانوني</option>
                                          <option value="Strategic">استراتيجي</option>
                                      </select>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">الاحتمالية (1-5)</label>
                                        <input type="number" min="1" max="5" className="w-full p-2 border rounded" value={newRisk.probability || ''} onChange={e => setNewRisk({...newRisk, probability: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">الأثر (1-5)</label>
                                        <input type="number" min="1" max="5" className="w-full p-2 border rounded" value={newRisk.impact || ''} onChange={e => setNewRisk({...newRisk, impact: Number(e.target.value)})} />
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                      <label className="block text-xs font-bold text-gray-500 mb-1">خطة المعالجة</label>
                                      <input type="text" className="w-full p-2 border rounded" value={newRisk.mitigation_plan || ''} onChange={e => setNewRisk({...newRisk, mitigation_plan: e.target.value})} />
                                  </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                  <button onClick={() => setShowRiskForm(false)} className="px-4 py-2 text-gray-600">إلغاء</button>
                                  <button onClick={handleSaveRisk} className="bg-navy-800 text-white px-4 py-2 rounded">حفظ</button>
                              </div>
                          </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {instRisks.map(risk => {
                              const score = risk.probability * risk.impact;
                              let color = 'bg-green-100 border-green-200';
                              if (score >= 15) color = 'bg-red-50 border-red-200';
                              else if (score >= 8) color = 'bg-orange-50 border-orange-200';
                              
                              return (
                                  <div key={risk.id} className={`p-4 rounded-xl border ${color} relative group`}>
                                      <button onClick={() => handleDeleteRisk(risk.id)} className="absolute top-2 left-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                                      <div className="flex justify-between items-start mb-2">
                                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{risk.category}</span>
                                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${score >= 15 ? 'bg-red-500 text-white' : (score >= 8 ? 'bg-orange-500 text-white' : 'bg-green-500 text-white')}`}>
                                              {score} (شدة الخطر)
                                          </span>
                                      </div>
                                      <h4 className="font-bold text-navy-900 mb-2">{risk.risk_title}</h4>
                                      <p className="text-sm text-gray-600 mb-3">{risk.mitigation_plan || 'لا توجد خطة معالجة'}</p>
                                      <div className="flex gap-2 text-xs text-gray-500 border-t pt-2 border-gray-200/50">
                                          <span>P: {risk.probability}</span>
                                          <span>I: {risk.impact}</span>
                                      </div>
                                  </div>
                              )
                          })}
                          {instRisks.length === 0 && (
                              <div className="col-span-full py-10 text-center text-gray-400 border border-dashed border-gray-300 rounded-xl">
                                  لا توجد مخاطر مسجلة
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>
      )}

      {!selectedInstId && (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
           اختر مؤسسة للبدء
        </div>
      )}
    </div>
  );
};

// UI Components
const ToggleItem = ({ label, checked, onChange, className }: any) => (
    <div 
        className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${checked ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-200 hover:bg-gray-50'} ${className}`}
        onClick={onChange}
    >
        <span className={`font-medium ${checked ? 'text-teal-900' : 'text-gray-600'}`}>{label}</span>
        <div className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-teal-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${checked ? 'left-1' : 'right-1'}`}></div>
        </div>
    </div>
);

const RiskIndicator = ({ label, active, points }: any) => (
    <div className={`flex justify-between items-center text-sm ${active ? 'opacity-100' : 'opacity-40'}`}>
        <span className="flex items-center gap-2">
            {active ? <AlertTriangle size={14} className="text-red-500" /> : <CheckCircle size={14} className="text-gray-400" />}
            {label}
        </span>
        <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border">+{points}</span>
    </div>
);

export default CompliancePage;
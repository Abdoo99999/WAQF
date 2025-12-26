import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Moon, Sun, Download, Upload } from 'lucide-react';
import { getSettings, saveSettings } from '../services/db';
import { useUi } from '../contexts/UiContext';

const Settings: React.FC = () => {
  const [formData, setFormData] = useState<any>({
      managerName: '',
      darkMode: false,
      orgName: ''
  });
  const { showToast } = useUi();

  useEffect(() => {
      setFormData(getSettings());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev: any) => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
      }));
  };

  const handleSave = () => {
      saveSettings(formData);
      showToast('تم حفظ الإعدادات بنجاح', 'success');
  };

  const exportData = () => {
      const data = { ...localStorage };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waqf-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      showToast('تم تصدير النسخة الاحتياطية', 'success');
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
          try {
              const data = JSON.parse(evt.target?.result as string);
              Object.keys(data).forEach(key => {
                  localStorage.setItem(key, data[key]);
              });
              showToast('تم استعادة البيانات بنجاح، يرجى تحديث الصفحة', 'success');
              setTimeout(() => window.location.reload(), 2000);
          } catch (err) {
              showToast('خطأ في ملف النسخة الاحتياطية', 'error');
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white">إعدادات النظام</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 dark:text-white">الإعدادات العامة</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">تخصيص بيانات النظام الأساسية</p>
        </div>
        <div className="p-6 space-y-4 max-w-2xl">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">اسم الجهة المشرفة</label>
                <input 
                    name="orgName"
                    type="text" 
                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    value={formData.orgName} 
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">اسم المشرف العام (مدير النظام)</label>
                <input 
                    name="managerName"
                    type="text" 
                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    value={formData.managerName} 
                    onChange={handleChange}
                />
            </div>
             
             {/* Dark Mode Toggle */}
             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                 <div className="flex items-center gap-3">
                     {formData.darkMode ? <Moon className="text-blue-400" /> : <Sun className="text-orange-400" />}
                     <div>
                         <div className="font-bold text-sm dark:text-white">الوضع الليلي</div>
                         <div className="text-xs text-gray-500 dark:text-gray-400">تغيير مظهر النظام للوضع المظلم</div>
                     </div>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="darkMode" checked={formData.darkMode} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
             </div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 flex justify-end">
            <button onClick={handleSave} className="bg-navy-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-navy-900">
                <Save size={18} /> حفظ التغييرات
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 text-blue-600">النسخ الاحتياطي واستعادة البيانات</h3>
            <p className="text-gray-500 text-sm">حفظ نسخة من جميع البيانات محلياً</p>
        </div>
        <div className="p-6 flex gap-4">
            <button onClick={exportData} className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2">
                <Download size={18} /> تصدير قاعدة البيانات (JSON)
            </button>
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
                <Upload size={18} /> استيراد قاعدة البيانات
                <input type="file" accept=".json" className="hidden" onChange={importData} />
            </label>
        </div>
      </div>
      
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 text-red-600">منطقة الخطر</h3>
            <p className="text-gray-500 text-sm">إجراءات حساسة</p>
        </div>
        <div className="p-6">
            <button className="text-red-600 border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg hover:bg-red-100" onClick={() => { if(confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) { localStorage.clear(); window.location.reload(); } }}>
                مسح جميع البيانات (إعادة ضبط المصنع)
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
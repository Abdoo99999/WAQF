import { Indicator } from './types';

export const GOVERNORATES = [
  "مسقط", "ظفار", "مسندم", "البريمي", "الداخلية", "شمال الباطنة", "جنوب الباطنة", "الظاهرة", "جنوب الشرقية", "شمال الشرقية", "الوسطى"
];

export const OMAN_LOCATIONS: Record<string, string[]> = {
  "مسقط": ["مسقط", "السيب", "مطرح", "بوشر", "العامرات", "قريات"],
  "ظفار": ["صلالة", "طاقة", "مرباط", "رخيوت", "ثمريت", "ضلكوت", "المزيونة", "مقبل", "شليم وجزر الحلانيات", "سدح"],
  "مسندم": ["خصب", "دبا", "بخاء", "مدحاء"],
  "البريمي": ["البريمي", "محضة", "السينة"],
  "الداخلية": ["نزوى", "بهلاء", "منح", "الحمراء", "أدم", "إزكي", "سمائل", "بدبد", "الجبل الأخضر"],
  "شمال الباطنة": ["صحار", "شناص", "لوا", "صحم", "الخابورة", "السويق"],
  "جنوب الباطنة": ["الرستاق", "العوابي", "نخل", "وادي المعاول", "بركاء", "المصنعة"],
  "الظاهرة": ["عبري", "ينقل", "ضنك"],
  "جنوب الشرقية": ["صور", "الكامل والوافي", "جعلان بني بوحسن", "جعلان بني بوعلي", "مصيرة"],
  "شمال الشرقية": ["إبراء", "المضيبي", "بدية", "القابل", "وادي بني خالد", "دماء والطائيين", "سناو"],
  "الوسطى": ["هيماء", "محوت", "الدقم", "الجازر"]
};

export const CURRENT_YEAR = new Date().getFullYear();

// Specific Colors for Ratings 1-5
export const RATING_COLORS: Record<number, string> = {
  1: 'bg-red-900 border-red-900 text-white', // Dark Red
  2: 'bg-red-400 border-red-400 text-white', // Light Red
  3: 'bg-yellow-400 border-yellow-400 text-black', // Yellow
  4: 'bg-green-400 border-green-400 text-white', // Light Green
  5: 'bg-green-800 border-green-800 text-white', // Dark Green
};

// Scoring ranges
export const MATURITY_LEVELS = [
  { label: 'ممتاز', min: 4.5, color: '#10b981' }, // Emerald
  { label: 'جيد جداً', min: 3.5, color: '#3b82f6' }, // Blue
  { label: 'جيد', min: 2.5, color: '#f59e0b' }, // Amber
  { label: 'يحتاج تحسين', min: 1.5, color: '#f97316' }, // Orange
  { label: 'ضعيف', min: 0, color: '#ef4444' }, // Red
];

export const calculateRiskScore = (rec: any): { score: number; label: string; color: string } => {
  let score = 0;
  if (rec.board_status === 'منتهي' || rec.board_status === 'غير موجود') score += 3;
  if (!rec.has_executive_management) score += 2;
  if (!rec.has_auditor_company) score += 2;
  if (!rec.has_financial_report_prev_year) score += 2;
  if (!rec.has_minutes_prev_year) score += 1;
  if (rec.institution_status !== 'فاعلة') score += 3;

  let label = 'منخفض';
  let color = 'bg-green-100 text-green-800'; // Default / Low

  if (score >= 9) {
    label = 'حرج';
    color = 'bg-red-100 text-red-800';
  } else if (score >= 6) {
    label = 'مرتفع';
    color = 'bg-orange-100 text-orange-800';
  } else if (score >= 3) {
    label = 'متوسط';
    color = 'bg-yellow-100 text-yellow-800';
  }

  return { score, label, color };
};

export const DEFAULT_INDICATORS: Indicator[] = [
  // المحور الأول: الشرعي
  { id: 'SH-01', axis: 'الشرعي', text: 'هل يتم إنفاق عائد غلة الوقف على الأغراض التي حددها الواقِفون؟', weight: 1, active: true },
  { id: 'SH-02', axis: 'الشرعي', text: 'هل هناك احترام تام لشروط الوقف وعدم التعديل فيها إلا بفتوى شرعية؟', weight: 1, active: true },
  { id: 'SH-03', axis: 'الشرعي', text: 'هل يتم الالتزام بالمقاصد الشرعية والحفاظ على أصول الوقف وصيانتها للأجيال القادمة؟', weight: 1, active: true },
  { id: 'SH-04', axis: 'الشرعي', text: 'هل توجد رقابة شرعية مستقلة على كافة المعاملات؟', weight: 1, active: true },
  { id: 'SH-05', axis: 'الشرعي', text: 'هل تلتزم المؤسسة بتجنب المعاملات غير الشرعية؟', weight: 1, active: true },
  { id: 'SH-06', axis: 'الشرعي', text: 'هل يتم إصدار تقارير شرعية دورية مستقلة؟', weight: 1, active: true },

  // المحور الثاني: الإجراءات الإدارية والمالية
  { id: 'AD-01', axis: 'الإجراءات الإدارية والمالية', text: 'هل توجد خطة استراتيجية تتضمن رؤية ورسالة المؤسسة والأهداف المقترنة بالخطة مع جدول زمني محدد؟', weight: 1, active: true },
  { id: 'AD-02', axis: 'الإجراءات الإدارية والمالية', text: 'هل توجد مؤشرات قياس واضحة مرتبطة بمشاريع الخطة الخمسية؟', weight: 1, active: true },
  { id: 'AD-03', axis: 'الإجراءات الإدارية والمالية', text: 'هل توجد لوائح داخلية وأدلة إجراءات العمل؟', weight: 1, active: true },
  { id: 'AD-04', axis: 'الإجراءات الإدارية والمالية', text: 'هل يتم تنفيذ المشاريع حسب الآليات المعتمدة وفي المخطط الزمني المحدد؟', weight: 1, active: true },
  { id: 'AD-05', axis: 'الإجراءات الإدارية والمالية', text: 'هل توجد لائحة موارد بشرية معتمدة تتضمن إجراءات التوظيف والترقيات والحوافز وتحسين بيئة العمل وإجراءات نهاية الخدمة؟', weight: 1, active: true },
  { id: 'AD-06', axis: 'الإجراءات الإدارية والمالية', text: 'هل توجد بطاقة وصف وظيفي لكل موظف تحدد مهام ومسؤوليات الوظيفة؟', weight: 1, active: true },
  { id: 'AD-07', axis: 'الإجراءات الإدارية والمالية', text: 'هل يتم تطبيق نظام لتقييم أداء الموظفين بموضوعية؟', weight: 1, active: true },
  { id: 'AD-08', axis: 'الإجراءات الإدارية والمالية', text: 'هل توجد خطة تدريب سنوية لتنفيذ دورات وبرامج لتنمية مهارات الموظفين؟', weight: 1, active: true },
  { id: 'AD-09', axis: 'الإجراءات الإدارية والمالية', text: 'هل توجد ميزانية سنوية جارية ورأسمالية معتمدة؟', weight: 1, active: true },
  { id: 'AD-10', axis: 'الإجراءات الإدارية والمالية', text: 'هل توجد آلية معتمدة للصرف حسب تفويضات مجلس الإدارة؟', weight: 1, active: true },
  { id: 'AD-11', axis: 'الإجراءات الإدارية والمالية', text: 'هل يتم استخدام برامج مالية موثوقة لتوثيق العمليات المالية؟', weight: 1, active: true },
  { id: 'AD-12', axis: 'الإجراءات الإدارية والمالية', text: 'هل خطوات حصول المستفيد على الدعم/الخدمة واضحة ومكتوبة؟', weight: 1, active: true },
  { id: 'AD-13', axis: 'الإجراءات الإدارية والمالية', text: 'هل يتم إجراء استبيانات أو مقابلات لقياس جودة الخدمات؟', weight: 1, active: true },
  { id: 'AD-14', axis: 'الإجراءات الإدارية والمالية', text: 'هل توجد حسابات إعلامية رقمية للمؤسسة، وهل يتم معالجة المقترحات والشكاوى؟', weight: 1, active: true },

  // المحور الثالث: الحوكمة
  { id: 'GOV-01', axis: 'الحوكمة', text: 'هل تم تعيين مكتب تدقيق خارجي معتمد؟', weight: 1, active: true },
  { id: 'GOV-02', axis: 'الحوكمة', text: 'هل يتم إصدار القوائم المالية في المواعيد المحددة؟ وهل يتم الإفصاح عنها؟', weight: 1, active: true },
  { id: 'GOV-03', axis: 'الحوكمة', text: 'هل توجد إجراءات داخلية لمراقبة الإيرادات والمصروفات؟', weight: 1, active: true },
  { id: 'GOV-04', axis: 'الحوكمة', text: 'هل توجد آلية لتقليل المصاريف غير الضرورية؟', weight: 1, active: true },
  { id: 'GOV-05', axis: 'الحوكمة', text: 'هل يوجد نظام فعال لتحصيل الإيجارات والعوائد؟', weight: 1, active: true },
  { id: 'GOV-06', axis: 'الحوكمة', text: 'هل تم تخصيص نسبة الاحتياطي من رأس المال؟', weight: 1, active: true },
  { id: 'GOV-07', axis: 'الحوكمة', text: 'هل توجد سياسة استثمارية تتضمن الأهداف والضوابط الشرعية ومعايير تقييم الاستثمار؟', weight: 1, active: true },
  { id: 'GOV-08', axis: 'الحوكمة', text: 'هل المحفظة الاستثمارية متوافقة مع الشريعة؟', weight: 1, active: true },
  { id: 'GOV-09', axis: 'الحوكمة', text: 'هل توجد لجنة مستقلة للاستثمار؟', weight: 1, active: true },
  { id: 'GOV-10', axis: 'الحوكمة', text: 'هل يتم مراعاة تقليل الاعتماد على نوع واحد من الاستثمار (عقار، أسهم، صناديق...)؟', weight: 1, active: true },
  { id: 'GOV-11', axis: 'الحوكمة', text: 'هل يتم إجراء تحليل دوري للمخاطر الاستثمارية؟', weight: 1, active: true },

  // المحور الرابع: الابتكار والتطوير
  { id: 'INV-01', axis: 'الابتكار والتطوير', text: 'هل يتم تشجيع الأفكار الجديدة من الموظفين والمستفيدين؟', weight: 1, active: true },
  { id: 'INV-02', axis: 'الابتكار والتطوير', text: 'هل يتم مراعاة إدراج الابتكار في أهداف المؤسسة وخططها الاستراتيجية؟', weight: 1, active: true },
  { id: 'INV-03', axis: 'الابتكار والتطوير', text: 'هل يتم تقديم خدمات عبر الإنترنت أو عبر تطبيقات رقمية مبتكرة؟', weight: 1, active: true },
  { id: 'INV-04', axis: 'الابتكار والتطوير', text: 'هل توجد أنظمة إلكترونية ذكية في إدارة الأصول الوقفية؟', weight: 1, active: true },

  // المحور الخامس: الاستدامة
  { id: 'SUS-01', axis: 'الاستدامة', text: 'هل تعتمد المؤسسة على مصادر إيرادات متنوعة مثل: (التبرعات والاستثمار...)؟', weight: 1, active: true },
  { id: 'SUS-02', axis: 'الاستدامة', text: 'ما مدى قدرة المؤسسة على إدارة مواردها بشكل فعّال؟', weight: 1, active: true },
  { id: 'SUS-03', axis: 'الاستدامة', text: 'ما مدى تأثير مشاريع المؤسسة في المجتمعات المستفيدة على المدى البعيد؟', weight: 1, active: true },
  { id: 'SUS-04', axis: 'الاستدامة', text: 'هل المؤسسة تساهم في تمكين المجتمعات المحلية من خلال التعليم والصحة والبرامج التنموية؟', weight: 1, active: true },
  { id: 'SUS-05', axis: 'الاستدامة', text: 'هل تشارك المؤسسة الفئات المستفيدة في تحديد احتياجاتهم؟', weight: 1, active: true }
];
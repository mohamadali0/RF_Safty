
export enum Severity {
  LOW = 'منخفضة',
  MEDIUM = 'متوسطة',
  HIGH = 'عالية',
  CRITICAL = 'حرجة'
}

export enum Department {
  PRODUCTION = 'الإنتاج',
  MAINTENANCE = 'الصيانة',
  LOGISTICS = 'المستودعات',
  QUALITY = 'الجودة',
  ADMINISTRATION = 'الإدارة'
  Project Mangment = 'إدارة المشاريع'
}

export enum Category {
  PPE = 'أدوات الوقاية الشخصية',
  EQUIPMENT = 'سلامة المعدات والأدوات',
  ENVIRONMENT = 'نظافة البيئة والترتيب',
  FIRE_SAFETY = 'السلامة من الحريق',
 Accedent = ' حادث وشيك' 
 chemechal = ' المخاطر الكيميائية'
 ELECTRICAL = 'المخاطر الكهربائية'
 NOTE = ' ملاحظة ايجابية'
ِACTION = ' سلوك غير آمن'
POSITION = ' حالة غير آمنة '
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Violation {
  id: string;
  imageUrl: string;
  date: string;
  location: string;
  department: Department;
  category: Category;
  severity: Severity;
  description: string;
  reporter: string;
  comments: Comment[];
}

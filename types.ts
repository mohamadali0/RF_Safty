
export enum Severity {
  LOW = 'منخفضة',
  MEDIUM = 'متوسطة',
  HIGH = 'عالية',
  CRITICAL = 'حرجة'
}

export enum Department {
  PRODUCTION = 'الإنتاج',
  MAINTENANCE = 'الصيانة',
  LOGISTICS = 'الخدمات اللوجستية',
  QUALITY = 'الجودة',
  ADMINISTRATION = 'الإدارة'
}

export enum Category {
  PPE = 'أدوات الوقاية الشخصية',
  EQUIPMENT = 'سلامة المعدات',
  ENVIRONMENT = 'نظافة البيئة والترتيب',
  FIRE_SAFETY = 'السلامة من الحريق',
  ELECTRICAL = 'المخاطر الكهربائية'
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

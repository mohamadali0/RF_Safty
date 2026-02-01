
import React, { useState } from 'react';
import { MapPin, Building, Calendar, User, MessageCircle, Send, ShieldAlert, Trash2, Edit3, MoreVertical, FileDown, Eye, ImageOff } from 'lucide-react';
import { Violation, Severity } from '../types';
import { exportViolationToPDF } from '../services/exportService';

interface Props {
  violation: Violation;
  userRole: 'safety' | 'guest';
  onAddComment: (violationId: string, text: string) => void;
  onDelete?: (violationId: string) => void;
  onEdit?: (violation: Violation) => void;
  onViewDetails?: (violation: Violation) => void;
}

/**
 * وظيفة لتحويل روابط غوغل درايف إلى روابط صور مباشرة
 */
export const getDirectImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('data:')) return url; // Base64
  
  // تحويل روابط Drive المعروفة إلى صيغة thumbnail أو direct stream
  if (url.includes('drive.google.com')) {
    const fileId = url.match(/[-\w]{25,}/);
    if (fileId) {
      // استخدام رابط الثمنيل بجودة عالية لأنه الأكثر استقراراً في العرض المباشر
      return `https://drive.google.com/thumbnail?id=${fileId[0]}&sz=w1000`;
    }
  }
  return url;
};

const ViolationCard: React.FC<Props> = ({ violation, userRole, onAddComment, onDelete, onEdit, onViewDetails }) => {
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getSeverityColor = (sev: Severity) => {
    switch(sev) {
      case Severity.LOW: return 'bg-blue-100 text-blue-700';
      case Severity.MEDIUM: return 'bg-yellow-100 text-yellow-700';
      case Severity.HIGH: return 'bg-orange-100 text-orange-700';
      case Severity.CRITICAL: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(violation.id, newComment);
      setNewComment('');
    }
  };

  const handleExportPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportViolationToPDF(violation);
    setShowActions(false);
  };

  const displayImage = getDirectImageUrl((violation as any).imageUrl || (violation as any).image_url);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
         {userRole === 'safety' && (
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
                className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors text-slate-600"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showActions && (
                <div className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onViewDetails?.(violation); setShowActions(false); }}
                    className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> عرض التفاصيل
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit?.(violation); setShowActions(false); }}
                    className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" /> تعديل
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" /> تصدير PDF
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('هل أنت متأكد من حذف هذه المخالفة؟')) onDelete?.(violation.id); setShowActions(false); }}
                    className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> حذف
                  </button>
                </div>
              )}
            </div>
         )}
      </div>

      <div className="relative h-48 sm:h-64 overflow-hidden group cursor-pointer bg-slate-100" onClick={() => onViewDetails?.(violation)}>
        {!imgError && displayImage ? (
          <img 
            src={displayImage} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            alt="Violation proof" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <ImageOff className="w-10 h-10" />
            <span className="text-xs font-bold">تعذر تحميل الصورة</span>
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getSeverityColor(violation.severity)}`}>
            {violation.severity}
          </span>
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-200">
            {violation.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-yellow-600" />
          <h3 className="font-bold text-gray-900 leading-tight">
            مخالفة في قسم {violation.department}
          </h3>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {violation.description}
        </p>

        <div className="grid grid-cols-2 gap-y-2 mb-4 text-xs text-gray-500 border-t border-gray-50 pt-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {violation.location}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {violation.date}
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" /> {violation.reporter}
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" /> {violation.department}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-gray-600 text-sm flex items-center gap-2 hover:text-yellow-600 transition-colors font-bold"
          >
            <MessageCircle className="w-5 h-5" />
            {violation.comments ? violation.comments.length : 0} تعليقات
          </button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {violation.comments && violation.comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-700">{comment.author}</span>
                    <span className="text-[10px] text-slate-400">{comment.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{comment.text}</p>
                </div>
              ))}
              {(!violation.comments || violation.comments.length === 0) && (
                <p className="text-[10px] text-slate-400 text-center py-2">لا توجد تعليقات</p>
              )}
            </div>

            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="أضف تعليقاً..."
                className="flex-1 bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
              />
              <button 
                type="submit"
                className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViolationCard;

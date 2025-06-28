export const schoolEmailMapping = {
    'msu.edu': 'Michigan State University',
    'ptnk.edu.vn': 'Phổ Thông Năng Khiếu - ĐHQGHCM'
} as const;

export const getSchoolFromEmail = (email: string) => {
    if (email.indexOf('@') < 0) return '';
    const domain = email.trim().split('@')[1].toLowerCase();
    if (!domain) return '';
    return schoolEmailMapping[domain as keyof typeof schoolEmailMapping] || '';
}
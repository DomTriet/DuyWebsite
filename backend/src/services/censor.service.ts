// Bộ từ khóa cấm/tiêu cực thực tế
const BAD_WORDS = ['scam', 'lừa đảo', 'chiếm đoạt', 'cướp', 'địt', 'vcl', 'đm']; 

// Lọc các link website không nằm trong whitelist (phòng chống đối thủ câu kéo)
// Mặc định tìm mọi url có http/https
const SPAM_LINK_REGEX = /(http|https):\/\/[^\s]+/gi;

/**
 * Kiểm duyệt và làm mờ các từ khóa cấm
 */
export const censorContent = (content: string): string => {
  let censored = content;
  BAD_WORDS.forEach((word) => {
    // Sử dụng \b để giới hạn từ (Word boundary) - chỉ áp dụng với tiếng Anh/không dấu tốt
    const regex = new RegExp(word, 'gi'); 
    censored = censored.replace(regex, '***');
  });
  return censored;
};

/**
 * Kiểm tra xem bài đăng có chứa link rác hay không
 */
export const hasSpamLinks = (content: string): boolean => {
  const whitelistDomains = ['bdsdiemtam.com', 'youtube.com']; // domain của dự án
  // Trả về true nếu phát hiện có chèn link
  const matches = content.match(SPAM_LINK_REGEX);
  if (!matches) return false;
  
  // Kiểm tra xem có link nào không nằm trong whitelist không
  return matches.some(link => !whitelistDomains.some(domain => link.includes(domain)));
};
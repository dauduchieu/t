// 1. Đăng ký Service Worker (Bắt buộc cho PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker Registered'))
        .catch(err => console.log('SW Fail:', err));
}

// 2. Set giá trị mặc định cho ô thời gian là hiện tại
const timeInput = document.getElementById('event-time');
const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Chỉnh về giờ địa phương
timeInput.value = now.toISOString().slice(0, 16);

// 3. Xử lý logic tạo file .ics
document.getElementById('btn-create').addEventListener('click', () => {
    const title = document.getElementById('event-title').value || "Sự kiện mới";
    const dateVal = new Date(timeInput.value);
    
    // Tạo sự kiện dài 1 tiếng
    const endDate = new Date(dateVal.getTime() + 60 * 60 * 1000); 

    downloadICS(title, dateVal, endDate);
});

function downloadICS(summary, startDate, endDate) {
    // Format thời gian chuẩn iCalendar: YYYYMMDDTHHmmssZ
    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');

    const start = formatDate(startDate);
    const end = formatDate(endDate);
    
    // Nội dung file .ics (Có VALARM để thông báo)
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Demo PWA//VN
BEGIN:VEVENT
UID:${Date.now()}@demo.pwa
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:${summary}
DESCRIPTION:Tạo từ PWA của tôi
BEGIN:VALARM
TRIGGER:-PT0M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    // Tạo file ảo và click tải về
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'invite.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
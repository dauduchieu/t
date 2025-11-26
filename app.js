// app.js NÂNG CẤP

// 1. Đăng ký Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('SW Registered'));
}

// 2. Setup thời gian mặc định
const timeInput = document.getElementById('event-time');
const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
timeInput.value = now.toISOString().slice(0, 16);

// 3. Xử lý sự kiện bấm nút
document.getElementById('btn-create').addEventListener('click', () => {
    const title = document.getElementById('event-title').value || "Sự kiện mới";
    const dateVal = new Date(timeInput.value);
    const endDate = new Date(dateVal.getTime() + 60 * 60 * 1000); // Mặc định 1 tiếng

    // Kiểm tra hệ điều hành
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Logic riêng cho Android: Dùng Google Calendar Link
    // (Kiểm tra xem có chữ "android" trong userAgent không)
    if (/android/i.test(userAgent)) {
        openGoogleCalendar(title, dateVal, endDate);
    } else {
        // iOS và PC: Dùng file .ics
        downloadICS(title, dateVal, endDate);
    }
});

// Hàm mở Google Calendar (Tối ưu cho Android)
function openGoogleCalendar(title, startDate, endDate) {
    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    
    // Tạo link Google Calendar
    // action=TEMPLATE: Mở giao diện tạo mới
    // text: Tiêu đề
    // dates: Thời gian bắt đầu / kết thúc
    // details: Mô tả
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent("Tạo từ PWA")}`;
    
    // Mở tab mới
    window.open(url, '_blank');
}

// Hàm tải file .ics (Tối ưu cho iOS)
function downloadICS(summary, startDate, endDate) {
    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//My PWA//VN
BEGIN:VEVENT
UID:${Date.now()}@mypwa
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:${summary}
DESCRIPTION:Tạo từ PWA
BEGIN:VALARM
TRIGGER:-PT0M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'invite.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
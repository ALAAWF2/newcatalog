// نظام الإشعارات المتكامل
document.addEventListener('DOMContentLoaded', function() {
  // إضافة زر الإشعارات إلى شريط التنقل
  const navbar = document.querySelector('.navbar-nav');
  if (navbar) {
    const notificationsButton = document.createElement('div');
    notificationsButton.className = 'nav-link';
    notificationsButton.id = 'notificationsButton';
    notificationsButton.style.cursor = 'pointer';
    notificationsButton.style.position = 'relative';
    notificationsButton.innerHTML = `
      <i class="fas fa-bell"></i>
      <span class="notification-badge" id="notificationCount" style="display: none;">0</span>
    `;
    notificationsButton.onclick = toggleNotificationsPanel;
    
    // إضافة الزر قبل زر تسجيل الدخول
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      navbar.insertBefore(notificationsButton, loginBtn);
    } else {
      navbar.appendChild(notificationsButton);
    }
    
    // إنشاء لوحة الإشعارات
    const notificationsPanel = document.createElement('div');
    notificationsPanel.id = 'notificationsPanel';
    notificationsPanel.className = 'notifications-panel';
    notificationsPanel.style.display = 'none';
    notificationsPanel.innerHTML = `
      <div class="notifications-header">
        <h3>الإشعارات</h3>
        <button class="btn btn-sm" onclick="markAllAsRead()">
          <i class="fas fa-check-double"></i>
          تعيين الكل كمقروء
        </button>
      </div>
      <div class="notifications-list" id="notificationsList"></div>
    `;
    
    // إضافة لوحة الإشعارات إلى الصفحة
    document.body.appendChild(notificationsPanel);
    
    // إخفاء لوحة الإشعارات عند النقر خارجها
    document.addEventListener('click', function(event) {
      if (!notificationsButton.contains(event.target) && 
          !notificationsPanel.contains(event.target) && 
          notificationsPanel.style.display === 'block') {
        notificationsPanel.style.display = 'none';
      }
    });
  }
  
  // تحميل الإشعارات عند تسجيل الدخول
  auth.onAuthStateChanged(user => {
    if (user) {
      loadNotifications();
      
      // تحقق من وجود إشعارات جديدة كل دقيقة
      setInterval(checkForNewNotifications, 60000);
    }
  });
});

// فتح/إغلاق لوحة الإشعارات
function toggleNotificationsPanel() {
  const panel = document.getElementById('notificationsPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  
  // تعيين الإشعارات كمقروءة عند فتح اللوحة
  if (panel.style.display === 'block') {
    updateNotificationReadStatus();
  }
}

// تحميل الإشعارات
function loadNotifications() {
  if (!auth.currentUser) return;
  
  const userId = auth.currentUser.uid;
  const notificationsList = document.getElementById('notificationsList');
  
  // الحصول على الإشعارات من localStorage
  let notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
  
  // إضافة إشعارات النظام الافتراضية
  if (notifications.length === 0) {
    const defaultNotifications = generateDefaultNotifications();
    notifications = [...defaultNotifications];
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  }
  
  // عرض الإشعارات
  if (notifications.length === 0) {
    notificationsList.innerHTML = '<div class="empty-notification">لا توجد إشعارات</div>';
  } else {
    notificationsList.innerHTML = '';
    
    notifications.forEach((notification, index) => {
      const notificationElement = document.createElement('div');
      notificationElement.className = `notification-item ${notification.read ? '' : 'unread'}`;
      notificationElement.innerHTML = `
        <div class="notification-icon ${notification.type}">
          <i class="fas ${getNotificationIcon(notification.type)}"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-message">${notification.message}</div>
          <div class="notification-time">${formatNotificationTime(notification.time)}</div>
        </div>
        <div class="notification-actions">
          <button class="btn btn-sm" onclick="deleteNotification(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      
      notificationsList.appendChild(notificationElement);
    });
  }
  
  // تحديث عدد الإشعارات غير المقروءة
  updateNotificationCount(notifications);
}

// إنشاء إشعارات افتراضية للنظام
function generateDefaultNotifications() {
  const now = Date.now();
  return [
    {
      title: "مرحباً بك في النظام المحدث",
      message: "تم تحديث النظام بميزات جديدة. اكتشف الوضع المظلم ونظام المفضلة والبحث المتقدم.",
      type: "info",
      time: now,
      read: false
    },
    {
      title: "تنبيه المخزون",
      message: "يوجد 5 منتجات وصلت لحد المخزون الأدنى. يرجى التحقق من قائمة المنتجات.",
      type: "warning",
      time: now - 3600000, // قبل ساعة
      read: false
    },
    {
      title: "طلبية جديدة",
      message: "تم استلام طلبية جديدة من معرض الرياض. يرجى مراجعة صفحة الطلبات.",
      type: "success",
      time: now - 86400000, // قبل يوم
      read: true
    }
  ];
}

// الحصول على أيقونة الإشعار حسب النوع
function getNotificationIcon(type) {
  switch (type) {
    case 'success': return 'fa-check-circle';
    case 'warning': return 'fa-exclamation-triangle';
    case 'error': return 'fa-exclamation-circle';
    case 'info': default: return 'fa-info-circle';
  }
}

// تنسيق وقت الإشعار
function formatNotificationTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  // أقل من دقيقة
  if (diff < 60000) {
    return 'الآن';
  }
  
  // أقل من ساعة
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
  }
  
  // أقل من يوم
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  }
  
  // أقل من أسبوع
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
  }
  
  // تاريخ كامل
  const date = new Date(timestamp);
  return date.toLocaleDateString('ar-SA');
}

// تحديث عدد الإشعارات غير المقروءة
function updateNotificationCount(notifications) {
  const unreadCount = notifications.filter(n => !n.read).length;
  const countElement = document.getElementById('notificationCount');
  
  if (unreadCount > 0) {
    countElement.textContent = unreadCount;
    countElement.style.display = 'flex';
  } else {
    countElement.style.display = 'none';
  }
}

// تعيين الإشعارات كمقروءة عند فتح اللوحة
function updateNotificationReadStatus() {
  if (!auth.currentUser) return;
  
  const userId = auth.currentUser.uid;
  let notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
  
  // تعيين جميع الإشعارات كمقروءة
  let updated = false;
  notifications.forEach(notification => {
    if (!notification.read) {
      notification.read = true;
      updated = true;
    }
  });
  
  if (updated) {
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
    updateNotificationCount(notifications);
    
    // تحديث عرض الإشعارات
    document.querySelectorAll('.notification-item').forEach(item => {
      item.classList.remove('unread');
    });
  }
}

// تعيين جميع الإشعارات كمقروءة
function markAllAsRead() {
  if (!auth.currentUser) return;
  
  const userId = auth.currentUser.uid;
  let notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
  
  notifications.forEach(notification => {
    notification.read = true;
  });
  
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  updateNotificationCount(notifications);
  
  // تحديث عرض الإشعارات
  document.querySelectorAll('.notification-item').forEach(item => {
    item.classList.remove('unread');
  });
  
  showToast("تم تعيين جميع الإشعارات كمقروءة", "success");
}

// حذف إشعار
function deleteNotification(index) {
  if (!auth.currentUser) return;
  
  const userId = auth.currentUser.uid;
  let notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
  
  notifications.splice(index, 1);
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  
  // إعادة تحميل الإشعارات
  loadNotifications();
  
  showToast("تم حذف الإشعار", "success");
}

// إضافة إشعار جديد
function addNotification(title, message, type = 'info') {
  if (!auth.currentUser) return;
  
  const userId = auth.currentUser.uid;
  let notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
  
  const newNotification = {
    title,
    message,
    type,
    time: Date.now(),
    read: false
  };
  
  notifications.unshift(newNotification);
  
  // الاحتفاظ بآخر 50 إشعار فقط
  if (notifications.length > 50) {
    notifications = notifications.slice(0, 50);
  }
  
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  
  // تحديث عرض الإشعارات إذا كانت اللوحة مفتوحة
  if (document.getElementById('notificationsPanel').style.display === 'block') {
    loadNotifications();
  } else {
    // تحديث العداد فقط
    updateNotificationCount(notifications);
  }
}

// التحقق من وجود إشعارات جديدة
function checkForNewNotifications() {
  if (!auth.currentUser) return;
  
  // هنا يمكن إضافة منطق للتحقق من وجود إشعارات جديدة من الخادم
  // في هذا المثال، سنقوم بإنشاء إشعارات تلقائية للمنتجات منخفضة المخزون
  
  const lowStockProducts = data.filter(p => p.stock < 10);
  
  if (lowStockProducts.length > 0) {
    // إنشاء إشعار للمنتجات منخفضة المخزون
    const randomProduct = lowStockProducts[Math.floor(Math.random() * lowStockProducts.length)];
    
    addNotification(
      "تنبيه المخزون",
      `المنتج "${randomProduct.name}" وصل للحد الأدنى (${randomProduct.stock} قطع متبقية).`,
      "warning"
    );
  }
}

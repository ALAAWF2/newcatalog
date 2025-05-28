// نظام الوضع المظلم (Dark Mode)
document.addEventListener('DOMContentLoaded', function() {
  // إضافة زر التبديل بين الوضعين إلى شريط التنقل
  const navbar = document.querySelector('.navbar-nav');
  if (navbar) {
    const themeToggle = document.createElement('button');
    themeToggle.id = 'themeToggle';
    themeToggle.className = 'btn btn-outline';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.setAttribute('title', 'تبديل الوضع المظلم');
    themeToggle.onclick = toggleTheme;
    navbar.appendChild(themeToggle);
  }
  
  // تطبيق الوضع المحفوظ
  applyTheme();
});

// وظيفة تبديل الوضع
function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  localStorage.setItem('theme', newTheme);
  applyTheme();
  
  // عرض إشعار
  if (typeof showToast === 'function') {
    showToast(`تم التبديل إلى الوضع ${newTheme === 'dark' ? 'المظلم' : 'الفاتح'}`, 'info');
  }
}

// وظيفة تطبيق الوضع
function applyTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  const themeToggle = document.getElementById('themeToggle');
  
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      themeToggle.setAttribute('title', 'تبديل الوضع الفاتح');
    }
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      themeToggle.setAttribute('title', 'تبديل الوضع المظلم');
    }
  }
}

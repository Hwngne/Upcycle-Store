import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

// Import các trang con
import '../pages/club/club_home_page.dart'; // File mới tách ra
import '../pages/common/forum_page.dart'; // Trang Diễn đàn (có sẵn của bạn)
import '../pages/common/camera_ai_page.dart'; // Trang Camera (có sẵn của bạn)
import '../pages/club/blog_page.dart'; // Trang Blog (bạn tạo sau)
import '../pages/common/profile_page.dart'; // Trang Profile (tách riêng cho gọn)

class ClubLayout extends StatefulWidget {
  const ClubLayout({super.key});

  @override
  State<ClubLayout> createState() => _ClubLayoutState();
}

class _ClubLayoutState extends State<ClubLayout> {
  int _currentIndex = 0;

  // Danh sách các màn hình con
  final List<Widget> _pages = [
    const ClubHomePage(), // Tab 0: Trang chủ CLB 
    const ForumPage(), // Tab 1: Diễn đàn 
    const CameraAIPage(), // Tab 2: Camera 
    const BlogPage(), // Tab 3: Blog 
    const ProfilePage(), // Tab 4: Hồ sơ CLB 
  ];

  void _onItemTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,

      // 1. NỀN GRADIENT 
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            stops: [0.0, 0.54, 1.0],
            colors: [Color(0xFFF3DDDD), Color(0xFFFFFFFF), Color(0xFFE5EFFF)],
          ),
        ),
        child: SafeArea(bottom: false, child: _pages[_currentIndex]),
      ),

      // 2. MENU DƯỚI (Cong & Nổi khối)
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(30.0),
            topRight: Radius.circular(30.0),
          ),
          child: BottomAppBar(
            padding: const EdgeInsets.symmetric(horizontal: 15),
            height: 70,
            color: const Color(0xFF1A237E), 
            shape: const CircularNotchedRectangle(), 
            notchMargin: 8,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                _buildNavItem(0, _iconHome, "Trang chủ"),
                _buildNavItem(1, _iconForum, "Diễn đàn"),
                const SizedBox(width: 40), // Khoảng trống cho nút Camera
                _buildNavItem(3, _iconBlog, "Blog"), 
                _buildNavItem(4, _iconProfile, "Hồ sơ"),
              ],
            ),
          ),
        ),
      ),

      // 3. NÚT CAMERA TRÒN Ở GIỮA
      floatingActionButton: SizedBox(
        width: 65,
        height: 65,
        child: FloatingActionButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const CameraAIPage(), 
                fullscreenDialog: true, 
              ),
            );
          },
          backgroundColor: const Color(0xFF1A237E),
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(50),
            side: BorderSide(color: Colors.white.withOpacity(0.1), width: 1),
          ),
          child: SvgPicture.string(
            _iconScan,
            width: 28,
            colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  // Widget vẽ icon menu
  Widget _buildNavItem(int index, String svgPath, String label) {
    bool isSelected = _currentIndex == index;
    return InkWell(
      onTap: () => _onItemTapped(index),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SvgPicture.string(
            svgPath,
            width: 24,
            height: 24,
            colorFilter: ColorFilter.mode(
              isSelected
                  ? const Color(0xFFFF6B6B)
                  : Colors.white.withOpacity(0.6),
              BlendMode.srcIn,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: isSelected ? Colors.white : Colors.transparent,
            ),
          ),
        ],
      ),
    );
  }

  // SVG Data (Home, Forum, Scan, Blog, Profile)
  final String _iconHome =
      '''<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>''';
  final String _iconForum =
      '''<svg viewBox="0 0 32 23"><path fill="currentColor" d="M3.6 2.8C3.6 2.05739 3.895 1.3452 4.4201 0.820101C4.9452 0.294999 5.65739 0 6.4 0C7.14261 0 7.8548 0.294999 8.3799 0.820101C8.905 1.3452 9.2 2.05739 9.2 2.8C9.2 3.54261 8.905 4.2548 8.3799 4.7799C7.8548 5.305 7.14261 5.6 6.4 5.6C5.65739 5.6 4.9452 5.305 4.4201 4.7799C3.895 4.2548 3.6 3.54261 3.6 2.8ZM3.2 10.685C2.7 11.245 2.4 11.99 2.4 12.8C2.4 13.61 2.7 14.355 3.2 14.915V10.685ZM10.42 8.22C8.935 9.535 8 11.46 8 13.6C8 15.315 8.6 16.89 9.6 18.125V19.2C9.6 20.085 8.885 20.8 8 20.8H4.8C3.915 20.8 3.2 20.085 3.2 19.2V17.86C1.31 16.96 0 15.035 0 12.8C0 9.705 2.505 7.2 5.6 7.2H7.2C8.4 7.2 9.51 7.575 10.42 8.215V8.22ZM22.4 19.2V18.125C23.4 16.89 24 15.315 24 13.6C24 11.46 23.065 9.535 21.58 8.215C22.49 7.575 23.6 7.2 24.8 7.2H26.4C29.495 7.2 32 9.705 32 12.8C32 15.035 30.69 16.96 28.8 17.86V19.2C28.8 20.085 28.085 20.8 27.2 20.8H24C23.115 20.8 22.4 20.085 22.4 19.2ZM22.8 2.8C22.8 2.05739 23.095 1.3452 23.6201 0.820101C24.1452 0.294999 24.8574 0 25.6 0C26.3426 0 27.0548 0.294999 27.5799 0.820101C28.105 1.3452 28.4 2.05739 28.4 2.8C28.4 3.54261 28.105 4.2548 27.5799 4.7799C27.0548 5.305 26.3426 5.6 25.6 5.6C24.8574 5.6 24.1452 5.305 23.6201 4.7799C23.095 4.2548 22.8 3.54261 22.8 2.8ZM28.8 10.685V14.92C29.3 14.355 29.6 13.615 29.6 12.805C29.6 11.995 29.3 11.25 28.8 10.69V10.685ZM16 0C16.8487 0 17.6626 0.337142 18.2627 0.937258C18.8629 1.53737 19.2 2.35131 19.2 3.2C19.2 4.04869 18.8629 4.86263 18.2627 5.46274C17.6626 6.06286 16.8487 6.4 16 6.4C15.1513 6.4 14.3374 6.06286 13.7373 5.46274C13.1371 4.86263 12.8 4.04869 12.8 3.2C12.8 2.35131 13.1371 1.53737 13.7373 0.937258C14.3374 0.337142 15.1513 0 16 0ZM12 13.6C12 14.41 12.3 15.15 12.8 15.715V11.485C12.3 12.05 12 12.79 12 13.6ZM19.2 11.485V15.72C19.7 15.155 20 14.415 20 13.605C20 12.795 19.7 12.05 19.2 11.49V11.485ZM22.4 13.6C22.4 15.835 21.09 17.76 19.2 18.66V20.8C19.2 21.685 18.485 22.4 17.6 22.4H14.4C13.515 22.4 12.8 21.685 12.8 20.8V18.66C10.91 17.76 9.6 15.835 9.6 13.6C9.6 10.505 12.105 8 15.2 8H16.8C19.895 8 22.4 10.505 22.4 13.6Z"/></svg>''';
  final String _iconScan =
      '''<svg viewBox="0 0 24 24"><path fill="currentColor" d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>''';
  final String _iconBlog =
      '''<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path fill="currentColor" d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>''';
  final String _iconProfile =
      '''<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>''';
}

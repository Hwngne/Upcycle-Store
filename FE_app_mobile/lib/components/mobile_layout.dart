import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../pages/student/student_home.dart';
import '../pages/common/forum_page.dart';
import '../pages/student/rank_page.dart';
import '../pages/common/profile_page.dart';
import '../pages/common/camera_ai_page.dart';
import 'package:bot_toast/bot_toast.dart';
import '../services/socket_service.dart';
import '../services/user_service.dart';
import '../pages/club/club_home_page.dart';
import '../services/notification_service.dart';

class MobileLayout extends StatefulWidget {
  const MobileLayout({super.key});

  @override
  State<MobileLayout> createState() => _MobileLayoutState();
}

class _MobileLayoutState extends State<MobileLayout> {
  int _currentIndex = 0;

  List<Widget> get _pages {
    String role = UserData.role ?? "student";
    Widget homePage;
    if (role == "club") {
      homePage = const ClubHomePage();
    } else {
      homePage = const StudentHome();
    }

    return [
      homePage, // Tab 0: Tự động đổi theo Role
      const ForumPage(), // Tab 1: Diễn đàn
      const CameraAIPage(), // Tab 2: Scan
      const RankPage(), // Tab 3: BXH
      const ProfilePage(), // Tab 4: Hồ sơ
    ];
  }

  @override
  void initState() {
    super.initState();
    _initGlobalSocket();
  }

  void _initGlobalSocket() {
    if (UserData.id == null) return;

    final socketService = SocketService();
    socketService.initSocket(UserData.id!);

    final socket = socketService.socket;
    if (socket == null) return;

    socket.on('receive_message', (data) {
      dynamic senderData = data['sender'] ?? data['senderId'];
      String msgSenderId = (senderData is Map)
          ? senderData['_id'].toString()
          : senderData.toString();
      msgSenderId = msgSenderId.replaceAll('"', '').trim();

      String currentMyId = (UserData.id ?? "").replaceAll('"', '').trim();

      // Nếu KHÔNG PHẢI MÌNH gửi
      if (msgSenderId != currentMyId) {
        List<String> ids = [currentMyId, msgSenderId];
        ids.sort();
        String incomingRoomId = ids.join("_");

        // Nếu KHÔNG Ở TRONG PHÒNG CHAT ĐÓ -> Bắn Toast
        if (socketService.currentChatRoomId != incomingRoomId) {
          NotificationService.unreadCountNotifier.value++;

          BotToast.showNotification(
            leading: (cancel) => CircleAvatar(
              backgroundColor: Colors.blue.shade100,
              child: const Icon(Icons.message, color: Colors.blue),
            ),
            title: (_) => const Text(
              "Tin nhắn mới",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A237E),
              ),
            ),
            subtitle: (_) => Text(
              data['content'] ?? "Bạn có tin nhắn mới",
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            trailing: (cancel) => IconButton(
              icon: const Icon(Icons.close, color: Colors.grey),
              onPressed: cancel,
            ),
            duration: const Duration(seconds: 4),
            backgroundColor: Colors.white,
            borderRadius: 15.0,
            margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 30),
            onTap: () {},
          );
        }
      }
    });
  }

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

      // 2. MENU DƯỚI (Bottom Navigation)
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
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
                const SizedBox(width: 40),
                _buildNavItem(3, _iconRank, "BXH"),
                _buildNavItem(4, _iconProfile, "Hồ sơ"),
              ],
            ),
          ),
        ),
      ),

      // 3. NÚT SCAN TRÒN Ở GIỮA
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
            side: BorderSide(
              color: Colors.white.withValues(alpha: 0.1),
              width: 1,
            ),
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

  // Widget con để vẽ từng nút trong menu
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
                  : Colors.white.withValues(alpha: 0.6),
              BlendMode.srcIn,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: isSelected
                  ? Colors.white
                  : Colors.white.withValues(alpha: 0.0),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    final socketService = SocketService();
    if (socketService.socket != null) {
      socketService.socket!.off('receive_message');
    }
    super.dispose();
  }

  // SVG Data
  final String _iconHome =
      '''<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>''';
  final String _iconForum =
      '''<svg viewBox="0 0 32 23"><path fill="currentColor" d="M3.6 2.8C3.6 2.05739 3.895 1.3452 4.4201 0.820101C4.9452 0.294999 5.65739 0 6.4 0C7.14261 0 7.8548 0.294999 8.3799 0.820101C8.905 1.3452 9.2 2.05739 9.2 2.8C9.2 3.54261 8.905 4.2548 8.3799 4.7799C7.8548 5.305 7.14261 5.6 6.4 5.6C5.65739 5.6 4.9452 5.305 4.4201 4.7799C3.895 4.2548 3.6 3.54261 3.6 2.8ZM3.2 10.685C2.7 11.245 2.4 11.99 2.4 12.8C2.4 13.61 2.7 14.355 3.2 14.915V10.685ZM10.42 8.22C8.935 9.535 8 11.46 8 13.6C8 15.315 8.6 16.89 9.6 18.125V19.2C9.6 20.085 8.885 20.8 8 20.8H4.8C3.915 20.8 3.2 20.085 3.2 19.2V17.86C1.31 16.96 0 15.035 0 12.8C0 9.705 2.505 7.2 5.6 7.2H7.2C8.4 7.2 9.51 7.575 10.42 8.215V8.22ZM22.4 19.2V18.125C23.4 16.89 24 15.315 24 13.6C24 11.46 23.065 9.535 21.58 8.215C22.49 7.575 23.6 7.2 24.8 7.2H26.4C29.495 7.2 32 9.705 32 12.8C32 15.035 30.69 16.96 28.8 17.86V19.2C28.8 20.085 28.085 20.8 27.2 20.8H24C23.115 20.8 22.4 20.085 22.4 19.2ZM22.8 2.8C22.8 2.05739 23.095 1.3452 23.6201 0.820101C24.1452 0.294999 24.8574 0 25.6 0C26.3426 0 27.0548 0.294999 27.5799 0.820101C28.105 1.3452 28.4 2.05739 28.4 2.8C28.4 3.54261 28.105 4.2548 27.5799 4.7799C27.0548 5.305 26.3426 5.6 25.6 5.6C24.8574 5.6 24.1452 5.305 23.6201 4.7799C23.095 4.2548 22.8 3.54261 22.8 2.8ZM28.8 10.685V14.92C29.3 14.355 29.6 13.615 29.6 12.805C29.6 11.995 29.3 11.25 28.8 10.69V10.685ZM16 0C16.8487 0 17.6626 0.337142 18.2627 0.937258C18.8629 1.53737 19.2 2.35131 19.2 3.2C19.2 4.04869 18.8629 4.86263 18.2627 5.46274C17.6626 6.06286 16.8487 6.4 16 6.4C15.1513 6.4 14.3374 6.06286 13.7373 5.46274C13.1371 4.86263 12.8 4.04869 12.8 3.2C12.8 2.35131 13.1371 1.53737 13.7373 0.937258C14.3374 0.337142 15.1513 0 16 0ZM12 13.6C12 14.41 12.3 15.15 12.8 15.715V11.485C12.3 12.05 12 12.79 12 13.6ZM19.2 11.485V15.72C19.7 15.155 20 14.415 20 13.605C20 12.795 19.7 12.05 19.2 11.49V11.485ZM22.4 13.6C22.4 15.835 21.09 17.76 19.2 18.66V20.8C19.2 21.685 18.485 22.4 17.6 22.4H14.4C13.515 22.4 12.8 21.685 12.8 20.8V18.66C10.91 17.76 9.6 15.835 9.6 13.6C9.6 10.505 12.105 8 15.2 8H16.8C19.895 8 22.4 10.505 22.4 13.6Z"/></svg>''';
  final String _iconScan =
      '''<svg viewBox="0 0 24 24"><path fill="currentColor" d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>''';
  final String _iconRank =
      '''<svg viewBox="0 0 32 26"><path fill="currentColor" d="M17.69 2.7069L16.51 0.3169C16.315 -0.0981 15.705 -0.1131 15.49 0.3169L14.31 2.7069L11.695 3.0819C11.23 3.1519 11.03 3.7269 11.375 4.0719L13.275 5.9219L12.825 8.5269C12.755 8.9919 13.235 9.3519 13.665 9.1369L16.01 7.8969L18.34 9.1169C18.77 9.3319 19.255 8.9719 19.18 8.5069L18.73 5.9019L20.63 4.0719C20.97 3.7319 20.775 3.1569 20.31 3.0819L17.695 2.7069H17.69ZM12.8 12.8019C11.915 12.8019 11.2 13.5169 11.2 14.4019V24.0019C11.2 24.8869 11.915 25.6019 12.8 25.6019H19.2C20.085 25.6019 20.8 24.8869 20.8 24.0019V14.4019C20.8 13.5169 20.085 12.8019 19.2 12.8019H12.8ZM1.6 16.0019C0.715 16.0019 0 16.7169 0 17.6019V24.0019C0 24.8869 0.715 25.6019 1.6 25.6019H8C8.885 25.6019 9.6 24.8869 9.6 24.0019V17.6019C9.6 16.7169 8.885 16.0019 8 16.0019H1.6ZM22.4 20.8019V24.0019C22.4 24.8869 23.115 25.6019 24 25.6019H30.4C31.285 25.6019 32 24.8869 32 24.0019V20.8019C32 19.9169 31.285 19.2019 30.4 19.2019H24C23.115 19.2019 22.4 19.9169 22.4 20.8019Z"/></svg>''';
  final String _iconProfile =
      '''<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>''';
}

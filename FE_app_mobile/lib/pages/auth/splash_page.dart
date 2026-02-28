import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../services/user_service.dart';
import 'login_page.dart';
import '../../components/mobile_layout.dart'; // Của Sinh viên
import '../../components/club_layout.dart'; // Của CLB (Mới thêm)

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  // Hàm kiểm tra
  void _checkLoginStatus() async {
    // Chờ 2 giây cho đẹp
    await Future.delayed(const Duration(seconds: 2));

    // Gọi hàm kiểm tra từ AuthService (Code cũ của bạn)
    bool isLoggedIn = await AuthService.tryAutoLogin();

    if (!mounted) return;

    if (isLoggedIn) {
      if (UserData.role == 'club') {
        // Nếu là CLB -> Vào ClubLayout
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const ClubLayout()),
        );
      } else {
        // Nếu là Sinh viên (hoặc khác) -> Vào MobileLayout (Giữ nguyên logic cũ)
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const MobileLayout()),
        );
      }
    } else {
      // Nếu chưa đăng nhập -> Vào trang đăng nhập (Giữ nguyên)
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Giữ nguyên giao diện loading cũ của bạn
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.eco, size: 80, color: Colors.green),
            SizedBox(height: 20),
            CircularProgressIndicator(),
            SizedBox(height: 10),
            Text("Đang tải dữ liệu...", style: TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}

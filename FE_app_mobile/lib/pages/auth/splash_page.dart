import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../services/user_service.dart';
import 'login_page.dart';
import '../../components/mobile_layout.dart';
import '../../components/club_layout.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'onboarding_page.dart';

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
    await Future.delayed(const Duration(seconds: 2));

    final prefs = await SharedPreferences.getInstance();
    bool hasSeenOnboarding = prefs.getBool('has_seen_onboarding') ?? false;
    bool isLoggedIn = await AuthService.tryAutoLogin();

    if (!mounted) return;

    if (!hasSeenOnboarding) {
      // Lần đầu tiên mở app -> Vào Onboarding
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const OnboardingPage()),
      );
    } else if (isLoggedIn) {
      // Đã đăng nhập -> Vào Layout tương ứng
      if (UserData.role == 'club') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const ClubLayout()),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const MobileLayout()),
        );
      }
    } else {
      // Chưa đăng nhập  -> Vào thẳng LoginPage
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon màu Đỏ chủ đạo, có viền mờ cho xịn
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFB71C1C).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.recycling_rounded,
                size: 80,
                color: Color(0xFFB71C1C),
              ),
            ),
            const SizedBox(height: 24),

            // Tên App
            const Text(
              "UpcycleStore",
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Color(0xFFB71C1C),
                letterSpacing: 1.5,
              ),
            ),

            const SizedBox(height: 40),

            // Loading màu đỏ
            const CircularProgressIndicator(color: Color(0xFFB71C1C)),
            const SizedBox(height: 16),
            const Text(
              "Đang tải dữ liệu...",
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}
